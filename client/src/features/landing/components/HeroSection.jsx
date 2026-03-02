import { useHistory } from 'react-router-dom';
import { useAuthActions } from '@/features/auth/hooks/useAuth';
import useBranding from '@/hooks/useBranding';
import { resolveHeroBackground } from '@/assets/heroBackgrounds';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled, alpha } from '@mui/material/styles';

// Shared Components
import CTAButtonShared from './shared/CTAButton';
import SocialButton from './shared/SocialButton';
import { DiscordIcon, TwitchIcon, TwitterIcon } from './shared/SocialIcons';

const HeroSectionWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgImage',
})(({ theme, bgImage }) => ({
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  paddingTop: '150px',
  paddingBottom: '60px',
  backgroundImage: bgImage ? `url(${bgImage})` : 'none',
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
    backgroundColor: alpha(theme.palette.background.default, 0.85),
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
  const { brandName, tagline, socialLinks, heroBackgroundUrl } = useBranding();
  const heroBg = resolveHeroBackground(heroBackgroundUrl);

  const handleSignupClick = () => {
    history.push('/signup');
  };

  const handleLoginClick = async () => {
    await handleLogin();
  };

  return (
    <HeroSectionWrapper bgImage={heroBg}>
      <Container maxWidth="lg">
        <Box textAlign="center">
          <Typography
            sx={(theme) => ({
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            })}>
            {brandName}
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
            {tagline}
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
            {socialLinks.twitch && (
              <SocialButton
                component="a"
                href={socialLinks.twitch}
                target="_blank"
                rel="noreferrer">
                FOLLOW OUR TWITCH
                <TwitchIcon />
              </SocialButton>
            )}

            {socialLinks.discord && (
              <SocialButton
                component="a"
                href={socialLinks.discord}
                target="_blank"
                rel="noreferrer">
                JOIN US ON DISCORD
                <DiscordIcon />
              </SocialButton>
            )}

            {socialLinks.twitter && (
              <SocialButton
                component="a"
                href={socialLinks.twitter}
                target="_blank"
                rel="noreferrer">
                CHECK OUT OUR TWITTER
                <TwitterIcon />
              </SocialButton>
            )}
          </Box>

          {/* App CTA Section */}
          <Box
            sx={(theme) => ({
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: '16px',
              padding: 4,
              maxWidth: '600px',
              margin: '0 auto',
              backdropFilter: 'blur(4px)',
            })}>
            <Typography
              sx={{
                color: (theme) => theme.palette.primary.main,
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
