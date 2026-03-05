import { Box } from '@mui/material';

const BanSlot = ({ action, side, isActive, championsVersion }) => {
  const champion = action?.championId;
  const isBlue = side === 'blue';
  const teamColor = isBlue ? '#0ac8b9' : '#e84057';

  const iconUrl =
    champion && championsVersion
      ? `https://ddragon.leagueoflegends.com/cdn/${championsVersion}/img/champion/${champion}.png`
      : null;

  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        position: 'relative',
        borderRadius: '2px',
        overflow: 'hidden',
        background: isActive
          ? `${teamColor}22`
          : 'rgba(1,10,19,0.8)',
        border: `1px solid ${isActive ? teamColor : '#1e2328'}`,
        transition: 'all 0.3s ease',
        ...(isActive && {
          boxShadow: `0 0 8px ${teamColor}33`,
        }),
      }}
    >
      {iconUrl ? (
        <>
          <Box
            component="img"
            src={iconUrl}
            alt={champion}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(100%) brightness(0.4)',
            }}
          />
          {/* X overlay for banned */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                width: '120%',
                height: '2px',
                background: '#e84057',
                opacity: 0.8,
              },
              '&::before': { transform: 'rotate(45deg)' },
              '&::after': { transform: 'rotate(-45deg)' },
            }}
          />
        </>
      ) : (
        // Empty ban slot
        action?.wasAutoCompleted === true && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3c3c41',
              fontSize: '0.6rem',
              fontFamily: '"Spiegel", sans-serif',
            }}
          >
            —
          </Box>
        )
      )}
    </Box>
  );
};

export default BanSlot;
