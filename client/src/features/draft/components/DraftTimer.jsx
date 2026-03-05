import { Box, Typography } from '@mui/material';
import useDraftStore from '../stores/draftStore';
import useDraftTimer from '../hooks/useDraftTimer';

const DraftTimer = () => {
  const secondsRemaining = useDraftTimer();
  const draft = useDraftStore((s) => s.draft);
  const getCurrentAction = useDraftStore((s) => s.getCurrentAction);
  const getTurnLabel = useDraftStore((s) => s.getTurnLabel);

  if (!draft || draft.status === 'waiting' || draft.status === 'cancelled') {
    return null;
  }

  const currentAction = getCurrentAction();
  const turnLabel = getTurnLabel();
  const isLow = secondsRemaining <= 10;
  const isCritical = secondsRemaining <= 5;

  const teamColor =
    currentAction?.team === 'blue'
      ? '#0ac8b9'
      : currentAction?.team === 'red'
        ? '#e84057'
        : '#c8aa6e';

  return (
    <Box sx={{ textAlign: 'center', py: 1.5 }}>
      {/* Phase / Turn label */}
      {draft.status === 'in_progress' && currentAction && (
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: teamColor,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            mb: 0.5,
            textShadow: `0 0 10px ${teamColor}44`,
          }}
        >
          {turnLabel}
        </Typography>
      )}

      {draft.status === 'swap_phase' && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#c8aa6e',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              mb: 0.3,
            }}
          >
            Swap Phase
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Spiegel", sans-serif',
              fontSize: '0.6rem',
              color: '#5b5a56',
              mb: 0.5,
            }}
          >
            Click two picks on your team to swap
          </Typography>
        </Box>
      )}

      {/* Timer number */}
      {secondsRemaining > 0 && (
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1,
            color: isCritical
              ? '#e84057'
              : isLow
                ? '#c89b3c'
                : '#f0e6d2',
            textShadow: isCritical
              ? '0 0 20px rgba(232,64,87,0.5)'
              : isLow
                ? '0 0 20px rgba(200,155,60,0.3)'
                : 'none',
            transition: 'color 0.3s, text-shadow 0.3s',
            animation: isCritical ? 'pulse 1s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.6 },
            },
          }}
        >
          {secondsRemaining}
        </Typography>
      )}

      {draft.status === 'completed' && (
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '1.2rem',
            color: '#c8aa6e',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}
        >
          Draft Complete
        </Typography>
      )}
    </Box>
  );
};

export default DraftTimer;
