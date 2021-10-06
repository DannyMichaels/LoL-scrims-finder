import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useToggle from './../hooks/useToggle';
import useInterval from '../hooks/useInterval';
import { getAllScrims } from './../services/scrims';
import devLog from '../utils/devLog';
import { useDispatch, useSelector } from 'react-redux';

export default function useScrims() {
  const [fetch, toggleFetch] = useToggle();

  const { scrims, scrimsLoaded } = useSelector(({ scrims }) => scrims);
  const dispatch = useDispatch();

  const initScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/fetchScrims', payload: newScrimsValue });

  const setScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/setScrims', payload: newScrimsValue });

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

  const loadScrims = useCallback(async () => {
    if (pathname !== '/sign-up') {
      devLog('fetching scrims (interval)');
      const scrimsData = await getAllScrims();
      setScrims(scrimsData);
    }

    // eslint-disable-next-line
  }, []);

  // load scrims every 10 seconds
  const FETCH_INTERVAL = 10000;
  useInterval(loadScrims, FETCH_INTERVAL);

  return {
    scrims,
    setScrims,
    fetch,
    scrimsLoaded,
    fetchScrims: toggleFetch,
  };
}
