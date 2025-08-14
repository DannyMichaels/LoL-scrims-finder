import { useHistory } from 'react-router-dom';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';

// Images
import threshBg from '@/assets/images/backgrounds/reluminate_thresh.jpg';

const HeroSectionWrapper = styled(Box)(({ theme }) => ({
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  paddingTop: '80px',
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

const DiscordButton = styled(Button)(({ theme }) => ({
  background: 'rgba(33, 150, 243, 0.1)',
  border: '2px solid rgba(33, 150, 243, 0.3)',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '&:hover': {
    background: 'rgba(33, 150, 243, 0.2)',
    border: '2px solid rgba(33, 150, 243, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(33, 150, 243, 0.25)',
  },
}));

const CTAButton = styled(Button)(({ theme }) => ({
  padding: '12px 32px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#2196F3',
    color: '#2196F3',
    '&:hover': {
      borderColor: '#1976D2',
      background: 'rgba(33, 150, 243, 0.1)',
    },
  },
}));

// Discord SVG Icon
const DiscordIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 640 512"
    fill="currentColor"
    style={{ color: '#7289d9' }}>
    <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
  </svg>
);

// Twitch SVG Icon
const TwitchIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ color: '#6441a5' }}>
    <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0H3.857zm9.714 7.429-2.285 2.285H9l-2 2v-2H4.429V1.143h9.142v6.286z" />
    <path d="M11.857 3.143h-1.143V6.57h1.143V3.143zm-3.143 0H7.571V6.57h1.143V3.143z" />
  </svg>
);

// Twitter SVG Icon
const TwitterIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ color: '#00acee' }}>
    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
  </svg>
);

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
            <DiscordButton
              component="a"
              href="https://www.twitch.tv/reluminategg"
              target="_blank"
              rel="noreferrer">
              FOLLOW OUR TWITCH
              <TwitchIcon />
            </DiscordButton>

            <DiscordButton
              component="a"
              href="https://discord.com/invite/Fn8d3UAD6y"
              target="_blank"
              rel="noreferrer">
              JOIN US ON DISCORD
              <DiscordIcon />
            </DiscordButton>

            <DiscordButton
              component="a"
              href="https://twitter.com/Reluminategg"
              target="_blank"
              rel="noreferrer">
              CHECK OUT OUR TWITTER
              <TwitterIcon />
            </DiscordButton>
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
              Join our app to connect with players, find custom games, and
              build your team!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <CTAButton
                variant="contained"
                size="large"
                onClick={handleSignupClick}>
                Create Account
              </CTAButton>
              <CTAButton
                variant="outlined"
                size="large"
                onClick={handleLoginClick}>
                Login with Google
              </CTAButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </HeroSectionWrapper>
  );
}