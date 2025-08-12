import { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
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
import { initRiotLogin, linkAccounts } from '@/features/auth/services/riotAuth.services';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import useAlerts from '@/hooks/useAlerts';

export default function MigrateAccount() {
  const location = useLocation();
  const history = useHistory();
  const { setCurrentUser } = useAuthActions();
  const { setCurrentAlert } = useAlerts();
  
  // Get link token from URL params (if coming from callback)
  const searchParams = new URLSearchParams(location.search);
  const linkToken = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState(null);

  const handleStartMigration = async () => {
    setLoading(true);
    setError(null);

    try {
      const { authUrl } = await initRiotLogin();
      // Redirect to Riot's OAuth page
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to start migration. Please try again.');
      setLoading(false);
    }
  };

  const handleLinkAccounts = async () => {
    if (!linkToken) {
      setError('Invalid link token. Please try the migration process again.');
      return;
    }

    setLinking(true);
    setError(null);

    try {
      const result = await linkAccounts(linkToken);
      
      if (result.success) {
        setCurrentUser(result.user);
        setCurrentAlert({
          type: 'Success',
          message: 'Your account has been successfully migrated to Riot Sign-On!'
        });
        history.push('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to link accounts. Please try again.');
      setLinking(false);
    }
  };

  // If we have a link token, show the confirmation screen
  if (linkToken) {
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
                <Typography variant="h4" component="h1" gutterBottom>
                  Account Migration Ready
                </Typography>

                <Alert severity="success" sx={{ width: '100%' }}>
                  We found your Riot account! Click below to complete the migration.
                </Alert>

                <Typography variant="body1" color="text.secondary">
                  Your existing profile, friends, and scrim history will be preserved.
                  After migration, you'll use Riot Sign-On to log in.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLinkAccounts}
                  disabled={linking}
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
                  {linking ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: '#0c1f1f' }} />
                      Completing Migration...
                    </>
                  ) : (
                    'Complete Migration'
                  )}
                </Button>
              </Box>
            </InnerColumn>
          </PageContent>
        </PageSection>
      </>
    );
  }

  // Otherwise show the initial migration screen
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
                maxWidth: 600,
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" component="h1" gutterBottom>
                Account Migration Required
              </Typography>

              <Alert severity="warning" sx={{ width: '100%' }}>
                Google authentication is no longer supported. You must migrate your account to Riot Sign-On to continue.
              </Alert>

              <Box sx={{ textAlign: 'left', width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  What will happen:
                </Typography>
                <Typography variant="body2" paragraph>
                  • Your profile and stats will be preserved
                </Typography>
                <Typography variant="body2" paragraph>
                  • Your friends list will remain intact
                </Typography>
                <Typography variant="body2" paragraph>
                  • Your scrim history will be maintained
                </Typography>
                <Typography variant="body2" paragraph>
                  • Your summoner name will be updated from Riot
                </Typography>
                <Typography variant="body2" paragraph>
                  • You'll use Riot Sign-On for future logins
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
                onClick={handleStartMigration}
                disabled={loading}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%)',
                  color: '#0c1f1f',
                  fontWeight: 'bold',
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
                    <CircularProgress size={20} sx={{ mr: 1, color: '#0c1f1f' }} />
                    Starting Migration...
                  </>
                ) : (
                  'Start Migration with Riot'
                )}
              </Button>

              <Typography variant="caption" color="text.secondary">
                This is a one-time process. Your account will be permanently migrated to Riot Sign-On.
              </Typography>
            </Box>
          </InnerColumn>
        </PageContent>
      </PageSection>
    </>
  );
}