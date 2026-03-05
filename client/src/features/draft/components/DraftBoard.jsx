import { Box } from '@mui/material';
import DraftHeader from './DraftHeader';
import TeamPicksColumn from './TeamPicksColumn';
import BanBar from './BanBar';
import ChampionGrid from './ChampionGrid';
import DraftTimer from './DraftTimer';
import DraftActions from './DraftActions';

const DraftBoard = ({ emitReady, emitAction, emitSwapRequest, emitSwapRespond }) => {
  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Header */}
      <DraftHeader />

      {/* Main grid: Blue Picks | Champion Grid | Red Picks */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '200px 1fr 200px',
          gap: 0,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Blue picks column */}
        <Box
          sx={{
            borderRight: '1px solid #1e2328',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 1,
          }}
        >
          <TeamPicksColumn side="blue" emitSwapRequest={emitSwapRequest} />
        </Box>

        {/* Center: Champion grid */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <ChampionGrid />
        </Box>

        {/* Red picks column */}
        <Box
          sx={{
            borderLeft: '1px solid #1e2328',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 1,
          }}
        >
          <TeamPicksColumn side="red" emitSwapRequest={emitSwapRequest} />
        </Box>
      </Box>

      {/* Bottom bar: Bans | Timer + Actions | Bans */}
      <Box
        sx={{
          borderTop: '1px solid #1e2328',
          display: 'grid',
          gridTemplateColumns: '200px 1fr 200px',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: '10%',
            right: '10%',
            height: '1px',
            background:
              'linear-gradient(90deg, rgba(10,200,185,0.2), transparent 30%, transparent 70%, rgba(232,64,87,0.2))',
          },
        }}
      >
        {/* Blue bans */}
        <BanBar side="blue" />

        {/* Center: Timer + Actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <DraftTimer />
          <DraftActions
            emitReady={emitReady}
            emitAction={emitAction}
          />
        </Box>

        {/* Red bans */}
        <BanBar side="red" />
      </Box>
    </Box>
  );
};

export default DraftBoard;
