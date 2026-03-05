import { Box, Button } from '@mui/material';
import useDraftStore from '../stores/draftStore';

const DraftActions = ({ emitReady, emitAction }) => {
  const draft = useDraftStore((s) => s.draft);
  const myTeam = useDraftStore((s) => s.myTeam);
  const selectedChampion = useDraftStore((s) => s.selectedChampion);
  const isMyTurn = useDraftStore((s) => s.isMyTurn);
  const getCurrentAction = useDraftStore((s) => s.getCurrentAction);

  if (!draft || !myTeam) return null;

  const currentAction = getCurrentAction();
  const canReady =
    (draft.status === 'waiting' || draft.status === 'ready') &&
    ((myTeam === 'blue' && !draft.blueTeam.ready) ||
      (myTeam === 'red' && !draft.redTeam.ready));

  const isAlreadyReady =
    (myTeam === 'blue' && draft.blueTeam.ready) ||
    (myTeam === 'red' && draft.redTeam.ready);

  const canLockIn =
    draft.status === 'in_progress' &&
    isMyTurn() &&
    selectedChampion;

  const handleLockIn = () => {
    if (!selectedChampion) return;
    emitAction(selectedChampion.id, selectedChampion.name);
  };

  const teamColor = myTeam === 'blue' ? '#0ac8b9' : '#e84057';
  const actionType = currentAction?.type;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        py: 1,
      }}
    >
      {/* Ready button */}
      {canReady && (
        <Button
          onClick={() => emitReady(myTeam)}
          sx={{
            px: 4,
            py: 1,
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            borderRadius: '2px',
            color: '#010a13',
            background: `linear-gradient(180deg, ${teamColor} 0%, ${teamColor}99 100%)`,
            border: `1px solid ${teamColor}`,
            '&:hover': {
              background: teamColor,
              boxShadow: `0 0 15px ${teamColor}44`,
            },
          }}
        >
          Ready
        </Button>
      )}

      {isAlreadyReady && (draft.status === 'waiting' || draft.status === 'ready') && (
        <Button
          disabled
          sx={{
            px: 4,
            py: 1,
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            borderRadius: '2px',
            color: '#3c3c41',
            background: '#1e2328',
            border: '1px solid #1e2328',
          }}
        >
          Waiting for opponent...
        </Button>
      )}

      {/* Lock In button */}
      {draft.status === 'in_progress' && isMyTurn() && (
        <Button
          onClick={handleLockIn}
          disabled={!canLockIn}
          sx={{
            px: 5,
            py: 1.2,
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            borderRadius: '2px',
            color: canLockIn ? '#010a13' : '#3c3c41',
            background: canLockIn
              ? 'linear-gradient(180deg, #c89b3c 0%, #785a28 100%)'
              : '#1e2328',
            border: canLockIn
              ? '1px solid #c89b3c'
              : '1px solid #1e2328',
            '&:hover': canLockIn
              ? {
                  background: 'linear-gradient(180deg, #d4a94b 0%, #8c6a30 100%)',
                  boxShadow: '0 0 20px rgba(200,155,60,0.3)',
                }
              : {},
            '&.Mui-disabled': {
              color: '#3c3c41',
              background: '#1e2328',
              border: '1px solid #1e2328',
            },
          }}
        >
          {actionType === 'ban' ? 'Lock Ban' : 'Lock In'}
        </Button>
      )}
    </Box>
  );
};

export default DraftActions;
