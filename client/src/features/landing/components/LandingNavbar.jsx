import { useHistory } from 'react-router-dom';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import useBranding from '@/hooks/useBranding';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled, alpha, darken } from '@mui/material/styles';

const NavbarBox = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  zIndex: 1000,
}));

export default function LandingNavbar() {
  const history = useHistory();
  const { handleLogin } = useAuthActions();
  const { brandName, logoUrl, navbarLogoSize, navbarPadding, showNavbarTitle } = useBranding();

  const handleSignupClick = () => {
    history.push('/signup');
  };

  const handleLoginClick = async () => {
    await handleLogin();
  };

  return (
    <NavbarBox>
      <Container maxWidth="lg" sx={{ py: `${navbarPadding}px` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={logoUrl}
              alt={brandName}
              style={{ width: navbarLogoSize, height: navbarLogoSize, objectFit: 'contain' }}
            />
            {showNavbarTitle && (
              <Typography
                sx={{ color: 'text.primary', fontWeight: 600, fontSize: '18px' }}>
                {brandName}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              onClick={handleLoginClick}
              sx={(theme) => ({
                color: theme.palette.text.primary,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                padding: '6px 16px',
                height: '36px',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.1),
                },
              })}
              variant="outlined">
              Login
            </Button>
            <Button
              onClick={handleSignupClick}
              sx={(theme) => ({
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.primary.contrastText,
                padding: '6px 16px',
                height: '36px',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${darken(theme.palette.primary.dark, 0.1)} 100%)`,
                },
              })}
              variant="contained">
              Sign Up
            </Button>
          </Box>
        </Box>
      </Container>
    </NavbarBox>
  );
}