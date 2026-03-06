import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Paper,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createDraft } from '../services/draft.services';
import useBranding from '@/hooks/useBranding';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#a09b8c',
    fontFamily: '"Spiegel", sans-serif',
    '& fieldset': { borderColor: '#1e2328' },
    '&:hover fieldset': { borderColor: '#463714' },
    '&.Mui-focused fieldset': { borderColor: '#c89b3c' },
  },
  '& .MuiInputLabel-root': {
    color: '#5b5a56',
    fontFamily: '"Spiegel", sans-serif',
    '&.Mui-focused': { color: '#c89b3c' },
  },
};

const DraftCreateForm = () => {
  const history = useHistory();
  const { brandName, logoUrl } = useBranding();
  const [blueTeamName, setBlueTeamName] = useState('');
  const [redTeamName, setRedTeamName] = useState('');
  const [timerDuration, setTimerDuration] = useState(30);
  const [bestOf, setBestOf] = useState(1);
  const [fearlessMode, setFearlessMode] = useState('off');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blueTeamName.trim() || !redTeamName.trim()) {
      setError('Both team names are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const draft = await createDraft({
        mode: 'captain',
        blueTeamName: blueTeamName.trim(),
        redTeamName: redTeamName.trim(),
        timerDuration,
        bestOf,
        fearlessMode,
      });

      history.push(`/draft/${draft._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0e13 0%, #091428 50%, #0a1628 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        position: 'relative',
      }}
    >
      {/* Back button */}
      <IconButton
        onClick={() => history.push('/scrims')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: '#5b5a56',
          border: '1px solid #1e2328',
          borderRadius: '4px',
          width: 34,
          height: 34,
          '&:hover': {
            color: '#c8aa6e',
            borderColor: '#463714',
            background: 'rgba(1,10,19,0.8)',
          },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: '1rem' }} />
      </IconButton>

      {/* Branding */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3,
        }}
      >
        {logoUrl && (
          <Box
            component="img"
            src={logoUrl}
            alt={brandName}
            sx={{
              height: 192,
              width: 'auto',
              mb: 1.5,
              filter: 'drop-shadow(0 0 12px rgba(200,170,110,0.15))',
            }}
          />
        )}
        <Typography
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            fontSize: '0.7rem',
            color: '#5b5a56',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
          }}
        >
          {brandName}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          maxWidth: 520,
          width: '100%',
          p: 4,
          background: 'linear-gradient(135deg, rgba(1,10,19,0.95) 0%, rgba(10,20,40,0.95) 100%)',
          border: '1px solid #1e2328',
          borderRadius: '2px',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: '15%',
            right: '15%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #c89b3c, transparent)',
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Beaufort for LOL", serif',
            fontWeight: 700,
            color: '#c8aa6e',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textAlign: 'center',
            mb: 4,
            fontSize: '1.6rem',
          }}
        >
          Create Draft
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Team Names */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Blue Team"
              value={blueTeamName}
              onChange={(e) => setBlueTeamName(e.target.value)}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <TextField
              label="Red Team"
              value={redTeamName}
              onChange={(e) => setRedTeamName(e.target.value)}
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Box>

          {/* Timer */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                color: '#a09b8c',
                fontFamily: '"Spiegel", sans-serif',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                mb: 1,
              }}
            >
              Timer: {timerDuration}s
            </Typography>
            <Slider
              value={timerDuration}
              onChange={(_, val) => setTimerDuration(val)}
              min={15}
              max={90}
              step={5}
              sx={{
                color: '#c89b3c',
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  '&:hover': { boxShadow: '0 0 0 8px rgba(200,155,60,0.16)' },
                },
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-rail': { background: '#1e2328' },
              }}
            />
          </Box>

          {/* Best of */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                color: '#a09b8c',
                fontFamily: '"Spiegel", sans-serif',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                mb: 1,
              }}
            >
              Series
            </Typography>
            <ToggleButtonGroup
              value={bestOf}
              exclusive
              onChange={(_, val) => val && setBestOf(val)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  color: '#5b5a56',
                  borderColor: '#1e2328',
                  fontFamily: '"Spiegel", sans-serif',
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  py: 1,
                  '&.Mui-selected': {
                    color: '#c8aa6e',
                    background: 'rgba(200,155,60,0.1)',
                    borderColor: '#463714',
                    '&:hover': { background: 'rgba(200,155,60,0.15)' },
                  },
                },
              }}
            >
              <ToggleButton value={1}>Bo1</ToggleButton>
              <ToggleButton value={3}>Bo3</ToggleButton>
              <ToggleButton value={5}>Bo5</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Fearless Mode — only relevant for series */}
          {bestOf > 1 && (
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>Fearless Mode</InputLabel>
                <Select
                  value={fearlessMode}
                  label="Fearless Mode"
                  onChange={(e) => setFearlessMode(e.target.value)}
                  sx={{ color: '#a09b8c' }}
                >
                  <MenuItem value="off">Off</MenuItem>
                  <MenuItem value="soft">Soft (team-locked)</MenuItem>
                  <MenuItem value="hard">Hard (global lock)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {error && (
            <Typography
              sx={{ color: '#e84057', fontSize: '0.8rem', mb: 2, textAlign: 'center' }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.4,
              background: 'linear-gradient(180deg, #c89b3c 0%, #785a28 100%)',
              color: '#010a13',
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: '1px solid #c89b3c',
              borderRadius: '2px',
              '&:hover': {
                background: 'linear-gradient(180deg, #d4a94b 0%, #8c6a30 100%)',
              },
              '&.Mui-disabled': {
                background: '#1e2328',
                color: '#3c3c41',
                border: '1px solid #1e2328',
              },
            }}
          >
            {loading ? 'Creating...' : 'Create Draft'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DraftCreateForm;
