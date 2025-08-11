import { useEffect, useMemo, useCallback } from 'react';
import useScrimStore from '@/features/scrims/stores/scrimStore';
import useAuth from '@/features/auth/hooks/useAuth';
import { compareDates } from '@/utils/compareDates';
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
    setShowUpcomingScrims,
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
    setShowUpcomingScrims,
  };
}

/**
 * Hook for getting filtered scrims (previous, current, upcoming)
 */
export function useFilteredScrimsZustand() {
  const { allScrimsArray } = useScrimStore();

  const filteredScrims = useMemo(() => {
    // Backend already filters by date, so just return all scrims
    return allScrimsArray;
  }, [allScrimsArray]);

  const currentScrims = useMemo(() => {
    return filteredScrims.filter((scrim) => {
      // A scrim is "current" if:
      // 1. Game has started (past start time)
      // 2. No winner yet (game not finished)
      // 3. Not too old (within 3 hours of start time)
      const isPastStartTime = compareDates(scrim) > 0;
      const isNotFinished = !scrim.teamWon;
      
      // Check if it's within a reasonable time window (3 hours)
      const now = moment();
      const startTime = moment(scrim.gameStartTime);
      const hoursSinceStart = now.diff(startTime, 'hours');
      const isWithinTimeWindow = hoursSinceStart >= 0 && hoursSinceStart < 3;
      
      return isPastStartTime && isNotFinished && isWithinTimeWindow;
    });
  }, [filteredScrims]);

  const previousScrims = useMemo(() => {
    return filteredScrims.filter((scrim) => {
      // A scrim is "previous" if:
      // 1. It has a winner (game finished) OR
      // 2. It's past start time by more than 3 hours (assumed abandoned)
      const hasWinner = !!scrim.teamWon;
      
      if (hasWinner) {
        return true; // Completed games are always previous
      }
      
      // Check if it's an old unfinished game
      const isPastStartTime = compareDates(scrim) > 0;
      const now = moment();
      const startTime = moment(scrim.gameStartTime);
      const hoursSinceStart = now.diff(startTime, 'hours');
      const isOld = hoursSinceStart >= 3;
      
      return isPastStartTime && isOld;
    });
  }, [filteredScrims]);

  const upcomingScrims = useMemo(() => {
    return filteredScrims.filter((scrim) => {
      // A scrim is "upcoming" if it hasn't started yet
      const isBeforeStartTime = compareDates(scrim) <= 0;
      return isBeforeStartTime;
    });
  }, [filteredScrims]);

  return {
    filteredScrims,
    currentScrims,
    previousScrims,
    upcomingScrims,
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
    ...filtered,
  };
}
