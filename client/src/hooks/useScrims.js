import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useInterval from '../hooks/useInterval';
import { getAllScrims } from './../services/scrims';
import devLog from '../utils/devLog';
import { useDispatch, useSelector } from 'react-redux';

export default function useScrims() {
  const { scrims, scrimsLoaded } = useSelector(({ scrims }) => scrims);

  const dispatch = useDispatch();

  const fetchScrims = () => {
    console.log('test');
    dispatch({ type: 'scrims/toggleFetch' });
  };

  const initScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/fetchScrims', payload: newScrimsValue });

  const setScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/setScrims', payload: newScrimsValue });

  const { pathname } = useLocation();

  const loadScrims = async () => {
    if (pathname !== '/sign-up') {
      devLog('fetching scrims (interval)');
      const scrimsData = await getAllScrims();
      dispatch({ type: 'scrims/setScrims', payload: scrimsData });
    }

    // eslint-disable-next-line
  };

  // // load scrims every 10 seconds
  const FETCH_INTERVAL = 10000;
  let useFetchScrimsInterval = () => useInterval(loadScrims, FETCH_INTERVAL);

  return {
    scrims,
    setScrims,
    scrimsLoaded,
    fetchScrims,
    loadScrims,
    useFetchScrimsInterval,
    initScrims,
  };
}

export const useFetchScrims = () => {
  const { fetch } = useSelector(({ scrims }) => scrims);
  const dispatch = useDispatch();

  const initScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/fetchScrims', payload: newScrimsValue });

  const { pathname } = useLocation();

  useEffect(() => {
    console.log('f', fetch);
    const fetchScrims = async () => {
      devLog('fetching scrims');
      const scrimsData = await getAllScrims();
      initScrims(scrimsData);
    };

    fetchScrims();
  }, [fetch, pathname]);

  return null;
};
