import { useEffect, Fragment, useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import useScrims from './../hooks/useScrims';
import { useDispatch } from 'react-redux';

// components
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { InnerColumn, PageContent } from '../components/shared/PageComponents';
import Loading from '../components/shared/Loading';
import Navbar from '../components/shared/Navbar/Navbar';
import Tooltip from '../components/shared/Tooltip';

// utils
import { showEarliestFirst, showLatestFirst } from '../utils/getSortedScrims';
import 'moment-timezone';
import { compareDateWithCurrentTime } from './../utils/compareDateWithCurrentTime';

// icons
import HelpIcon from '@mui/icons-material/Help';
import MenuIcon from '@mui/icons-material/Menu';
import ScrimsColumn from '../components/scrim_components/ScrimsColumn';

// compare scrim start time with now.
const compareDates = (scrim) => {
  let currentTime = new Date().getTime();
  let gameStartTime = new Date(scrim.gameStartTime).getTime();

  if (currentTime < gameStartTime) {
    // if the currentTime is less than the game start time, that means the game didn't start (game is in future)
    return -1;
  } else if (currentTime > gameStartTime) {
    // if the current time is greater than the game start time, that means the game started (game is in past)
    return 1;
  } else {
    return 0;
  }
};

export default function Scrims() {
  const {
    scrims,
    scrimsLoaded,
    scrimsDate,
    scrimsRegion,
    showPreviousScrims,
    showCurrentScrims,
    showUpcomingScrims,
    filteredScrims,
    filteredScrimsByDateAndRegion,
  } = useScrims();

  const dispatch = useDispatch();

  const theme = useTheme();
  const matchesLg = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    dispatch({
      type: 'scrims/setFilteredScrims',
      payload: filteredScrimsByDateAndRegion,
    });
    // this runs everytime scrimsRegion and dateFilteredScrims changes.

    // eslint-disable-next-line
  }, [filteredScrimsByDateAndRegion]);

  let upcomingScrims = useMemo(
    () =>
      // showEarliestFirst is a sorting method. (getSortedScrims.js)
      showEarliestFirst(filteredScrims).filter(
        (scrim) => compareDates(scrim) < 0 // game didn't start
      ),
    [filteredScrims]
  );

  let previousScrims = useMemo(
    () =>
      // showLatestFirst is a sorting method.
      showLatestFirst(
        filteredScrims.filter(
          // if the scrim has a winning team then it ended
          (scrim) => compareDates(scrim) > 0 && scrim.teamWon
        )
      ),
    [filteredScrims]
  );

  let currentScrims = useMemo(
    () =>
      showEarliestFirst(
        filteredScrims.filter(
          // scrims that have started but didn't end (don't have winning team)
          (scrim) => compareDates(scrim) > 0 && !scrim.teamWon
        )
      ),
    [filteredScrims]
  );

  useEffect(() => {
    // if scrimsDate < currentTime
    if (compareDateWithCurrentTime(scrimsDate) > 0) {
      if (!showUpcomingScrims) return;
      // if the scrim is in the past compared to filtered scrims date.
      dispatch({ type: 'scrims/setShowScrims', showUpcoming: false });
    } else {
      if (showUpcomingScrims) return;
      dispatch({ type: 'scrims/setShowScrims', showUpcoming: true });
    }

    // eslint-disable-next-line
  }, [scrimsDate]);

  if (!scrimsLoaded) {
    return <Loading text="Loading Scrims..." />;
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
              <Grid
                container
                direction="row"
                alignItems="center"
                justifyContent="center">
                <Typography
                  align="center"
                  variant="h1"
                  component="h1"
                  className="text-white">
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
                    <HelpIcon fontSize="large" />
                  </Tooltip>
                </Box>
              </Grid>
            </InnerColumn>
          )}
        </div>
      </PageContent>
    </>
  );
}
