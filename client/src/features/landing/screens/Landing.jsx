import Box from '@mui/material/Box';

// Components
import LandingNavbar from '../components/LandingNavbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';

export default function Landing() {
  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        backgroundColor: theme.palette.background.paper,
        pb: 2,
      })}>
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
    </Box>
  );
}