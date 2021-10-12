import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useInterval from '../hooks/useInterval';
import { getAllScrims, getScrimById } from './../services/scrims';
import devLog from '../utils/devLog';
import { useDispatch, useSelector } from 'react-redux';
import { showEarliestFirst, showLatestFirst } from '../utils/getSortedScrims';

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

export default function useScrims() {
  return useSelector(({ scrims }) => scrims);
}

export function useScrimsActions() {
  const dispatch = useDispatch();

  const setScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/setScrims', payload: newScrimsValue });

  const fetchScrims = async () => {
    const scrimsData = await getAllScrims();
    devLog('fetchedScrims on action');
    dispatch({ type: 'scrims/fetchScrims', payload: scrimsData });
  };

  return {
    setScrims,
    fetchScrims,
  };
}

// sets the scrim region to the users scrim region
export const useSetScrimsRegion = () => {
  const [{ scrimsLoaded, scrimsRegion }, currentUser] = useSelector(
    ({ scrims, auth }) => [scrims, auth?.currentUser]
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentUser?.region) return; // don't run this when we don't have a user yet.

    // if the scrims region is already equal to the currentUsers region, don't proceed
    if (scrimsRegion === currentUser?.region) return;

    // if the scrims have loaded, but the users region is already equal to the scrims region return.
    if (scrimsLoaded && scrimsRegion === currentUser?.region) return;

    // set the scrims region on mount when user is available, or when user changes his region in the settings.
    dispatch({ type: 'scrims/setScrimsRegion', payload: currentUser?.region });

    // eslint-disable-next-line
  }, [currentUser?.region, scrimsLoaded]);

  return null;
};

// separate these into a separate hook to avoid these values being recreated.
export const useFilteredScrims = () => {
  const { scrims, scrimsDate, scrimsRegion, filteredScrims } = useSelector(
    ({ scrims }) => scrims
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'scrims/setFilteredScrims',
    });

    // eslint-disable-next-line
  }, [scrimsDate, scrimsRegion, scrims]);

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

  return {
    currentScrims,
    previousScrims,
    upcomingScrims,
    filteredScrims,
  };
};

// hook to fetch scrims
export const useFetchScrims = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchScrims = async () => {
      devLog('fetching scrims');
      const scrimsData = await getAllScrims();
      dispatch({ type: 'scrims/fetchScrims', payload: scrimsData });

      setTimeout(() => {
        dispatch({ type: 'scrims/setLoading', payload: false });
      }, 500);
    };

    fetchScrims();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

const ONE_SCRIM_FETCH_INTERVAL = 5000;
// load one isBoxExpanded /detail page scrim every 5 seconds, also listens to reload click to re-fetch
export const useFetchScrimInterval = (isInDetail, isBoxExpanded, scrim) => {
  const [scrimData, setScrimData] = useState(scrim);
  const { toggleFetch, scrimsLoading } = useScrims();

  const scrimRef = useRef();

  const isisBoxExpandedRef = useRef();
  const isInDetailRef = useRef();

  useEffect(() => {
    isisBoxExpandedRef.current = isBoxExpanded;
    isInDetailRef.current = isInDetail;
    scrimRef.current = scrim;
  });

  const fetchScrimData = async () => {
    // if user is in detail just continue (dont worry about isBoxExpanded)
    // if user is in home and scrim isn't isBoxExpanded don't continue.
    if (!isisBoxExpandedRef.current && !isInDetailRef.current) return;

    devLog(`fetching one scrim on interval (${scrimRef.current._id})`);

    const oneScrim = await getScrimById(scrimRef.current._id);

    if (oneScrim.createdBy) {
      setScrimData(oneScrim);
    }
  };

  // if user clicks reload, re-fetch the scrim data
  // this only re-fetches the scrims that are visible in the page
  useEffect(() => {
    const fetchOnReloadClick = async () => {
      if (scrimsLoading) return; // do this so it doesn't run that on mount

      devLog(`fetching one scrim on toggleFetch (${scrimRef.current._id})`);

      const oneScrim = await getScrimById(scrimRef.current._id);

      if (oneScrim.createdBy) {
        setScrimData(oneScrim);
      }
    };
    fetchOnReloadClick();

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFetch]);

  useInterval(fetchScrimData, ONE_SCRIM_FETCH_INTERVAL);

  return [scrimData, setScrimData];
};
