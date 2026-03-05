import { Box, Typography, Button } from '@mui/material';
import { useHistory } from 'react-router-dom';
import useDraftStore from '../stores/draftStore';
import { createDraft } from '../services/draft.services';

const DraftHeader = () => {
  const draft = useDraftStore((s) => s.draft);
  const history = useHistory();

  if (!draft) return null;

  const statusLabels = {
    waiting: 'Waiting for Players',
    ready: 'Ready Up',
    in_progress: 'Draft In Progress',
    swap_phase: 'Swap Phase',
    completed: 'Draft Complete',
    cancelled: 'Cancelled',
  };

  const isSeries = draft.seriesId && draft.fearlessMode !== 'off';

  const handleNextGame = async () => {
    try {
      const newDraft = await createDraft({
        mode: draft.mode,
        blueTeamName: draft.blueTeam.name,
        redTeamName: draft.redTeam.name,
        timerDuration: draft.timerDuration,
        fearlessMode: draft.fearlessMode,
        seriesId: draft.seriesId,
        gameNumber: draft.gameNumber + 1,
      });
      history.push(`/draft/${newDraft._id}`);
    } catch (err) {
      console.error('Failed to create next game:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 1.5,
        borderBottom: '1px solid #1e2328',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -1,
          left: '30%',
          right: '30%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(200,155,60,0.4), transparent)',
        },
      }}
    >
      {/* Blue Team Name */}
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#0ac8b9',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textShadow: '0 0 15px rgba(10,200,185,0.3)',
          }}
        >
          {draft.blueTeam.name}
        </Typography>
      </Box>

      {/* Center: Status + Mode + Game indicators */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '0.7rem',
            color: '#c8aa6e',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          {statusLabels[draft.status] || draft.status}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Spiegel", sans-serif',
            fontSize: '0.6rem',
            color: '#3c3c41',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            mt: 0.2,
          }}
        >
          {draft.mode === 'captain' ? 'Captain Mode' : 'Individual Mode'}
          {draft.fearlessMode !== 'off' &&
            ` · Fearless (${draft.fearlessMode})`}
        </Typography>

        {/* Game indicators for series */}
        {isSeries && (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 0.8 }}>
            {[1, 2, 3, 4, 5].slice(0, Math.max(draft.gameNumber, 3)).map((num) => (
              <Box
                key={num}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontFamily: '"Beaufort for LOL", serif',
                  fontWeight: 700,
                  border: `1px solid ${
                    num === draft.gameNumber ? '#c89b3c' : '#1e2328'
                  }`,
                  color: num === draft.gameNumber ? '#c8aa6e' : '#3c3c41',
                  background:
                    num === draft.gameNumber
                      ? 'rgba(200,155,60,0.1)'
                      : num < draft.gameNumber
                        ? 'rgba(91,90,86,0.1)'
                        : 'transparent',
                }}
              >
                {num}
              </Box>
            ))}
          </Box>
        )}

        {/* Next Game button for completed series drafts */}
        {isSeries && draft.status === 'completed' && (
          <Button
            onClick={handleNextGame}
            size="small"
            sx={{
              mt: 0.8,
              px: 2,
              py: 0.3,
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: '2px',
              color: '#c8aa6e',
              border: '1px solid #463714',
              background: 'rgba(200,155,60,0.08)',
              '&:hover': {
                background: 'rgba(200,155,60,0.15)',
                borderColor: '#c89b3c',
              },
            }}
          >
            Next Game →
          </Button>
        )}
      </Box>

      {/* Red Team Name */}
      <Box sx={{ flex: 1, textAlign: 'right' }}>
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#e84057',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textShadow: '0 0 15px rgba(232,64,87,0.3)',
          }}
        >
          {draft.redTeam.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default DraftHeader;
