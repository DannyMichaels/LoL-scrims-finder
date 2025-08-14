import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

// Images
import amongusImg from '@/assets/images/landing/amongus.png';
import animeImg from '@/assets/images/landing/anime.webp';

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
                sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.8 }}>
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
                sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.8 }}>
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
                sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.8 }}>
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