/**
 * Draft sequence generators for League of Legends tournament draft format.
 * Client-side copy of server utils/draftSequence.js.
 */

export const PHASES = {
  BAN_PHASE_1: 'Ban Phase 1',
  PICK_PHASE_1: 'Pick Phase 1',
  BAN_PHASE_2: 'Ban Phase 2',
  PICK_PHASE_2: 'Pick Phase 2',
};

export const generateCaptainSequence = () => {
  const actions = [];
  let index = 0;

  const banPhase1Teams = ['blue', 'red', 'blue', 'red', 'blue', 'red'];
  for (const team of banPhase1Teams) {
    actions.push({ actionIndex: index++, type: 'ban', team, phase: PHASES.BAN_PHASE_1 });
  }

  const pickPhase1Teams = ['blue', 'red', 'red', 'blue', 'blue', 'red'];
  for (const team of pickPhase1Teams) {
    actions.push({ actionIndex: index++, type: 'pick', team, phase: PHASES.PICK_PHASE_1 });
  }

  const banPhase2Teams = ['red', 'blue', 'red', 'blue'];
  for (const team of banPhase2Teams) {
    actions.push({ actionIndex: index++, type: 'ban', team, phase: PHASES.BAN_PHASE_2 });
  }

  const pickPhase2Teams = ['red', 'blue', 'blue', 'red'];
  for (const team of pickPhase2Teams) {
    actions.push({ actionIndex: index++, type: 'pick', team, phase: PHASES.PICK_PHASE_2 });
  }

  return actions;
};

export const getPhaseLabel = (actionIndex) => {
  if (actionIndex < 6) return PHASES.BAN_PHASE_1;
  if (actionIndex < 12) return PHASES.PICK_PHASE_1;
  if (actionIndex < 16) return PHASES.BAN_PHASE_2;
  if (actionIndex < 20) return PHASES.PICK_PHASE_2;
  return 'Unknown';
};

export const getTurnLabel = (action) => {
  if (!action) return '';
  const teamLabel = action.team === 'blue' ? 'BLUE TEAM' : 'RED TEAM';
  const actionLabel = action.type === 'ban' ? 'BANNING' : 'PICKING';
  return `${teamLabel} ${actionLabel}`;
};
