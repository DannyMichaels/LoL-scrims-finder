const Draft = require('../models/draft.model');
const {
  generateCaptainSequence,
  generateIndividualSequence,
} = require('../utils/draftSequence');

/**
 * Create a new draft with pre-generated action sequence.
 */
const createDraft = async (options) => {
  const {
    mode,
    blueTeamName,
    redTeamName,
    scrimId,
    timerDuration = 30,
    fearlessMode = 'off',
    seriesId = null,
    gameNumber = 1,
    createdBy,
    blueTeamPlayers = [],
    redTeamPlayers = [],
    blueCaptain = null,
    redCaptain = null,
  } = options;

  // Generate action sequence based on mode
  const sequence =
    mode === 'captain'
      ? generateCaptainSequence()
      : generateIndividualSequence();

  // Build previously picked champions for fearless mode
  let previouslyPickedChampions = [];
  if (fearlessMode !== 'off' && seriesId && gameNumber > 1) {
    const previousDrafts = await Draft.find({
      seriesId,
      gameNumber: { $lt: gameNumber },
      status: 'completed',
    }).lean();

    for (const prev of previousDrafts) {
      const picks = prev.actions.filter(
        (a) => a.type === 'pick' && a.championId
      );
      for (const pick of picks) {
        previouslyPickedChampions.push({
          championId: pick.championId,
          team: pick.team,
          gameNumber: prev.gameNumber,
        });
      }
    }
  }

  // Ensure 5 player slots exist per team (fill defaults if not provided)
  const defaultRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  const buildPlayers = (provided) => {
    const players = [];
    for (let i = 0; i < 5; i++) {
      const p = provided[i];
      players.push({
        slot: p?.slot ?? i,
        role: p?.role || defaultRoles[i],
        displayName: p?.displayName || '',
        _user: p?._user || null,
      });
    }
    return players;
  };

  const draft = new Draft({
    mode,
    blueTeam: {
      name: blueTeamName,
      side: 'blue',
      players: buildPlayers(blueTeamPlayers),
      _captain: blueCaptain,
      ready: false,
    },
    redTeam: {
      name: redTeamName,
      side: 'red',
      players: buildPlayers(redTeamPlayers),
      _captain: redCaptain,
      ready: false,
    },
    actions: sequence,
    currentActionIndex: 0,
    timerDuration,
    _scrim: scrimId || null,
    createdBy,
    fearlessMode,
    seriesId,
    gameNumber,
    previouslyPickedChampions,
  });

  await draft.save();
  return draft;
};

/**
 * Get all champion IDs that are unavailable (banned, picked, or fearless-locked).
 */
const getUnavailableChampions = (draft) => {
  const unavailable = new Set();

  // Completed bans and picks
  for (const action of draft.actions) {
    if (action.championId && action.completedAt) {
      unavailable.add(action.championId);
    }
  }

  // Fearless-locked champions
  if (draft.fearlessMode !== 'off') {
    for (const prev of draft.previouslyPickedChampions) {
      if (draft.fearlessMode === 'hard') {
        // Locked for both teams
        unavailable.add(prev.championId);
      } else if (draft.fearlessMode === 'soft') {
        // Locked only for the team that picked it — handled in validateAction
        // Still add to unavailable set for general filtering
        unavailable.add(prev.championId);
      }
    }
  }

  return unavailable;
};

/**
 * Check if a champion is fearless-locked for a specific team.
 */
const isFearlessLocked = (draft, championId, team) => {
  if (draft.fearlessMode === 'off') return false;

  for (const prev of draft.previouslyPickedChampions) {
    if (prev.championId === championId) {
      if (draft.fearlessMode === 'hard') return true;
      if (draft.fearlessMode === 'soft' && prev.team === team) return true;
    }
  }
  return false;
};

/**
 * Validate that an action can be performed.
 * Returns { valid, error } object.
 */
const validateAction = (draft, championId, team, userId) => {
  if (draft.status !== 'in_progress') {
    return { valid: false, error: 'Draft is not in progress' };
  }

  const currentAction = draft.actions[draft.currentActionIndex];
  if (!currentAction) {
    return { valid: false, error: 'No current action available' };
  }

  // For captain mode, verify correct team
  if (draft.mode === 'captain') {
    if (currentAction.team !== team) {
      return { valid: false, error: 'Not your turn' };
    }
  }

  // Check champion is not already banned/picked
  const completedActions = draft.actions.filter(
    (a) => a.championId && a.completedAt
  );
  const usedChampions = completedActions.map((a) => a.championId);
  if (usedChampions.includes(championId)) {
    return { valid: false, error: 'Champion already banned or picked' };
  }

  // Check pending simultaneous bans
  if (draft.pendingBans) {
    for (const [, ban] of draft.pendingBans) {
      if (ban.championId === championId) {
        return { valid: false, error: 'Champion already selected in this ban phase' };
      }
    }
  }

  // Check fearless lock
  if (isFearlessLocked(draft, championId, currentAction.team)) {
    return {
      valid: false,
      error: 'Champion is locked by Fearless mode',
    };
  }

  return { valid: true };
};

/**
 * Apply a pick/ban action to the draft (captain mode sequential action).
 * Returns the updated draft.
 */
const applyAction = async (draft, championId, championName, userId) => {
  const action = draft.actions[draft.currentActionIndex];
  action.championId = championId;
  action.championName = championName;
  action.completedAt = new Date();
  action._user = userId || null;

  // If it's a pick, assign the champion to the player slot
  if (action.type === 'pick') {
    const team =
      action.team === 'blue' ? draft.blueTeam : draft.redTeam;
    // In captain mode, picks fill slots in order
    if (draft.mode === 'captain') {
      const filledPicks = draft.actions.filter(
        (a) =>
          a.type === 'pick' &&
          a.team === action.team &&
          a.completedAt &&
          a.actionIndex < action.actionIndex
      );
      const slotIndex = filledPicks.length;
      if (team.players[slotIndex]) {
        team.players[slotIndex].champion = championId;
      }
    } else if (action.playerSlot != null) {
      // Individual mode: specific player slot
      const player = team.players.find(
        (p) => p.slot === action.playerSlot
      );
      if (player) {
        player.champion = championId;
      }
    }
  }

  // Advance to next action
  draft.currentActionIndex++;

  // Check if draft is complete (all 20 actions done)
  if (draft.currentActionIndex >= draft.actions.length) {
    return { draft, completed: true, phaseChanged: false };
  }

  // Check for phase change
  const prevPhase = action.phase;
  const nextAction = draft.actions[draft.currentActionIndex];
  const phaseChanged = nextAction && nextAction.phase !== prevPhase;

  await draft.save();
  return { draft, completed: false, phaseChanged, nextAction };
};

/**
 * Auto-complete an action when timer expires.
 * Bans: null champion (no ban). Picks: random available champion.
 */
const autoCompleteAction = async (draft, availableChampions = []) => {
  const action = draft.actions[draft.currentActionIndex];
  if (!action) return null;

  if (action.type === 'ban') {
    // Auto-complete ban as empty (no champion banned)
    action.championId = null;
    action.championName = null;
  } else {
    // Auto-complete pick with random available champion
    const unavailable = getUnavailableChampions(draft);
    const available = availableChampions.filter(
      (c) => !unavailable.has(c.id)
    );

    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      action.championId = random.id;
      action.championName = random.name;

      // Assign champion to player
      const team =
        action.team === 'blue' ? draft.blueTeam : draft.redTeam;
      if (draft.mode === 'captain') {
        const filledPicks = draft.actions.filter(
          (a) =>
            a.type === 'pick' &&
            a.team === action.team &&
            a.completedAt &&
            a.actionIndex < action.actionIndex
        );
        const slotIndex = filledPicks.length;
        if (team.players[slotIndex]) {
          team.players[slotIndex].champion = random.id;
        }
      } else if (action.playerSlot != null) {
        const player = team.players.find(
          (p) => p.slot === action.playerSlot
        );
        if (player) {
          player.champion = random.id;
        }
      }
    }
  }

  action.completedAt = new Date();
  action.wasAutoCompleted = true;

  draft.currentActionIndex++;

  const isComplete = draft.currentActionIndex >= draft.actions.length;

  await draft.save();
  return { draft, completed: isComplete, action };
};

/**
 * Handle simultaneous ban submission (individual mode).
 * Returns { revealed, bans } when all bans in the phase are submitted.
 */
const submitSimultaneousBan = async (
  draft,
  championId,
  championName,
  team,
  playerSlot,
  userId
) => {
  const key = `${team}_${playerSlot}`;
  draft.pendingBans.set(key, {
    championId,
    championName,
    team,
    playerSlot,
  });

  // Check if all bans for this phase are submitted
  if (draft.pendingBans.size >= draft.expectedBanCount) {
    // Reveal all bans — apply them to the actions array
    for (const [, ban] of draft.pendingBans) {
      const action = draft.actions.find(
        (a) =>
          a.type === 'ban' &&
          a.team === ban.team &&
          a.playerSlot === ban.playerSlot &&
          !a.completedAt
      );
      if (action) {
        action.championId = ban.championId;
        action.championName = ban.championName;
        action.completedAt = new Date();
        action._user = userId || null;
      }
    }

    const revealedBans = Array.from(draft.pendingBans.values());
    draft.pendingBans = new Map();
    draft.expectedBanCount = 0;

    // Advance currentActionIndex past all the ban actions
    while (
      draft.currentActionIndex < draft.actions.length &&
      draft.actions[draft.currentActionIndex].completedAt
    ) {
      draft.currentActionIndex++;
    }

    await draft.save();
    return { revealed: true, bans: revealedBans, draft };
  }

  await draft.save();
  return { revealed: false, pendingCount: draft.pendingBans.size };
};

/**
 * Start the swap phase after all 20 actions are complete.
 */
const startSwapPhase = async (draft, swapDuration = 30) => {
  draft.status = 'swap_phase';
  draft.swapPhaseExpiresAt = new Date(
    Date.now() + swapDuration * 1000
  );
  await draft.save();
  return draft;
};

/**
 * Request a champion swap between two teammates.
 */
const requestSwap = async (draft, fromSlot, toSlot, team) => {
  draft.swapRequests.push({
    fromSlot,
    toSlot,
    team,
    status: 'pending',
  });
  await draft.save();
  return draft.swapRequests[draft.swapRequests.length - 1];
};

/**
 * Resolve a swap request (accept or reject).
 */
const resolveSwap = async (draft, swapRequestId, accept) => {
  const swap = draft.swapRequests.id(swapRequestId);
  if (!swap || swap.status !== 'pending') {
    return { error: 'Swap request not found or already resolved' };
  }

  if (accept) {
    swap.status = 'accepted';

    // Execute the swap
    const team =
      swap.team === 'blue' ? draft.blueTeam : draft.redTeam;
    const fromPlayer = team.players.find(
      (p) => p.slot === swap.fromSlot
    );
    const toPlayer = team.players.find(
      (p) => p.slot === swap.toSlot
    );

    if (fromPlayer && toPlayer) {
      const tempChampion = fromPlayer.champion;
      fromPlayer.champion = toPlayer.champion;
      toPlayer.champion = tempChampion;
    }
  } else {
    swap.status = 'rejected';
  }

  await draft.save();
  return { draft, swap };
};

/**
 * Complete the draft.
 */
const completeDraft = async (draft) => {
  draft.status = 'completed';
  await draft.save();
  return draft;
};

/**
 * Cancel the draft.
 */
const cancelDraft = async (draft) => {
  draft.status = 'cancelled';
  await draft.save();
  return draft;
};

/**
 * Set up a simultaneous ban phase (individual mode).
 */
const initSimultaneousBanPhase = async (draft) => {
  const currentAction = draft.actions[draft.currentActionIndex];
  if (!currentAction || !currentAction.simultaneous) return draft;

  // Count how many simultaneous ban actions are in this phase
  const phase = currentAction.phase;
  let count = 0;
  for (
    let i = draft.currentActionIndex;
    i < draft.actions.length;
    i++
  ) {
    const a = draft.actions[i];
    if (a.phase === phase && a.simultaneous && !a.completedAt) {
      count++;
    } else {
      break;
    }
  }

  draft.expectedBanCount = count;
  draft.pendingBans = new Map();
  await draft.save();
  return draft;
};

module.exports = {
  createDraft,
  getUnavailableChampions,
  isFearlessLocked,
  validateAction,
  applyAction,
  autoCompleteAction,
  submitSimultaneousBan,
  startSwapPhase,
  requestSwap,
  resolveSwap,
  completeDraft,
  cancelDraft,
  initSimultaneousBanPhase,
};
