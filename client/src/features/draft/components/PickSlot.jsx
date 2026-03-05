import { Box, Typography } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const ROLES = ['TOP', 'JGL', 'MID', 'ADC', 'SUP'];

const PickSlot = ({
  player,
  slotIndex,
  side,
  isActive,
  championsVersion,
  isSwapPhase,
  isSwapSelected,
  onSwapClick,
}) => {
  const champion = player?.champion;
  const role = player?.role || ROLES[slotIndex] || '';
  const displayName = player?.displayName || '';
  const isBlue = side === 'blue';
  const teamColor = isBlue ? '#0ac8b9' : '#e84057';
  const teamColorDim = isBlue ? 'rgba(10,200,185,0.15)' : 'rgba(232,64,87,0.15)';

  const splashUrl = champion && championsVersion
    ? `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion}_0.jpg`
    : null;

  return (
    <Box
      onClick={isSwapPhase ? onSwapClick : undefined}
      sx={{
        position: 'relative',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexDirection: isBlue ? 'row' : 'row-reverse',
        overflow: 'hidden',
        background: isSwapSelected
          ? `linear-gradient(${isBlue ? '90deg' : '270deg'}, rgba(200,155,60,0.25), rgba(200,155,60,0.08))`
          : isActive
            ? `linear-gradient(${isBlue ? '90deg' : '270deg'}, ${teamColorDim}, transparent)`
            : 'rgba(1,10,19,0.6)',
        borderLeft: isBlue
          ? `2px solid ${isSwapSelected ? '#c89b3c' : isActive ? teamColor : '#1e2328'}`
          : 'none',
        borderRight: !isBlue
          ? `2px solid ${isSwapSelected ? '#c89b3c' : isActive ? teamColor : '#1e2328'}`
          : 'none',
        transition: 'all 0.3s ease',
        cursor: isSwapPhase ? 'pointer' : 'default',
        ...(isActive && {
          boxShadow: `${isBlue ? '-4px' : '4px'} 0 15px -5px ${teamColor}33`,
        }),
        ...(isSwapSelected && {
          boxShadow: `0 0 12px rgba(200,155,60,0.2)`,
        }),
        ...(isSwapPhase && !isSwapSelected && {
          '&:hover': {
            background: `linear-gradient(${isBlue ? '90deg' : '270deg'}, rgba(200,155,60,0.12), transparent)`,
          },
        }),
      }}
    >
      {/* Swap indicator */}
      {isSwapSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            [isBlue ? 'right' : 'left']: 4,
            zIndex: 2,
          }}
        >
          <SwapHorizIcon sx={{ fontSize: '0.9rem', color: '#c89b3c' }} />
        </Box>
      )}

      {/* Champion splash */}
      <Box
        sx={{
          width: 52,
          height: 72,
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
          background: '#0a0e13',
        }}
      >
        {splashUrl ? (
          <Box
            component="img"
            src={splashUrl}
            alt={champion}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, #0a0e13, ${teamColorDim})`,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Spiegel", sans-serif',
                fontSize: '0.6rem',
                color: '#3c3c41',
                textTransform: 'uppercase',
              }}
            >
              {role}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Player info */}
      <Box
        sx={{
          flex: 1,
          px: 1,
          textAlign: isBlue ? 'left' : 'right',
        }}
      >
        {champion && (
          <Typography
            sx={{
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#f0e6d2',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 1.2,
            }}
          >
            {champion}
          </Typography>
        )}
        <Typography
          sx={{
            fontFamily: '"Spiegel", sans-serif',
            fontSize: '0.65rem',
            color: '#5b5a56',
            mt: 0.2,
          }}
        >
          {displayName || `Player ${slotIndex + 1}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default PickSlot;
