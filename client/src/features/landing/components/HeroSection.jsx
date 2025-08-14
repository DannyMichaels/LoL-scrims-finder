import { useHistory } from 'react-router-dom';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';

// Images
import threshBg from '@/assets/images/backgrounds/reluminate_thresh.jpg';

// Shared Components
import CTAButtonShared from './shared/CTAButton';
import SocialButton from './shared/SocialButton';
import { DiscordIcon, TwitchIcon, TwitterIcon } from './shared/SocialIcons';

const HeroSectionWrapper = styled(Box)(({ theme }) => ({
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  paddingTop: '150px',
  paddingBottom: '60px',
  backgroundImage: `url(${threshBg})`,
  backgroundPosition: '50% 30%',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    zIndex: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
}));

export default function HeroSection() {
  const history = useHistory();
  const { handleLogin } = useAuthActions();

  const handleSignupClick = () => {
    history.push('/signup');
  };

  const handleLoginClick = async () => {
    await handleLogin();
  };

  return (
    <HeroSectionWrapper>
      <Container maxWidth="lg">
        <Box textAlign="center">
          <Typography
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
            RELUMINATE.GG
          </Typography>

          <Typography
            sx={{
              color: '#fff',
              mb: 1,
              fontSize: { xs: '1.25rem', md: '1.75rem' },
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
            CONNECTING THE LEAGUE OF LEGENDS COMMUNITY
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 6,
              fontSize: { xs: '1rem', md: '1.5rem' },
              fontWeight: 400,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
            ONE SOUL AT A TIME
          </Typography>

          {/* Social Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
              mb: 6,
            }}>
            <SocialButton
              component="a"
              href="https://www.twitch.tv/reluminategg"
              target="_blank"
              rel="noreferrer">
              FOLLOW OUR TWITCH
              <TwitchIcon />
            </SocialButton>

            <SocialButton
              component="a"
              href="https://discord.com/invite/Fn8d3UAD6y"
              target="_blank"
              rel="noreferrer">
              JOIN US ON DISCORD
              <DiscordIcon />
            </SocialButton>

            <SocialButton
              component="a"
              href="https://twitter.com/Reluminategg"
              target="_blank"
              rel="noreferrer">
              CHECK OUT OUR TWITTER
              <TwitterIcon />
            </SocialButton>
          </Box>

          {/* App CTA Section */}
          <Box
            sx={{
              background: 'rgba(33, 150, 243, 0.05)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              borderRadius: '16px',
              padding: 4,
              maxWidth: '600px',
              margin: '0 auto',
              backdropFilter: 'blur(4px)',
            }}>
            <Typography
              sx={{
                color: '#2196F3',
                fontSize: '1.5rem',
                fontWeight: 600,
                mb: 2,
              }}>
              Ready to Find Your Perfect Scrim?
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 3,
                fontSize: '1rem',
              }}>
              Join our app to connect with players, find custom games, and build
              your team!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <CTAButtonShared
                variant="contained"
                size="large"
                onClick={handleSignupClick}>
                Create Account
              </CTAButtonShared>
              <CTAButtonShared
                variant="outlined"
                size="large"
                onClick={handleLoginClick}>
                Login with Google
              </CTAButtonShared>
            </Box>
          </Box>
        </Box>
      </Container>
    </HeroSectionWrapper>
  );
}
