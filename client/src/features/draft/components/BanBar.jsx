import { Box } from '@mui/material';
import useDraftStore from '../stores/draftStore';
import BanSlot from './BanSlot';

const BanBar = ({ side }) => {
  const draft = useDraftStore((s) => s.draft);
  const championsVersion = useDraftStore((s) => s.championsVersion);
  const getCurrentAction = useDraftStore((s) => s.getCurrentAction);

  if (!draft) return null;

  const currentAction = getCurrentAction();
  const isTeamBanning =
    draft.status === 'in_progress' &&
    currentAction?.team === side &&
    currentAction?.type === 'ban';

  // Get all ban actions for this team
  const bans = draft.actions.filter(
    (a) => a.type === 'ban' && a.team === side
  );

  // Find active ban index
  const activeBanIndex = isTeamBanning
    ? bans.findIndex((b) => !b.completedAt)
    : -1;

  const isBlue = side === 'blue';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '4px',
        justifyContent: isBlue ? 'flex-start' : 'flex-end',
        flexDirection: isBlue ? 'row' : 'row',
      }}
    >
      {bans.map((ban, index) => (
        <BanSlot
          key={ban.actionIndex}
          action={ban}
          side={side}
          isActive={index === activeBanIndex}
          championsVersion={championsVersion}
        />
      ))}
    </Box>
  );
};

export default BanBar;
