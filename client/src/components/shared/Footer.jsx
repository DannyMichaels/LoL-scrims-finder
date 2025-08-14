// components
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { InnerColumn } from './PageComponents';
import { Link } from 'react-router-dom';

// utils
import { styled } from '@mui/system';
import { withRouter } from 'react-router-dom';

const StyledFooter = styled('footer')({
  backgroundColor: 'rgba(18, 24, 38, 0.5)', // Semi-transparent
  borderTop: '1px solid rgba(33, 150, 243, 0.2)',
  boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.3)',
  scrollMarginTop: '2em',
  overflow: 'hidden',
  padding: '0 0',
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
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
                fontSize: '12px',
              }}>
              &copy; {currentYear} Reluminate.gg
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
            <Link
              to="/privacy-policy"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                fontSize: '12px',
                marginRight: '16px',
                '&:hover': { color: '#2196F3' },
              }}>
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                fontSize: '12px',
                '&:hover': { color: '#2196F3' },
              }}>
              Terms of Service
            </Link>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '11px',
                fontStyle: 'italic',
              }}>
              Not affiliated with Riot Games
            </Typography>
          </Grid>
        </Grid>
      </InnerColumn>
    </StyledFooter>
  </>
);

export default withRouter(Footer);
