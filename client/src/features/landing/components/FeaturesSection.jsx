import useBranding from '@/hooks/useBranding';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { styled, alpha } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';

const HomepageCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  padding: '40px 30px',
  textAlign: 'center',
  height: '100%',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const CircleDiv = styled(Box)(({ theme }) => ({
  width: 90,
  height: 90,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
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
    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
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
  const { featureCards } = useBranding();

  if (!featureCards || featureCards.length === 0) return null;

  // Calculate grid columns: 1-2 cards = 6 cols each, 3+ = 4 cols each
  const mdCols = featureCards.length <= 2 ? 6 : 4;

  return (
    <Box sx={(theme) => ({ backgroundColor: theme.palette.background.paper, py: 8 })}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          {featureCards.map((card, idx) => (
            <Grid item xs={12} md={mdCols} key={card._id || idx}>
              <HomepageCard elevation={0}>
                <CircleDiv>
                  {card.icon ? (
                    <img
                      src={card.icon}
                      alt=""
                      style={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                  ) : (
                    <StarIcon
                      sx={(theme) => ({
                        fontSize: 32,
                        color: theme.palette.primary.main,
                      })}
                    />
                  )}
                </CircleDiv>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: (theme) => theme.palette.primary.main,
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                  {card.title}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginTop: 0,
                    fontSize: 14,
                    lineHeight: '25px',
                    fontWeight: 300,
                    whiteSpace: 'pre-line',
                  }}>
                  {card.description}
                </Typography>
              </HomepageCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
