/**
 * Draft sequence generators for League of Legends tournament draft format.
 * Shared between server and client.
 *
 * Captain Mode: 20 sequential actions
 *   Ban Phase 1: B-R-B-R-B-R (6 bans)
 *   Pick Phase 1: B-RR-BB-R (6 picks)
 *   Ban Phase 2: R-B-R-B (4 bans)
 *   Pick Phase 2: R-BB-R (4 picks)
 *
 * Individual Mode: bans simultaneous, picks sequential
 *   Ban Phase 1: 3 blue + 3 red simultaneous → reveal
 *   Pick Phase 1: B-RR-BB-R (sequential)
 *   Ban Phase 2: 2 blue + 2 red simultaneous → reveal
 *   Pick Phase 2: R-BB-R (sequential)
 */

const PHASES = {
  BAN_PHASE_1: 'Ban Phase 1',
  PICK_PHASE_1: 'Pick Phase 1',
  BAN_PHASE_2: 'Ban Phase 2',
  PICK_PHASE_2: 'Pick Phase 2',
};

/**
 * Generate the 20-action captain mode sequence.
 * Each action: { actionIndex, type, team, phase }
 */
const generateCaptainSequence = () => {
  const actions = [];
  let index = 0;

  // Ban Phase 1: B-R-B-R-B-R (indices 0-5)
  const banPhase1Teams = ['blue', 'red', 'blue', 'red', 'blue', 'red'];
  for (const team of banPhase1Teams) {
    actions.push({
      actionIndex: index++,
      type: 'ban',
      team,
      phase: PHASES.BAN_PHASE_1,
    });
  }

  // Pick Phase 1: B-RR-BB-R (indices 6-11)
  const pickPhase1Teams = ['blue', 'red', 'red', 'blue', 'blue', 'red'];
  for (const team of pickPhase1Teams) {
    actions.push({
      actionIndex: index++,
      type: 'pick',
      team,
      phase: PHASES.PICK_PHASE_1,
    });
  }

  // Ban Phase 2: R-B-R-B (indices 12-15)
  const banPhase2Teams = ['red', 'blue', 'red', 'blue'];
  for (const team of banPhase2Teams) {
    actions.push({
      actionIndex: index++,
      type: 'ban',
      team,
      phase: PHASES.BAN_PHASE_2,
    });
  }

  // Pick Phase 2: R-BB-R (indices 16-19)
  const pickPhase2Teams = ['red', 'blue', 'blue', 'red'];
  for (const team of pickPhase2Teams) {
    actions.push({
      actionIndex: index++,
      type: 'pick',
      team,
      phase: PHASES.PICK_PHASE_2,
    });
  }

  return actions;
};

/**
 * Generate the individual mode sequence.
 * Ban phases are simultaneous (grouped), picks are sequential.
 * Each action: { actionIndex, type, team, phase, simultaneous?, playerSlot? }
 */
const generateIndividualSequence = () => {
  const actions = [];
  let index = 0;

  // Ban Phase 1: 3 blue + 3 red simultaneous (indices 0-5)
  // Slots 0-2 for blue bans, slots 0-2 for red bans
  for (let i = 0; i < 3; i++) {
    actions.push({
      actionIndex: index++,
      type: 'ban',
      team: 'blue',
      phase: PHASES.BAN_PHASE_1,
      simultaneous: true,
      playerSlot: i,
    });
  }
  for (let i = 0; i < 3; i++) {
    actions.push({
      actionIndex: index++,
      type: 'ban',
      team: 'red',
      phase: PHASES.BAN_PHASE_1,
      simultaneous: true,
      playerSlot: i,
    });
  }

  // Pick Phase 1: B-RR-BB-R (indices 6-11)
  // Player slots assigned in order of picks per team
  const pickPhase1 = [
    { team: 'blue', slot: 0 },
    { team: 'red', slot: 0 },
    { team: 'red', slot: 1 },
    { team: 'blue', slot: 1 },
    { team: 'blue', slot: 2 },
    { team: 'red', slot: 2 },
  ];
  for (const { team, slot } of pickPhase1) {
    actions.push({
      actionIndex: index++,
      type: 'pick',
      team,
      phase: PHASES.PICK_PHASE_1,
      simultaneous: false,
      playerSlot: slot,
    });
  }

  // Ban Phase 2: 2 blue + 2 red simultaneous (indices 12-15)
  for (let i = 3; i < 5; i++) {
    actions.push({
      actionIndex: index++,
      type: 'ban',
      team: 'blue',
      phase: PHASES.BAN_PHASE_2,
      simultaneous: true,
      playerSlot: i,
    });
  }
  for (let i = 3; i < 5; i++) {
    actions.push({
      actionIndex: index++,
      type: 'ban',
      team: 'red',
      phase: PHASES.BAN_PHASE_2,
      simultaneous: true,
      playerSlot: i,
    });
  }

  // Pick Phase 2: R-BB-R (indices 16-19)
  const pickPhase2 = [
    { team: 'red', slot: 3 },
    { team: 'blue', slot: 3 },
    { team: 'blue', slot: 4 },
    { team: 'red', slot: 4 },
  ];
  for (const { team, slot } of pickPhase2) {
    actions.push({
      actionIndex: index++,
      type: 'pick',
      team,
      phase: PHASES.PICK_PHASE_2,
      simultaneous: false,
      playerSlot: slot,
    });
  }

  return actions;
};

/**
 * Get the phase label for a given action index.
 */
const getPhaseLabel = (actionIndex, mode = 'captain') => {
  if (mode === 'captain') {
    if (actionIndex < 6) return PHASES.BAN_PHASE_1;
    if (actionIndex < 12) return PHASES.PICK_PHASE_1;
    if (actionIndex < 16) return PHASES.BAN_PHASE_2;
    if (actionIndex < 20) return PHASES.PICK_PHASE_2;
  } else {
    // Individual mode has same index ranges
    if (actionIndex < 6) return PHASES.BAN_PHASE_1;
    if (actionIndex < 12) return PHASES.PICK_PHASE_1;
    if (actionIndex < 16) return PHASES.BAN_PHASE_2;
    if (actionIndex < 20) return PHASES.PICK_PHASE_2;
  }
  return 'Unknown';
};

/**
 * Get a description of whose turn it is.
 */
const getTurnLabel = (action) => {
  if (!action) return '';
  const teamLabel = action.team === 'blue' ? 'BLUE TEAM' : 'RED TEAM';
  const actionLabel = action.type === 'ban' ? 'BANNING' : 'PICKING';
  return `${teamLabel} ${actionLabel}`;
};

// Support both CommonJS and ES module imports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PHASES,
    generateCaptainSequence,
    generateIndividualSequence,
    getPhaseLabel,
    getTurnLabel,
  };
}
