import { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Navbar from '@/components/shared/Navbar/Navbar';
import {
  InnerColumn,
  PageSection,
  PageContent,
} from '@/components/shared/PageComponents';
import { completeRiotSignup } from '@/features/auth/services/riotAuth.services';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import useAlerts from '@/hooks/useAlerts';

export default function CompleteRiotSignup() {
  const location = useLocation();
  const history = useHistory();
  const { setCurrentUser } = useAuthActions();
  const { setCurrentAlert } = useAlerts();
  
  // Get token from URL params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    discord: '',
    region: 'NA',
    canSendEmailsToUser: false,
  });

  const regions = ['NA', 'EUW', 'EUNE', 'KR', 'BR', 'LAN', 'LAS', 'OCE', 'TR', 'RU', 'JP'];

  useEffect(() => {
    if (!token) {
      setError('Invalid signup token. Please try signing up again.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'canSendEmailsToUser' ? checked : value
    }));
  };

  const validateDiscord = (discord) => {
    // Discord username pattern: username#0000
    const pattern = /^.{2,32}#\d{4}$/;
    return pattern.test(discord);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Discord username
    if (!validateDiscord(formData.discord)) {
      setError('Please enter a valid Discord username (e.g., Username#1234)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await completeRiotSignup(token, formData);
      
      if (result.success) {
        setCurrentUser(result.user);
        setCurrentAlert({
          type: 'Success',
          message: 'Account created successfully! Welcome to LoL Scrims Finder!'
        });
        history.push('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete signup. Please try again.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <Navbar />
        <PageSection>
          <PageContent>
            <InnerColumn>
              <Alert severity="error">
                Invalid signup token. Please <a href="/signup">try signing up again</a>.
              </Alert>
            </InnerColumn>
          </PageContent>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageSection>
        <PageContent>
          <InnerColumn>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                maxWidth: 500,
                mx: 'auto',
                mt: 4,
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                Complete Your Profile
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Your Riot account has been verified! Just a few more details to complete your signup.
              </Typography>

              <Alert severity="info">
                Your summoner name and rank will be automatically fetched from your Riot account.
              </Alert>

              <TextField
                name="discord"
                label="Discord Username"
                value={formData.discord}
                onChange={handleChange}
                helperText="Include the # and numbers (e.g., Username#1234)"
                required
                fullWidth
                variant="outlined"
                inputProps={{
                  pattern: '.{2,32}#\\d{4}',
                  title: 'Discord username with tag (e.g., Username#1234)'
                }}
              />

              <Box>
                <FormHelperText>Select Your Region</FormHelperText>
                <Select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                >
                  {regions.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    name="canSendEmailsToUser"
                    checked={formData.canSendEmailsToUser}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="I agree to receive email notifications about scrims and updates"
              />

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%)',
                  color: '#0c1f1f',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f0e6d2 0%, #c89b3c 100%)',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: '#0c1f1f' }} />
                    Creating Account...
                  </>
                ) : (
                  'Complete Signup'
                )}
              </Button>
            </Box>
          </InnerColumn>
        </PageContent>
      </PageSection>
    </>
  );
}