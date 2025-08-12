import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { loginRiotUser } from '@/features/auth/services/riotAuth.services';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import useAlerts from '@/hooks/useAlerts';

export default function AuthSuccess() {
  const location = useLocation();
  const history = useHistory();
  const { setCurrentUser } = useAuthActions();
  const { setCurrentAlert } = useAlerts();
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      // Handle authentication errors
      if (errorParam === 'banned') {
        const until = searchParams.get('until');
        setError(`Your account is banned until ${new Date(until).toLocaleDateString()}`);
      } else if (errorParam === 'auth_failed') {
        setError('Authentication failed. Please try again.');
      } else {
        setError(`Error: ${errorParam}`);
      }
      
      // Redirect to signup after showing error
      setTimeout(() => {
        history.push('/signup');
      }, 3000);
      return;
    }

    if (token) {
      // Successfully authenticated - log the user in
      try {
        const decodedUser = loginRiotUser(token);
        setCurrentUser(decodedUser);
        setCurrentAlert({
          type: 'Success',
          message: 'Successfully logged in with Riot!'
        });
        history.push('/');
      } catch (err) {
        setError('Failed to process authentication. Please try again.');
        setTimeout(() => {
          history.push('/signup');
        }, 3000);
      }
    } else {
      setError('No authentication token received.');
      setTimeout(() => {
        history.push('/signup');
      }, 3000);
    }
  }, [location, history, setCurrentUser, setCurrentAlert]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      {error ? (
        <>
          <Alert severity="error">
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Redirecting to sign up page...
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress size={48} />
          <Typography variant="h6">
            Authenticating...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we complete your sign in.
          </Typography>
        </>
      )}
    </Box>
  );
}