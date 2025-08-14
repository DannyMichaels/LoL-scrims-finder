import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

// Images
import amongusImg from '@/assets/images/landing/amongus.png';
import animeImg from '@/assets/images/landing/anime.webp';

// Shared Icons
import { DiscordIcon } from './shared/SocialIcons';

const HomepageCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(18, 24, 38, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(33, 150, 243, 0.15)',
  padding: '40px 30px',
  textAlign: 'center',
  height: '100%',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(33, 150, 243, 0.2)',
    border: '1px solid rgba(33, 150, 243, 0.3)',
  },
}));

const CircleDiv = styled(Box)(({ theme }) => ({
  width: 90,
  height: 90,
  borderRadius: '50%',
  background:
    'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%)',
  border: '2px solid rgba(33, 150, 243, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 25px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '1px solid rgba(33, 150, 243, 0.5)',
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.1)',
      opacity: 0.5,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
}));


export default function FeaturesSection() {
  return (
    <Box sx={{ backgroundColor: '#121826', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <HomepageCard elevation={0}>
              <CircleDiv>
                <img
                  src={amongusImg}
                  alt="events"
                  style={{ width: 32, height: 32 }}
                />
              </CircleDiv>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#2196F3',
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                EVENTS & TOURNAMENTS
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: 0,
                  fontSize: 14,
                  lineHeight: '25px',
                  fontWeight: 300,
                }}>
                5v5 casted customs every friday!
                <br />
                Prized events + giveaways
                <br />
                Random game modes
                <br />
                Guest speakers from your favorite
                <br />
                creators
              </Typography>
            </HomepageCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <HomepageCard elevation={0}>
              <CircleDiv>
                <img
                  src={animeImg}
                  alt="community"
                  style={{ width: 32, height: 32 }}
                />
              </CircleDiv>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#2196F3',
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                COMMUNITY
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: 0,
                  fontSize: 14,
                  lineHeight: '25px',
                  fontWeight: 300,
                }}>
                Everyone has a reason for playing league.
                <br />
                Whether you're trying to climb the ladder,
                <br />
                find a duo, or escape reality. We're
                <br />
                building a community for it all.
              </Typography>
            </HomepageCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <HomepageCard elevation={0}>
              <CircleDiv>
                <DiscordIcon />
              </CircleDiv>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#2196F3',
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                FREE COACHING
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: 0,
                  fontSize: 14,
                  lineHeight: '25px',
                  fontWeight: 300,
                }}>
                Join the Discord for free coaching in
                <br />
                classroom settings from master-challenger
                <br />
                players. All roles, all lanes, all playstyles.
              </Typography>
            </HomepageCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
