import { useEffect, useMemo, useCallback } from 'react';
import useScrimStore from '../stores/scrimStore';
import useAuth from './useAuth';
import { compareDates } from '../utils/compareDates';
import moment from 'moment';

/**
 * Main hook for using scrims from Zustand store
 */
export function useScrimsZustand() {
  const {
    allScrimsArray,
    scrimsLoaded,
    scrimsDate,
    scrimsRegion,
    showPreviousScrims,
    showCurrentScrims,
    showUpcomingScrims,
    fetchAllScrims,
    setScrimsDate,
    setScrimsRegion,
    setShowPreviousScrims,
    setShowCurrentScrims,
    setShowUpcomingScrims
  } = useScrimStore();

  // Fetch scrims when region or date changes
  useEffect(() => {
    if (scrimsRegion && scrimsDate) {
      fetchAllScrims(scrimsRegion, scrimsDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrimsRegion, scrimsDate]); // fetchAllScrims is stable from zustand

  return {
    scrims: allScrimsArray,
    scrimsLoaded,
    scrimsDate: moment(scrimsDate), // Convert back to moment for components that expect it
    scrimsRegion,
    showPreviousScrims,
    showCurrentScrims,
    showUpcomingScrims,
    setScrimsDate,
    setScrimsRegion,
    setShowPreviousScrims,
    setShowCurrentScrims,
    setShowUpcomingScrims
  };
}

/**
 * Hook for getting filtered scrims (previous, current, upcoming)
 */
export function useFilteredScrimsZustand() {
  const { allScrimsArray, scrimsDate } = useScrimStore();
  
  const filteredScrims = useMemo(() => {
    // Filter scrims by selected date
    return allScrimsArray.filter(scrim => {
      const scrimDate = moment(scrim.gameStartTime);
      return scrimDate.isSame(moment(scrimsDate), 'day'); // Convert string back to moment for comparison
    });
  }, [allScrimsArray, scrimsDate]);

  const currentScrims = useMemo(() => {
    const now = moment();
    return filteredScrims.filter(scrim => {
      const startTime = moment(scrim.gameStartTime);
      const endTime = moment(scrim.gameStartTime).add(1, 'hour'); // Assume 1 hour game duration
      return now.isBetween(startTime, endTime);
    });
  }, [filteredScrims]);

  const previousScrims = useMemo(() => {
    return filteredScrims.filter(scrim => {
      return compareDates(scrim) > 0 && !currentScrims.includes(scrim);
    });
  }, [filteredScrims, currentScrims]);

  const upcomingScrims = useMemo(() => {
    return filteredScrims.filter(scrim => {
      return compareDates(scrim) <= 0 && !currentScrims.includes(scrim);
    });
  }, [filteredScrims, currentScrims]);

  return {
    filteredScrims,
    currentScrims,
    previousScrims,
    upcomingScrims
  };
}

/**
 * Hook to set scrims region based on user's region
 */
export function useSetScrimsRegion() {
  const { setScrimsRegion } = useScrimStore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const region = currentUser?.region || 'NA';
    setScrimsRegion(region);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.region]); // setScrimsRegion is stable from zustand
}

/**
 * Hook to fetch scrims on mount and route changes
 * This is now handled by useScrimsZustand, so this just returns a manual fetch function
 */
export function useFetchScrims() {
  const { fetchAllScrims, scrimsRegion, scrimsDate } = useScrimStore();
  
  const fetchScrims = useCallback(async () => {
    const dateToUse = scrimsDate || moment().format('YYYY-MM-DD');
    await fetchAllScrims(scrimsRegion, dateToUse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrimsRegion, scrimsDate]); // fetchAllScrims is stable from zustand

  // Don't auto-fetch here since useScrimsZustand already does it
  // Just return the manual fetch function for RefreshScrimsButton
  return { fetchScrims };
}

// Default export for drop-in replacement
export default function useScrims() {
  const state = useScrimsZustand();
  const filtered = useFilteredScrimsZustand();
  
  return {
    ...state,
    ...filtered
  };
}