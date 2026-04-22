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
  const teamColorDim = isBlue ? 'rgba(10,200,185,0.18)' : 'rgba(232,64,87,0.18)';

  const splashUrl = champion && championsVersion
    ? `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion}_0.jpg`
    : null;

  const accentColor = isSwapSelected ? '#c89b3c' : isActive ? teamColor : '#1e2328';

  return (
    <Box
      onClick={isSwapPhase ? onSwapClick : undefined}
      sx={{
        position: 'relative',
        flex: 1,
        minHeight: 90,
        display: 'flex',
        overflow: 'hidden',
        background: 'rgba(1,10,19,0.85)',
        borderLeft: isBlue ? `3px solid ${accentColor}` : 'none',
        borderRight: !isBlue ? `3px solid ${accentColor}` : 'none',
        transition: 'all 0.3s ease',
        cursor: isSwapPhase ? 'pointer' : 'default',
        ...(isActive && {
          boxShadow: `inset ${isBlue ? '3px' : '-3px'} 0 24px -4px ${teamColor}66, ${isBlue ? '-6px' : '6px'} 0 20px -8px ${teamColor}55`,
        }),
        ...(isSwapSelected && {
          boxShadow: `inset 0 0 20px rgba(200,155,60,0.35)`,
        }),
        ...(isSwapPhase && !isSwapSelected && {
          '&:hover': {
            '& .pickslot-splash': {
              transform: 'scale(1.05)',
              filter: 'brightness(0.85) saturate(1.1)',
            },
          },
        }),
      }}
    >
      {/* Splash art as full card background */}
      {splashUrl ? (
        <Box
          component="img"
          src={splashUrl}
          alt={champion}
          className="pickslot-splash"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: isBlue ? '30% 20%' : '70% 20%',
            filter: isActive ? 'brightness(0.75) saturate(1.15)' : 'brightness(0.55) saturate(0.9)',
            transition: 'transform 0.5s ease, filter 0.3s ease',
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${isBlue ? '135deg' : '225deg'}, #0a0e13 0%, ${teamColorDim} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: '2.5rem',
              color: 'rgba(60,60,65,0.6)',
              letterSpacing: '0.1em',
            }}
          >
            {role}
          </Typography>
        </Box>
      )}

      {/* Bottom gradient for text legibility */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, rgba(1,10,19,0.95) 0%, rgba(1,10,19,0.7) 30%, rgba(1,10,19,0.15) 55%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Role badge (top corner on team side) */}
      <Box
        sx={{
          position: 'absolute',
          top: 6,
          [isBlue ? 'left' : 'right']: 8,
          px: 0.8,
          py: 0.15,
          background: 'rgba(1,10,19,0.75)',
          border: `1px solid ${isActive ? teamColor : '#1e2328'}`,
          borderRadius: '2px',
          zIndex: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Spiegel", sans-serif',
            fontSize: '0.55rem',
            fontWeight: 700,
            color: isActive ? teamColor : '#a09b8c',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            lineHeight: 1,
          }}
        >
          {role}
        </Typography>
      </Box>

      {/* Swap indicator */}
      {isSwapSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            [isBlue ? 'right' : 'left']: 8,
            zIndex: 3,
            background: 'rgba(200,155,60,0.18)',
            border: '1px solid #c89b3c',
            borderRadius: '2px',
            p: 0.3,
            display: 'flex',
          }}
        >
          <SwapHorizIcon sx={{ fontSize: '0.9rem', color: '#c89b3c' }} />
        </Box>
      )}

      {/* Text block — overlaid at bottom */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          alignSelf: 'flex-end',
          width: '100%',
          px: 1.5,
          pb: 1,
          pt: 2,
          textAlign: isBlue ? 'left' : 'right',
        }}
      >
        {champion && (
          <Typography
            sx={{
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: 'clamp(0.85rem, 1.1vw, 1.15rem)',
              color: '#f0e6d2',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            }}
          >
            {champion}
          </Typography>
        )}
        <Typography
          sx={{
            fontFamily: '"Spiegel", sans-serif',
            fontSize: 'clamp(0.65rem, 0.75vw, 0.78rem)',
            color: champion ? '#a09b8c' : '#5b5a56',
            mt: 0.3,
            letterSpacing: '0.04em',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}
        >
          {displayName || `Player ${slotIndex + 1}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default PickSlot;
