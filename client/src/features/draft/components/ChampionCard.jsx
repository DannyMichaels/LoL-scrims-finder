import { Box, Typography } from '@mui/material';
import useDraftStore from '../stores/draftStore';

const ChampionCard = ({ champion }) => {
  const selectedChampion = useDraftStore((s) => s.selectedChampion);
  const setSelectedChampion = useDraftStore((s) => s.setSelectedChampion);
  const isMyTurn = useDraftStore((s) => s.isMyTurn);

  const isSelected = selectedChampion?.id === champion.id;
  const isDisabled = !champion.available;
  const isFearless = champion.fearlessLocked && champion.available;
  const canClick = !isDisabled && isMyTurn();

  const handleClick = () => {
    if (!canClick) return;
    setSelectedChampion(isSelected ? null : champion);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: 62,
        cursor: canClick ? 'pointer' : 'default',
        textAlign: 'center',
        opacity: isDisabled ? 0.25 : 1,
        transition: 'all 0.15s ease',
        position: 'relative',
        '&:hover': canClick
          ? {
              transform: 'scale(1.08)',
              zIndex: 2,
            }
          : {},
      }}
    >
      {/* Champion icon */}
      <Box
        sx={{
          width: 54,
          height: 54,
          mx: 'auto',
          borderRadius: '4px',
          overflow: 'hidden',
          border: isSelected
            ? '2px solid #c89b3c'
            : '1px solid #1e2328',
          boxShadow: isSelected
            ? '0 0 12px rgba(200,155,60,0.4)'
            : 'none',
          transition: 'all 0.15s ease',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src={champion.imageUrl}
          alt={champion.name}
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isDisabled ? 'grayscale(100%) brightness(0.3)' : 'none',
          }}
        />

        {/* Fearless lock overlay */}
        {isFearless && (
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 14,
              height: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '2px',
              fontSize: '0.5rem',
            }}
          >
            🔒
          </Box>
        )}
      </Box>

      {/* Name */}
      <Typography
        sx={{
          fontFamily: '"Spiegel", sans-serif',
          fontSize: '0.55rem',
          color: isSelected ? '#c8aa6e' : '#5b5a56',
          mt: 0.3,
          lineHeight: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {champion.name}
      </Typography>
    </Box>
  );
};

export default ChampionCard;
