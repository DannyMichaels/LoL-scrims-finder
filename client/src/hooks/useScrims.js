import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useInterval from '../hooks/useInterval';
import { getAllScrims } from './../services/scrims';
import devLog from '../utils/devLog';
import { useDispatch, useSelector } from 'react-redux';

export default function useScrims() {
  const { scrims, scrimsLoaded } = useSelector(({ scrims }) => scrims);

  const dispatch = useDispatch();

  const fetchScrims = () => {
    dispatch({ type: 'scrims/toggleFetch' });
  };

  const setScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/setScrims', payload: newScrimsValue });

  return {
    scrims,
    setScrims,
    scrimsLoaded,
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

export const useFetchScrims = () => {
  const { fetch } = useSelector(({ scrims }) => scrims);
  const dispatch = useDispatch();

  const initScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/fetchScrims', payload: newScrimsValue });

  const { pathname } = useLocation();

  useEffect(() => {
    const fetchScrims = async () => {
      devLog('fetching scrims');
      const scrimsData = await getAllScrims();
      initScrims(scrimsData);
    };

    fetchScrims();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch, pathname]);

  return null;
};

const FETCH_INTERVAL = 10000;

// // load scrims every 10 seconds
export const useFetchScrimsInterval = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const loadScrims = async () => {
    if (pathname !== '/sign-up') {
      devLog('fetching scrims (interval)');
      const scrimsData = await getAllScrims();
      dispatch({ type: 'scrims/setScrims', payload: scrimsData });
    }

    // eslint-disable-next-line
  };

  useInterval(loadScrims, FETCH_INTERVAL);

  return null;
};
