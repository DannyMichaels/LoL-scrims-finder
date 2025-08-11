import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import useScrims, {
  useFilteredScrimsZustand,
} from '@/features/scrims/hooks/useScrimsZustand';
import moment from 'moment';

// components
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { InnerColumn, PageContent } from '@/components/shared/PageComponents';
import Loading from '@/components/shared/Loading';
import Navbar from '@/components/shared/Navbar/Navbar';
import Tooltip from '@/components/shared/Tooltip';
import ScrimsColumn from '@/features/scrims/components/ScrimsColumn';
import GlassPanel from '@/components/shared/GlassPanel';

// icons
import HelpIcon from '@mui/icons-material/Help';
import MenuIcon from '@mui/icons-material/Menu';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
        {/* Welcome Header */}
        <InnerColumn>
          <Box
            sx={{
              mb: 2,
              mt: 1,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(100, 181, 246, 0.15) 0%, transparent 50%)',
                animation: 'pulse 4s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                },
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
                background:
                  'linear-gradient(135deg, #fff 0%, #64B5F6 50%, #2196F3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(33, 150, 243, 0.3)',
                mb: 0.5,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}>
              <SportsEsportsIcon
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: '#2196F3',
                  filter: 'drop-shadow(0 0 10px rgba(33, 150, 243, 0.5))',
                }}
              />
              Scrims Hub
              <EmojiEventsIcon
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: '#FFD700',
                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
                }}
              />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}>
              <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
              {moment(scrimsDate).format('MMMM Do, YYYY')} • {scrimsRegion}{' '}
              Region
            </Typography>
          </Box>
        </InnerColumn>

        <div id="scrims-container">
          {filteredScrims.length > 0 ? (
            <>
              {/* Stats Bar */}
              <InnerColumn>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}>
                  {[
                    {
                      label: 'Playing Now',
                      value: currentScrims.length,
                      color: '#4CAF50',
                      icon: '🔥',
                    },
                    {
                      label: 'Upcoming',
                      value: upcomingScrims.length,
                      color: '#2196F3',
                      icon: '⏰',
                    },
                    {
                      label: 'Completed',
                      value: previousScrims.length,
                      color: '#9E9E9E',
                      icon: '✅',
                    },
                  ].map((stat) => {
                    const iconComponents = {
                      '🔥': <WhatshotIcon sx={{ fontSize: '1.2rem' }} />,
                      '⏰': <ScheduleIcon sx={{ fontSize: '1.2rem' }} />,
                      '✅': <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />,
                    };
                    return (
                      <GlassPanel
                        key={stat.label}
                        variant="elevated"
                        sx={{
                          p: 1.5,
                          flex: '1 1 120px',
                          minWidth: '120px',
                          textAlign: 'center',
                          borderTop: `2px solid ${stat.color}`,
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 10px 30px ${stat.color}40`,
                          },
                        }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: stat.color,
                            mb: 0.25,
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                            }}>
                            {iconComponents[stat.icon]}
                            <span>{stat.value}</span>
                          </Box>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {stat.label}
                        </Typography>
                      </GlassPanel>
                    );
                  })}
                </Box>
              </InnerColumn>

              {/* CURRENT SCRIMS */}
              {currentScrims.length > 0 ? (
                <ScrimsColumn
                  headerText="Current Scrims"
                  headerIcon={<WhatshotIcon sx={{ color: '#ff6b35' }} />}
                  scrims={currentScrims}
                  show={showCurrentScrims}
                />
              ) : null}

              {/* CURRENT SCRIMS END */}

              {/* UPCOMING SCRIMS */}
              <ScrimsColumn
                headerText="Upcoming Scrims"
                headerIcon={<ScheduleIcon sx={{ color: '#2196F3' }} />}
                altText="No upcoming scrims"
                scrims={upcomingScrims}
                show={showUpcomingScrims}
              />

              {/* PREVIOUS SCRIMS */}

              {previousScrims.length ? (
                <ScrimsColumn
                  scrims={previousScrims}
                  headerText="Previous Scrims"
                  headerIcon={<HistoryIcon sx={{ color: '#9E9E9E' }} />}
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
                  p: 6,
                  textAlign: 'center',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '150%',
                    height: '150%',
                    background:
                      'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
                    animation: 'rotate 20s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                      '100%': {
                        transform: 'translate(-50%, -50%) rotate(360deg)',
                      },
                    },
                  }}
                />
                <Grid
                  container
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  spacing={3}
                  sx={{ position: 'relative' }}>
                  <Grid item>
                    <SportsEsportsIcon
                      sx={{
                        fontSize: '4rem',
                        color: '#64B5F6',
                        opacity: 0.5,
                        mb: 2,
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography
                      align="center"
                      variant="h1"
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', md: '2.5rem' },
                        background:
                          'linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2,
                      }}>
                      No scrims found in {scrimsRegion}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        mb: 3,
                      }}>
                      Try changing your filters or check back later
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                      }}>
                      <HelpIcon sx={{ color: '#64B5F6' }} />
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
                            &nbsp;to change the region.
                            <br />
                            or the Scrims Date filter to change the date
                          </>
                        }
                        placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            cursor: 'help',
                          }}>
                          Need help? Hover for tips
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </GlassPanel>
            </InnerColumn>
          )}
        </div>
      </PageContent>
    </>
  );
}
