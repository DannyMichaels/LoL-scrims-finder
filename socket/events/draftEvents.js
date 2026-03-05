const Draft = require('../../models/draft.model');
const draftEngine = require('../../services/draftEngine.services');
const championsService = require('../../services/champions.services');

// Active timers: Map<draftId, timerId>
const activeTimers = new Map();

// Pending selections: Map<draftId, { championId, championName, socketId }>
const pendingSelections = new Map();

/**
 * Clear an existing timer for a draft.
 */
const clearDraftTimer = (draftId) => {
  const id = draftId.toString();
  if (activeTimers.has(id)) {
    clearTimeout(activeTimers.get(id));
    activeTimers.delete(id);
  }
};

/**
 * Start a timer for the current action. On expiry, auto-complete.
 */
const startActionTimer = (io, draftId, timerDuration) => {
  const id = draftId.toString();
  clearDraftTimer(id);

  const expiresAt = new Date(Date.now() + timerDuration * 1000);

  // Persist timerExpiresAt so clients can resume on refresh
  Draft.findByIdAndUpdate(draftId, { timerExpiresAt: expiresAt }).catch(() => {});

  // Emit timer start
  io.to(`draft_${id}`).emit('draft:timer_start', {
    expiresAt: expiresAt.toISOString(),
    durationMs: timerDuration * 1000,
  });

  const timer = setTimeout(async () => {
    activeTimers.delete(id);
    try {
      const draft = await Draft.findById(draftId);
      if (!draft || draft.status !== 'in_progress') return;

      // Check if a player had a champion selected (pending hover)
      const pending = pendingSelections.get(id);
      pendingSelections.delete(id);

      if (pending?.championId) {
        // Validate the pending selection is still legal
        const currentAction = draft.actions[draft.currentActionIndex];
        const validation = draftEngine.validateAction(
          draft,
          pending.championId,
          currentAction?.team,
          null
        );

        if (validation.valid) {
          // Use the pending selection instead of random
          const { draft: updatedDraft, completed } =
            await draftEngine.applyAction(
              draft,
              pending.championId,
              pending.championName,
              null
            );

          const appliedAction = updatedDraft.actions[updatedDraft.currentActionIndex - 1];
          if (appliedAction) appliedAction.wasAutoCompleted = true;
          await updatedDraft.save();

          io.to(`draft_${id}`).emit('draft:action_update', {
            action: appliedAction,
            currentActionIndex: updatedDraft.currentActionIndex,
            wasAutoCompleted: true,
          });

          if (completed) {
            await handleDraftComplete(io, updatedDraft);
          } else {
            await handleNextAction(io, updatedDraft);
          }
          return;
        }
      }

      // No valid pending selection — fall back to auto-complete
      const champions = championsService.getChampions();
      const result = await draftEngine.autoCompleteAction(draft, champions);
      if (!result) return;

      const { draft: updatedDraft, completed, action } = result;

      io.to(`draft_${id}`).emit('draft:action_update', {
        action,
        currentActionIndex: updatedDraft.currentActionIndex,
        wasAutoCompleted: true,
      });

      if (completed) {
        await handleDraftComplete(io, updatedDraft);
      } else {
        await handleNextAction(io, updatedDraft);
      }
    } catch (error) {
      console.error(`Timer expiry error for draft ${id}:`, error);
    }
  }, timerDuration * 1000);

  activeTimers.set(id, timer);
  return expiresAt;
};

/**
 * Handle transition to swap phase or completion.
 */
const handleDraftComplete = async (io, draft) => {
  const id = draft._id.toString();
  clearDraftTimer(id);

  const updatedDraft = await draftEngine.startSwapPhase(
    draft,
    draft.timerDuration
  );

  io.to(`draft_${id}`).emit('draft:swap_phase_start', {
    expiresAt: updatedDraft.swapPhaseExpiresAt.toISOString(),
  });

  // Set timer for swap phase end
  const swapDuration =
    (updatedDraft.swapPhaseExpiresAt - Date.now()) || 30000;

  const swapTimer = setTimeout(async () => {
    activeTimers.delete(id);
    try {
      const d = await Draft.findById(draft._id);
      if (!d || d.status !== 'swap_phase') return;

      const completed = await draftEngine.completeDraft(d);
      io.to(`draft_${id}`).emit('draft:completed', {
        draft: completed.toObject(),
      });
    } catch (error) {
      console.error(`Swap phase expiry error for draft ${id}:`, error);
    }
  }, swapDuration);

  activeTimers.set(id, swapTimer);
};

/**
 * Handle transition to the next action or simultaneous ban phase.
 */
const handleNextAction = async (io, draft) => {
  const id = draft._id.toString();
  const nextAction = draft.actions[draft.currentActionIndex];

  if (!nextAction) {
    await handleDraftComplete(io, draft);
    return;
  }

  // Check for phase change
  const prevAction = draft.actions[draft.currentActionIndex - 1];
  if (prevAction && nextAction.phase !== prevAction.phase) {
    io.to(`draft_${id}`).emit('draft:phase_change', {
      phase: nextAction.phase,
      actionIndex: draft.currentActionIndex,
    });
  }

  // Individual mode: check if entering a simultaneous ban phase
  if (
    draft.mode === 'individual' &&
    nextAction.simultaneous &&
    nextAction.type === 'ban'
  ) {
    await draftEngine.initSimultaneousBanPhase(draft);
    // Start timer for entire simultaneous phase
    startActionTimer(io, draft._id, draft.timerDuration);
    return;
  }

  // Start timer for next sequential action
  startActionTimer(io, draft._id, draft.timerDuration);
};

/**
 * Register all draft socket events for a connection.
 */
const registerDraftEvents = (io, socket) => {
  // Join a draft room
  socket.on('draft:join', async ({ draftId, team, role }) => {
    try {
      const draft = await Draft.findById(draftId);
      if (!draft) {
        socket.emit('draft:error', { message: 'Draft not found' });
        return;
      }

      const room = `draft_${draftId}`;
      socket.join(room);

      // Store draft context on socket
      socket.draftId = draftId;
      socket.draftTeam = team || null;
      socket.draftRole = role || null;

      // Send full state to the joining client
      socket.emit('draft:state', { draft: draft.toObject() });

      console.log(
        `Socket ${socket.id} joined draft ${draftId} (team: ${team || 'spectator'})`
      );
    } catch (error) {
      console.error('draft:join error:', error);
      socket.emit('draft:error', { message: 'Failed to join draft' });
    }
  });

  // Leave draft room
  socket.on('draft:leave', ({ draftId }) => {
    const room = `draft_${draftId}`;
    socket.leave(room);
    socket.draftId = null;
    socket.draftTeam = null;
  });

  // Signal team ready
  socket.on('draft:ready', async ({ draftId, team }) => {
    try {
      const draft = await Draft.findById(draftId);
      if (!draft) return;

      if (draft.status !== 'waiting' && draft.status !== 'ready') {
        socket.emit('draft:error', {
          message: 'Draft cannot be readied in current state',
        });
        return;
      }

      if (team === 'blue') {
        draft.blueTeam.ready = true;
      } else if (team === 'red') {
        draft.redTeam.ready = true;
      }

      // Both teams ready — start the draft
      if (draft.blueTeam.ready && draft.redTeam.ready) {
        draft.status = 'in_progress';
        await draft.save();

        const room = `draft_${draftId}`;
        io.to(room).emit('draft:state', { draft: draft.toObject() });

        // Start first action
        await handleNextAction(io, draft);
      } else {
        draft.status = 'ready';
        await draft.save();
        io.to(`draft_${draftId}`).emit('draft:state', {
          draft: draft.toObject(),
        });
      }
    } catch (error) {
      console.error('draft:ready error:', error);
      socket.emit('draft:error', { message: 'Failed to ready up' });
    }
  });

  // Submit a pick or ban action
  socket.on(
    'draft:action',
    async ({ draftId, championId, championName }) => {
      try {
        const draft = await Draft.findById(draftId);
        if (!draft) return;

        const currentAction = draft.actions[draft.currentActionIndex];
        if (!currentAction) return;

        // Individual mode simultaneous bans
        if (
          draft.mode === 'individual' &&
          currentAction.simultaneous &&
          currentAction.type === 'ban'
        ) {
          // Determine player's team and slot from socket context
          const team = socket.draftTeam;
          const playerSlot = currentAction.playerSlot;

          const validation = draftEngine.validateAction(
            draft,
            championId,
            team,
            socket.userId
          );
          if (!validation.valid) {
            socket.emit('draft:error', { message: validation.error });
            return;
          }

          const result = await draftEngine.submitSimultaneousBan(
            draft,
            championId,
            championName,
            team,
            playerSlot,
            socket.userId
          );

          if (result.revealed) {
            // All bans submitted — reveal to everyone
            io.to(`draft_${draftId}`).emit('draft:action_update', {
              revealedBans: result.bans,
              currentActionIndex: result.draft.currentActionIndex,
            });

            // Move to next phase
            await handleNextAction(io, result.draft);
          } else {
            // Acknowledge individual ban submission
            socket.emit('draft:ban_submitted', {
              championId,
              pendingCount: result.pendingCount,
            });
          }
          return;
        }

        // Sequential action (captain mode or individual mode picks)
        const team = socket.draftTeam || currentAction.team;

        const validation = draftEngine.validateAction(
          draft,
          championId,
          team,
          socket.userId
        );
        if (!validation.valid) {
          socket.emit('draft:error', { message: validation.error });
          return;
        }

        clearDraftTimer(draftId);

        const { draft: updatedDraft, completed, phaseChanged, nextAction } =
          await draftEngine.applyAction(
            draft,
            championId,
            championName,
            socket.userId
          );

        // Broadcast the action
        io.to(`draft_${draftId}`).emit('draft:action_update', {
          action: updatedDraft.actions[updatedDraft.currentActionIndex - 1],
          currentActionIndex: updatedDraft.currentActionIndex,
        });

        if (phaseChanged && nextAction) {
          io.to(`draft_${draftId}`).emit('draft:phase_change', {
            phase: nextAction.phase,
            actionIndex: updatedDraft.currentActionIndex,
          });
        }

        if (completed) {
          await handleDraftComplete(io, updatedDraft);
        } else {
          await handleNextAction(io, updatedDraft);
        }
      } catch (error) {
        console.error('draft:action error:', error);
        socket.emit('draft:error', { message: 'Failed to process action' });
      }
    }
  );

  // Swap request during swap phase
  socket.on(
    'draft:swap_request',
    async ({ draftId, fromSlot, toSlot, team }) => {
      try {
        const draft = await Draft.findById(draftId);
        if (!draft || draft.status !== 'swap_phase') {
          socket.emit('draft:error', {
            message: 'Not in swap phase',
          });
          return;
        }

        // Captain mode: execute swap immediately (captain controls the whole team)
        if (draft.mode === 'captain') {
          const teamObj = team === 'blue' ? draft.blueTeam : draft.redTeam;
          const fromPlayer = teamObj.players.find((p) => p.slot === fromSlot);
          const toPlayer = teamObj.players.find((p) => p.slot === toSlot);

          if (fromPlayer && toPlayer) {
            const tempChampion = fromPlayer.champion;
            fromPlayer.champion = toPlayer.champion;
            toPlayer.champion = tempChampion;
            await draft.save();
          }

          io.to(`draft_${draftId}`).emit('draft:state', {
            draft: draft.toObject(),
          });
          return;
        }

        // Individual mode: request/accept flow
        const swapRequest = await draftEngine.requestSwap(
          draft,
          fromSlot,
          toSlot,
          team
        );

        io.to(`draft_${draftId}`).emit('draft:swap_requested', {
          swapRequest,
        });
      } catch (error) {
        console.error('draft:swap_request error:', error);
        socket.emit('draft:error', { message: 'Failed to request swap' });
      }
    }
  );

  // Respond to swap request
  socket.on(
    'draft:swap_respond',
    async ({ draftId, swapRequestId, accept }) => {
      try {
        const draft = await Draft.findById(draftId);
        if (!draft || draft.status !== 'swap_phase') return;

        const result = await draftEngine.resolveSwap(
          draft,
          swapRequestId,
          accept
        );

        if (result.error) {
          socket.emit('draft:error', { message: result.error });
          return;
        }

        io.to(`draft_${draftId}`).emit('draft:state', {
          draft: result.draft.toObject(),
        });
      } catch (error) {
        console.error('draft:swap_respond error:', error);
        socket.emit('draft:error', { message: 'Failed to resolve swap' });
      }
    }
  );

  // Track pending champion selection (used for auto-lock on timeout)
  socket.on('draft:hover', ({ draftId, championId, championName }) => {
    if (!draftId) return;
    const id = draftId.toString();
    if (championId) {
      pendingSelections.set(id, { championId, championName, socketId: socket.id });
    } else {
      // Deselected — only clear if this socket set it
      const current = pendingSelections.get(id);
      if (current?.socketId === socket.id) {
        pendingSelections.delete(id);
      }
    }
  });

  // Cancel draft
  socket.on('draft:cancel', async ({ draftId }) => {
    try {
      const draft = await Draft.findById(draftId);
      if (!draft) return;

      if (draft.status === 'completed' || draft.status === 'cancelled') {
        socket.emit('draft:error', {
          message: `Draft is already ${draft.status}`,
        });
        return;
      }

      clearDraftTimer(draftId);
      await draftEngine.cancelDraft(draft);

      io.to(`draft_${draftId}`).emit('draft:cancelled', { draftId });
    } catch (error) {
      console.error('draft:cancel error:', error);
      socket.emit('draft:error', { message: 'Failed to cancel draft' });
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    // Draft rooms are automatically left on disconnect
  });
};

/**
 * Cleanup all active draft timers.
 */
const cleanupDraftTimers = () => {
  for (const [id, timer] of activeTimers) {
    clearTimeout(timer);
  }
  activeTimers.clear();
};

module.exports = { registerDraftEvents, cleanupDraftTimers };
