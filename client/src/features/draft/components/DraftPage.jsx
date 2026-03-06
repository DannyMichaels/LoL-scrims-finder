import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useDraftStore from '../stores/draftStore';
import useDraftSocket from '../hooks/useDraftSocket';
import useChampions from '../hooks/useChampions';
import { getDraftById } from '../services/draft.services';
import DraftBoard from './DraftBoard';
import DraftDrawer from './DraftDrawer';
import DraftJoinModal from './DraftJoinModal';

const DraftPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { draft, myTeam, selectedChampion, setDraft, setTimerExpiresAt, clearDraft } = useDraftStore();
  const { emitReady, emitAction, emitSwapRequest, emitSwapRespond, emitCancel, emitHover } =
    useDraftSocket(id);
  useChampions();

  // Report selected champion to server so it auto-locks on timeout
  useEffect(() => {
    if (selectedChampion) {
      emitHover(selectedChampion.id, selectedChampion.name);
    } else {
      emitHover(null, null);
    }
  }, [selectedChampion, emitHover]);

  // Fetch initial draft state
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDraftById(id);
        setDraft(data);
        // Restore timer from persisted state (instant on refresh)
        if (data.timerExpiresAt) {
          setTimerExpiresAt(data.timerExpiresAt);
        } else if (data.swapPhaseExpiresAt && data.status === 'swap_phase') {
          setTimerExpiresAt(data.swapPhaseExpiresAt);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        history.push('/scrims');
      }
    };
    load();

    return () => clearDraft();
  }, [id]);

  if (!draft) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#0a0e13',
        }}
      >
        <CircularProgress sx={{ color: '#c89b3c' }} />
      </Box>
    );
  }

  // Show join modal if team not selected and draft is waiting/ready
  const showJoinModal =
    myTeam === null &&
    (draft.status === 'waiting' || draft.status === 'ready');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0e13 0%, #091428 40%, #0a1628 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(0,100,200,0.06) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 80% 50%, rgba(200,50,50,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}
    >
      <DraftDrawer emitCancel={emitCancel} />
      {showJoinModal && <DraftJoinModal draftId={id} />}

      {draft.status === 'cancelled' && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Beaufort for LOL", serif',
              fontSize: '3rem',
              fontWeight: 700,
              color: '#c8aa6e',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textShadow: '0 0 30px rgba(200,170,110,0.4)',
            }}
          >
            Draft Cancelled
          </Typography>
        </Box>
      )}

      <DraftBoard
        emitReady={emitReady}
        emitAction={emitAction}
        emitSwapRequest={emitSwapRequest}
        emitSwapRespond={emitSwapRespond}
      />
    </Box>
  );
};

export default DraftPage;
