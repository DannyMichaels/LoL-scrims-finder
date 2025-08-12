import { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Navbar from '@/components/shared/Navbar/Navbar';
import {
  InnerColumn,
  PageSection,
  PageContent,
} from '@/components/shared/PageComponents';
import useAuth from '@/features/auth/hooks/useAuth';
import { initRiotLogin } from '@/features/auth/services/riotAuth.services';

export default function RiotSignUp() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  if (currentUser?.isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleRiotLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { authUrl } = await initRiotLogin();
      // Redirect to Riot's OAuth page
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initialize Riot login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageSection>
        <PageContent>
          <InnerColumn>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                mt: 8,
                maxWidth: 500,
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" component="h1" gutterBottom>
                Welcome to LoL Scrims Finder
              </Typography>

              <Typography variant="h6" color="text.secondary" gutterBottom>
                Sign up with your Riot account to verify you're a League of Legends player
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  By signing in with Riot, we can:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Verify your summoner name and rank
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Ensure all players are real LoL accounts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Keep the community secure
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleRiotLogin}
                disabled={loading}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%)',
                  color: '#0c1f1f',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f0e6d2 0%, #c89b3c 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(200, 155, 60, 0.3)',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Redirecting to Riot...
                  </>
                ) : (
                  'Sign in with Riot'
                )}
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Note: Google authentication is no longer supported. All users must sign in with Riot.
              </Typography>
            </Box>
          </InnerColumn>
        </PageContent>
      </PageSection>
    </>
  );
}