import { Box } from '@mui/material';
import useDraftStore from '../stores/draftStore';
import PickSlot from './PickSlot';

const TeamPicksColumn = ({ side, emitSwapRequest }) => {
  const draft = useDraftStore((s) => s.draft);
  const myTeam = useDraftStore((s) => s.myTeam);
  const championsVersion = useDraftStore((s) => s.championsVersion);
  const getCurrentAction = useDraftStore((s) => s.getCurrentAction);
  const swapSelectedSlot = useDraftStore((s) => s.swapSelectedSlot);
  const setSwapSelectedSlot = useDraftStore((s) => s.setSwapSelectedSlot);

  if (!draft) return null;

  const team = side === 'blue' ? draft.blueTeam : draft.redTeam;
  const currentAction = getCurrentAction();
  const isTeamActive =
    draft.status === 'in_progress' &&
    currentAction?.team === side &&
    currentAction?.type === 'pick';

  const isSwapPhase = draft.status === 'swap_phase';
  const canSwap = isSwapPhase && myTeam === side;

  // Find which slot is currently picking
  const getActiveSlotIndex = () => {
    if (!isTeamActive) return -1;
    if (draft.mode === 'captain') {
      const filledPicks = draft.actions.filter(
        (a) => a.type === 'pick' && a.team === side && a.completedAt
      );
      return filledPicks.length;
    }
    return currentAction?.playerSlot ?? -1;
  };

  const activeSlot = getActiveSlotIndex();
  const slots = [0, 1, 2, 3, 4];

  const handleSlotClick = (slotIndex) => {
    if (!canSwap) return;

    if (swapSelectedSlot === null) {
      // First click — select this slot
      setSwapSelectedSlot(slotIndex);
    } else if (swapSelectedSlot === slotIndex) {
      // Clicked same slot — deselect
      setSwapSelectedSlot(null);
    } else {
      // Second click — swap with first slot
      emitSwapRequest?.(swapSelectedSlot, slotIndex, side);
      setSwapSelectedSlot(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {slots.map((slotIndex) => {
        const player = team.players.find((p) => p.slot === slotIndex);
        return (
          <PickSlot
            key={slotIndex}
            player={player}
            slotIndex={slotIndex}
            side={side}
            isActive={slotIndex === activeSlot}
            championsVersion={championsVersion}
            isSwapPhase={canSwap}
            isSwapSelected={canSwap && swapSelectedSlot === slotIndex}
            onSwapClick={() => handleSlotClick(slotIndex)}
          />
        );
      })}
    </Box>
  );
};

export default TeamPicksColumn;
