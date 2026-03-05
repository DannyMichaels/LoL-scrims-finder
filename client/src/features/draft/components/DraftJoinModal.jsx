import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import useDraftStore from '../stores/draftStore';

const teamBtnBase = {
  py: 2,
  px: 4,
  fontFamily: '"Beaufort for LOL", serif',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  borderRadius: '2px',
  flex: 1,
  maxWidth: 200,
  transition: 'all 0.2s ease',
};

const DraftJoinModal = ({ draftId }) => {
  const { draft, setMyTeam } = useDraftStore();
  const [hoveredTeam, setHoveredTeam] = useState(null);

  if (!draft) return null;

  const handleJoin = (team) => {
    setMyTeam(team);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          p: 5,
          background: 'linear-gradient(135deg, rgba(1,10,19,0.98) 0%, rgba(10,20,40,0.98) 100%)',
          border: '1px solid #1e2328',
          borderRadius: '2px',
          position: 'relative',
          maxWidth: 500,
          width: '90%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: '20%',
            right: '20%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #c89b3c, transparent)',
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '1.4rem',
            color: '#c8aa6e',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            mb: 1,
          }}
        >
          Choose Your Side
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Spiegel", sans-serif',
            color: '#5b5a56',
            fontSize: '0.85rem',
            mb: 4,
          }}
        >
          {draft.blueTeam.name} vs {draft.redTeam.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 3 }}>
          <Button
            onClick={() => handleJoin('blue')}
            onMouseEnter={() => setHoveredTeam('blue')}
            onMouseLeave={() => setHoveredTeam(null)}
            sx={{
              ...teamBtnBase,
              color: '#0ac8b9',
              border: '1px solid rgba(10,200,185,0.3)',
              background: hoveredTeam === 'blue'
                ? 'rgba(10,200,185,0.12)'
                : 'rgba(10,200,185,0.04)',
              boxShadow: hoveredTeam === 'blue'
                ? '0 0 20px rgba(10,200,185,0.15), inset 0 0 20px rgba(10,200,185,0.05)'
                : 'none',
              '&:hover': {
                borderColor: 'rgba(10,200,185,0.6)',
              },
            }}
          >
            {draft.blueTeam.name || 'Blue Side'}
          </Button>

          <Button
            onClick={() => handleJoin('red')}
            onMouseEnter={() => setHoveredTeam('red')}
            onMouseLeave={() => setHoveredTeam(null)}
            sx={{
              ...teamBtnBase,
              color: '#e84057',
              border: '1px solid rgba(232,64,87,0.3)',
              background: hoveredTeam === 'red'
                ? 'rgba(232,64,87,0.12)'
                : 'rgba(232,64,87,0.04)',
              boxShadow: hoveredTeam === 'red'
                ? '0 0 20px rgba(232,64,87,0.15), inset 0 0 20px rgba(232,64,87,0.05)'
                : 'none',
              '&:hover': {
                borderColor: 'rgba(232,64,87,0.6)',
              },
            }}
          >
            {draft.redTeam.name || 'Red Side'}
          </Button>
        </Box>

        <Button
          onClick={() => handleJoin(null)}
          sx={{
            color: '#5b5a56',
            fontFamily: '"Spiegel", sans-serif',
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': { color: '#a09b8c', background: 'transparent' },
          }}
        >
          Spectate
        </Button>
      </Box>
    </Box>
  );
};

export default DraftJoinModal;
