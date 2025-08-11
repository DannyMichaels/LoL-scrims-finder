// components
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { InnerColumn } from './PageComponents';

// utils
import { styled } from '@mui/system';
import { withRouter } from 'react-router-dom';
import { COLORS } from '../../appTheme';

const StyledFooter = styled('footer')({
  backgroundColor: 'rgba(18, 24, 38, 0.5)', // Semi-transparent
  borderTop: '1px solid rgba(33, 150, 243, 0.2)',
  boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.3)',
  scrollMarginTop: '2em',
  overflow: 'hidden',
  padding: '20px 0',
  backdropFilter: 'blur(12px)', // Glass effect
  WebkitBackdropFilter: 'blur(12px)', // Safari support

  // fixed footer.
  position: 'fixed',
  bottom: '0',
  width: '100%',
  zIndex: 100,
});

const currentYear = new Date().getFullYear();

const blacklist = ['/scrims', '/'];

const Footer = ({ location }) => (
  <>
    {!blacklist.includes(location.pathname) && <div className="page-break" />}

    <div className="footer-spacer" />
    <StyledFooter className="page-section site-footer">
      <InnerColumn>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
              }}>
              &copy; {currentYear} Reluminate.gg - Lighting up the rift
            </Typography>
          </Grid>
          <Grid item>
            <Typography 
              variant="body2" 
              sx={{ 
                background: 'linear-gradient(90deg, #64B5F6 0%, #2196F3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
              }}>
              Connecting the League of Legends community, one soul at a time
            </Typography>
          </Grid>
        </Grid>
      </InnerColumn>
    </StyledFooter>
  </>
);

export default withRouter(Footer);
