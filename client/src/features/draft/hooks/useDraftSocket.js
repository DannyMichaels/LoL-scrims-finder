import { useEffect, useCallback } from 'react';
import useSocket from '@/hooks/useSocket';
import useDraftStore from '../stores/draftStore';

const useDraftSocket = (draftId) => {
  const { socket } = useSocket();
  const {
    setDraft,
    applyActionUpdate,
    setTimerExpiresAt,
    myTeam,
    clearDraft,
  } = useDraftStore();

  // Join draft room
  useEffect(() => {
    if (!socket || !draftId) return;

    socket.emit('draft:join', {
      draftId,
      team: myTeam,
    });

    return () => {
      socket.emit('draft:leave', { draftId });
    };
  }, [socket, draftId, myTeam]);

  // Listen for draft events
  useEffect(() => {
    if (!socket) return;

    const handleState = ({ draft }) => {
      setDraft(draft);
    };

    const handleActionUpdate = (update) => {
      applyActionUpdate(update);
    };

    const handleTimerStart = ({ expiresAt }) => {
      setTimerExpiresAt(expiresAt);
    };

    const handlePhaseChange = ({ phase, actionIndex }) => {
      // Phase change is handled within draft state updates
    };

    const handleSwapPhaseStart = ({ expiresAt }) => {
      setTimerExpiresAt(expiresAt);
      useDraftStore.setState((state) => ({
        draft: state.draft ? { ...state.draft, status: 'swap_phase' } : null,
      }));
    };

    const handleCompleted = ({ draft }) => {
      setDraft(draft);
      setTimerExpiresAt(null);
    };

    const handleCancelled = () => {
      useDraftStore.setState((state) => ({
        draft: state.draft
          ? { ...state.draft, status: 'cancelled' }
          : null,
      }));
      setTimerExpiresAt(null);
    };

    const handleError = ({ message }) => {
      console.error('Draft error:', message);
    };

    socket.on('draft:state', handleState);
    socket.on('draft:action_update', handleActionUpdate);
    socket.on('draft:timer_start', handleTimerStart);
    socket.on('draft:phase_change', handlePhaseChange);
    socket.on('draft:swap_phase_start', handleSwapPhaseStart);
    socket.on('draft:completed', handleCompleted);
    socket.on('draft:cancelled', handleCancelled);
    socket.on('draft:error', handleError);

    return () => {
      socket.off('draft:state', handleState);
      socket.off('draft:action_update', handleActionUpdate);
      socket.off('draft:timer_start', handleTimerStart);
      socket.off('draft:phase_change', handlePhaseChange);
      socket.off('draft:swap_phase_start', handleSwapPhaseStart);
      socket.off('draft:completed', handleCompleted);
      socket.off('draft:cancelled', handleCancelled);
      socket.off('draft:error', handleError);
    };
  }, [socket, setDraft, applyActionUpdate, setTimerExpiresAt]);

  // Actions
  const emitReady = useCallback(
    (team) => {
      if (!socket || !draftId) return;
      socket.emit('draft:ready', { draftId, team });
    },
    [socket, draftId]
  );

  const emitAction = useCallback(
    (championId, championName) => {
      if (!socket || !draftId) return;
      socket.emit('draft:action', { draftId, championId, championName });
    },
    [socket, draftId]
  );

  const emitSwapRequest = useCallback(
    (fromSlot, toSlot, team) => {
      if (!socket || !draftId) return;
      socket.emit('draft:swap_request', { draftId, fromSlot, toSlot, team });
    },
    [socket, draftId]
  );

  const emitSwapRespond = useCallback(
    (swapRequestId, accept) => {
      if (!socket || !draftId) return;
      socket.emit('draft:swap_respond', { draftId, swapRequestId, accept });
    },
    [socket, draftId]
  );

  const emitCancel = useCallback(() => {
    if (!socket || !draftId) return;
    socket.emit('draft:cancel', { draftId });
  }, [socket, draftId]);

  // Report pending champion selection to server (for auto-lock on timeout)
  const emitHover = useCallback(
    (championId, championName) => {
      if (!socket || !draftId) return;
      socket.emit('draft:hover', { draftId, championId, championName });
    },
    [socket, draftId]
  );

  return {
    emitReady,
    emitAction,
    emitSwapRequest,
    emitSwapRespond,
    emitCancel,
    emitHover,
  };
};

export default useDraftSocket;
