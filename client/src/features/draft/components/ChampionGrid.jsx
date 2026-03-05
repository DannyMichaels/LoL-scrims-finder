import { Box, TextField, InputAdornment, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useDraftStore from '../stores/draftStore';
import ChampionCard from './ChampionCard';

const ROLE_FILTERS = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

const ChampionGrid = () => {
  const searchQuery = useDraftStore((s) => s.searchQuery);
  const setSearchQuery = useDraftStore((s) => s.setSearchQuery);
  const activeRoleFilter = useDraftStore((s) => s.activeRoleFilter);
  const setActiveRoleFilter = useDraftStore((s) => s.setActiveRoleFilter);
  const getAvailableChampions = useDraftStore((s) => s.getAvailableChampions);
  const championsLoaded = useDraftStore((s) => s.championsLoaded);

  const champions = getAvailableChampions();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Search + Role Filters */}
      <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search champion..."
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#3c3c41', fontSize: '1rem' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              color: '#a09b8c',
              fontFamily: '"Spiegel", sans-serif',
              fontSize: '0.8rem',
              background: 'rgba(1,10,19,0.6)',
              '& fieldset': { borderColor: '#1e2328' },
              '&:hover fieldset': { borderColor: '#463714' },
              '&.Mui-focused fieldset': { borderColor: '#c89b3c' },
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {ROLE_FILTERS.map((role) => (
            <Button
              key={role}
              onClick={() => setActiveRoleFilter(role)}
              size="small"
              sx={{
                minWidth: 0,
                px: 1.2,
                py: 0.2,
                fontFamily: '"Spiegel", sans-serif',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: '2px',
                color: activeRoleFilter === role ? '#c8aa6e' : '#5b5a56',
                background:
                  activeRoleFilter === role
                    ? 'rgba(200,155,60,0.12)'
                    : 'transparent',
                border: `1px solid ${
                  activeRoleFilter === role ? '#463714' : 'transparent'
                }`,
                '&:hover': {
                  background: 'rgba(200,155,60,0.08)',
                  color: '#a09b8c',
                },
              }}
            >
              {role}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Champion grid */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 1,
          py: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          alignContent: 'flex-start',
          justifyContent: 'center',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: '#1e2328',
            borderRadius: 2,
          },
        }}
      >
        {!championsLoaded ? (
          <Typography
            sx={{
              color: '#3c3c41',
              fontFamily: '"Spiegel", sans-serif',
              fontSize: '0.8rem',
              mt: 4,
            }}
          >
            Loading champions...
          </Typography>
        ) : champions.length === 0 ? (
          <Typography
            sx={{
              color: '#3c3c41',
              fontFamily: '"Spiegel", sans-serif',
              fontSize: '0.8rem',
              mt: 4,
            }}
          >
            No champions found
          </Typography>
        ) : (
          champions.map((champ) => (
            <ChampionCard key={champ.id} champion={champ} />
          ))
        )}
      </Box>
    </Box>
  );
};

export default ChampionGrid;
