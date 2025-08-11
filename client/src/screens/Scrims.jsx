import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import useScrims, {
  useFilteredScrimsZustand,
} from './../hooks/useScrimsZustand';

// components
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { InnerColumn, PageContent } from '../components/shared/PageComponents';
import Loading from '../components/shared/Loading';
import Navbar from '../components/shared/Navbar/Navbar';
import Tooltip from '../components/shared/Tooltip';
import ScrimsColumn from '../components/scrim_components/ScrimsColumn';
import GlassPanel from '../components/shared/GlassPanel';

// icons
import HelpIcon from '@mui/icons-material/Help';
import MenuIcon from '@mui/icons-material/Menu';

export default function Scrims() {
  const {
    scrimsLoaded,
    scrimsDate,
    scrimsRegion,
    showPreviousScrims,
    showCurrentScrims,
    showUpcomingScrims,
  } = useScrims();

  const { filteredScrims, currentScrims, previousScrims, upcomingScrims } =
    useFilteredScrimsZustand();

  const theme = useTheme();
  const matchesLg = useMediaQuery(theme.breakpoints.down('lg'));

  // Removed automatic toggling of showUpcomingScrims to allow manual control

  if (!scrimsLoaded) {
    return <Loading text="Loading Scrims" />;
  }

  return (
    <>
      <Navbar
        scrimsRegion={scrimsRegion}
        scrimsDate={scrimsDate}
        showDropdowns
        showCheckboxes
      />
      <div className="page-break" />

      <PageContent>
        <div id="scrims-container">
          {filteredScrims.length > 0 ? (
            <>
              {/* CURRENT SCRIMS */}
              {currentScrims.length > 0 ? (
                <ScrimsColumn
                  headerText="Current Scrims"
                  scrims={currentScrims}
                  show={showCurrentScrims}
                />
              ) : null}

              {/* CURRENT SCRIMS END */}

              {/* UPCOMING SCRIMS */}
              <ScrimsColumn
                headerText="Upcoming Scrims"
                altText="No upcoming scrims"
                scrims={upcomingScrims}
                show={showUpcomingScrims}
              />

              {/* PREVIOUS SCRIMS */}

              {previousScrims.length ? (
                <ScrimsColumn
                  scrims={previousScrims}
                  headerText="Previous scrims"
                  show={showPreviousScrims}
                />
              ) : null}
            </>
          ) : (
            // if filteredScrims.length is <= 0
            <InnerColumn>
              <GlassPanel
                variant="blue"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justifyContent="center">
                  <Typography
                    align="center"
                    variant="h1"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    No scrims found in {scrimsRegion}
                  </Typography>
                  <Box marginRight={2} />
                  <Box style={{ cursor: 'help' }}>
                    <Tooltip
                      title={
                        <>
                          use the Region dropdown in the
                          {matchesLg ? (
                            <Grid item container alignItems="center">
                              "More Options" ( <MenuIcon fontSize="small" /> )
                              menu
                            </Grid>
                          ) : (
                            ' Navbar/Header'
                          )}
                          &nbsp;to change the region
                        </>
                      }
                      placement="top">
                      <HelpIcon fontSize="large" sx={{ color: '#64B5F6' }} />
                    </Tooltip>
                  </Box>
                </Grid>
              </GlassPanel>
            </InnerColumn>
          )}
        </div>
      </PageContent>
    </>
  );
}
