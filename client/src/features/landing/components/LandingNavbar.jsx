import { useHistory } from 'react-router-dom';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';

const NavbarBox = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(10, 14, 26, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(33, 150, 243, 0.1)',
  zIndex: 1000,
  padding: '16px 0',
}));

export default function LandingNavbar() {
  const history = useHistory();
  const { handleLogin } = useAuthActions();

  const handleSignupClick = () => {
    history.push('/signup');
  };

  const handleLoginClick = async () => {
    await handleLogin();
  };

  return (
    <NavbarBox>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src="/reluminate-logo.png"
              alt="logo"
              style={{ width: 32, height: 32 }}
            />
            <Typography
              sx={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
              RELUMINATE.GG
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              onClick={handleLoginClick}
              sx={{
                color: '#fff',
                borderColor: 'rgba(33, 150, 243, 0.5)',
                padding: '6px 16px',
                height: '36px',
                '&:hover': {
                  borderColor: '#2196F3',
                  background: 'rgba(33, 150, 243, 0.1)',
                },
              }}
              variant="outlined">
              Login
            </Button>
            <Button
              onClick={handleSignupClick}
              sx={{
                background:
                  'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: '#fff',
                padding: '6px 16px',
                height: '36px',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                },
              }}
              variant="contained">
              Sign Up
            </Button>
          </Box>
        </Box>
      </Container>
    </NavbarBox>
  );
}