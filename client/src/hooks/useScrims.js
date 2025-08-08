import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import useAuth from './useAuth';
import useSocket from './useSocket';
import { showEarliestFirst, showLatestFirst } from '../utils/getSortedScrims';
import { compareDates } from '../utils/compareDates';
import { 
  getScrimsOptimized, 
  getUpcomingScrimsOptimized,
  getCurrentScrimsOptimized,
  getUserScrimsOptimized,
  getAllScrims 
} from '../services/scrims.services';
import devLog from '../utils/devLog';

/**
 * Optimized hook for fetching and managing scrims with server-side filtering
 */
export const useScrimsOptimized = () => {
  const dispatch = useDispatch();
  // const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrims, setScrims] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    date: moment().format('YYYY-MM-DD'),
    region: currentUser?.region || 'NA',
    status: null, // null means show all
    includePrivate: false,
    fullTeamsOnly: false,
    sortBy: 'gameStartTime',
    sortOrder: 'asc',
    page: 1,
    limit: 50
  });
  
  /**
   * Fetch scrims with current filters
   */
  const fetchScrims = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      devLog('Fetching scrims with filters:', filters);
      const response = await getScrimsOptimized(filters);
      
      if (response.success) {
        setScrims(response.data);
        setPagination(response.pagination);
        
        // Update Redux store if needed for compatibility
        dispatch({ 
          type: 'scrims/setOptimizedScrims', 
          payload: {
            scrims: response.data,
            filters,
            pagination: response.pagination
          }
        });
      }
    } catch (err) {
      console.error('Error fetching scrims:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);
  
  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset page when filters change
    }));
  }, []);
  
  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);
  
  /**
   * Filter scrims by status locally (for quick filtering without API call)
   */
  const filteredScrims = useMemo(() => {
    const now = new Date();
    
    switch (filters.status) {
      case 'upcoming':
        return scrims.filter(s => new Date(s.gameStartTime) > now && !s.teamWon);
      case 'current':
        return scrims.filter(s => new Date(s.gameStartTime) <= now && !s.teamWon);
      case 'previous':
        return scrims.filter(s => new Date(s.gameStartTime) <= now && s.teamWon);
      default:
        return scrims;
    }
  }, [scrims, filters.status]);
  
  /**
   * Fetch scrims when filters change
   */
  useEffect(() => {
    fetchScrims();
  }, [fetchScrims]);
  
  /**
   * Listen for socket updates
   */
  useEffect(() => {
    if (!socket) return;
    
    const handleScrimUpdate = (updatedScrim) => {
      devLog('Received scrim update:', updatedScrim);
      
      // Update local state
      setScrims(prev => prev.map(s => 
        s._id === updatedScrim._id ? updatedScrim : s
      ));
    };
    
    const handleScrimCreate = (newScrim) => {
      devLog('Received new scrim:', newScrim);
      
      // Check if scrim matches current filters
      const matchesFilters = (
        (!filters.date || moment(newScrim.gameStartTime).format('YYYY-MM-DD') === filters.date) &&
        (!filters.region || newScrim.region === filters.region) &&
        (filters.includePrivate || !newScrim.isPrivate)
      );
      
      if (matchesFilters) {
        setScrims(prev => [...prev, newScrim].sort((a, b) => {
          const order = filters.sortOrder === 'desc' ? -1 : 1;
          return order * (new Date(a.gameStartTime) - new Date(b.gameStartTime));
        }));
      }
    };
    
    const handleScrimDelete = (scrimId) => {
      devLog('Received scrim deletion:', scrimId);
      setScrims(prev => prev.filter(s => s._id !== scrimId));
    };
    
    socket.on('scrimUpdate', handleScrimUpdate);
    socket.on('scrimCreate', handleScrimCreate);
    socket.on('scrimDelete', handleScrimDelete);
    socket.on('tournamentInitialized', handleScrimUpdate);
    
    return () => {
      socket.off('scrimUpdate', handleScrimUpdate);
      socket.off('scrimCreate', handleScrimCreate);
      socket.off('scrimDelete', handleScrimDelete);
      socket.off('tournamentInitialized', handleScrimUpdate);
    };
  }, [socket, filters]);
  
  return {
    scrims: filteredScrims,
    allScrims: scrims,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    refreshScrims: fetchScrims
  };
};

/**
 * Hook for fetching upcoming scrims
 */
export const useUpcomingScrims = (region = null, hoursAhead = 24) => {
  const [scrims, setScrims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      try {
        const response = await getUpcomingScrimsOptimized({ 
          region, 
          hoursAhead,
          limit: 20 
        });
        if (response.success) {
          setScrims(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcoming();
  }, [region, hoursAhead]);
  
  return { scrims, loading, error };
};

/**
 * Hook for fetching current/active scrims
 */
export const useCurrentScrims = (region = null) => {
  const [scrims, setScrims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCurrent = async () => {
      setLoading(true);
      try {
        const response = await getCurrentScrimsOptimized({ region });
        if (response.success) {
          setScrims(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrent();
    
    // Refresh every 30 seconds to keep current scrims updated
    const interval = setInterval(fetchCurrent, 30000);
    
    return () => clearInterval(interval);
  }, [region]);
  
  return { scrims, loading, error };
};

/**
 * Hook for fetching user-specific scrims
 */
export const useUserScrims = (userId, role = null) => {
  const [scrims, setScrims] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserScrims = async () => {
      setLoading(true);
      try {
        const response = await getUserScrimsOptimized(userId, role);
        if (response.success) {
          setScrims(response.data);
          setStats(response.stats || {});
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserScrims();
  }, [userId, role]);
  
  return { scrims, stats, loading, error };
};

// Compatibility exports for existing code
export function useScrimsActions() {
  const dispatch = useDispatch();
  
  return {
    setAllScrims: (scrims) => dispatch({ type: 'scrims/setAllScrims', payload: scrims }),
    setFilteredScrims: (scrims) => dispatch({ type: 'scrims/setFilteredScrims', payload: scrims }),
    addScrim: (scrim) => dispatch({ type: 'scrims/addScrim', payload: scrim }),
    updateScrim: (scrim) => dispatch({ type: 'scrims/updateScrim', payload: scrim }),
    deleteScrim: (id) => dispatch({ type: 'scrims/deleteScrim', payload: id }),
  };
}

export const useSetScrimsRegion = () => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  useEffect(() => {
    const region = currentUser?.region ?? 'NA';
    dispatch({ type: 'scrims/setScrimsRegion', payload: region });
  }, [currentUser?.region, dispatch]);
};

export const useFilteredScrims = () => {
  const { scrimsDate, scrimsRegion, allScrims, filteredScrims } = useSelector((state) => state.scrims);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!allScrims?.length) {
      dispatch({ type: 'scrims/setFilteredScrims', payload: [] });
      return;
    }

    let filteredScrims = [...allScrims];

    // Filter by date
    if (scrimsDate) {
      filteredScrims = filteredScrims.filter((scrim) => {
        const scrimDate = moment(scrim.gameStartTime);
        return scrimDate.isSame(scrimsDate, 'day');
      });
    }

    // Filter by region
    if (scrimsRegion) {
      filteredScrims = filteredScrims.filter((scrim) => scrim.region === scrimsRegion);
    }

    dispatch({ type: 'scrims/setFilteredScrims', payload: filteredScrims });
  }, [scrimsDate, scrimsRegion, allScrims, dispatch]);

  // Calculate derived scrims
  const upcomingScrims = useMemo(
    () =>
      showEarliestFirst(filteredScrims || []).filter(
        (scrim) => compareDates(scrim) < 0 // game didn't start
      ),
    [filteredScrims]
  );

  const previousScrims = useMemo(
    () =>
      showLatestFirst(
        (filteredScrims || []).filter(
          // if the scrim has a winning team then it ended
          (scrim) => compareDates(scrim) > 0 && scrim.teamWon
        )
      ),
    [filteredScrims]
  );

  const currentScrims = useMemo(
    () =>
      showEarliestFirst(
        (filteredScrims || []).filter(
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

export function useFetchScrims() {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const location = useLocation();
  const { scrimsDate, scrimsRegion } = useSelector(({ scrims }) => scrims);

  const fetchScrims = useCallback(async () => {
    try {
      // Build query params
      const params = {};
      
      // Always add date filter - use today if not set
      const dateToUse = scrimsDate || moment();
      params.date = moment(dateToUse).format('YYYY-MM-DD');
      
      // Add region filter if set
      if (scrimsRegion) {
        params.region = scrimsRegion;
      }
      
      devLog('Fetching scrims with params:', params);
      
      // Fetch with filters
      const scrimsData = await getAllScrims(params);
      dispatch({ type: 'scrims/fetchScrims', payload: scrimsData });
    } catch (error) {
      console.error('Error fetching scrims:', error);
    }
  }, [dispatch, scrimsDate, scrimsRegion]);

  useEffect(() => {
    if (location.pathname === '/' && currentUser) {
      fetchScrims();
    }
  }, [location.pathname, currentUser, fetchScrims, scrimsDate, scrimsRegion]);

  return { fetchScrims };
}

export const useScrimSocket = (scrimData, isBoxExpanded) => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const [scrim, setScrim] = useState(scrimData);

  useEffect(() => {
    setScrim(scrimData);
  }, [scrimData]);

  useEffect(() => {
    if (!socket || !scrimData || !isBoxExpanded) return;

    socket.emit('join_scrim_room', { scrimId: scrimData._id });

    const handleScrimUpdate = (data) => {
      if (data && data.scrim) {
        setScrim(data.scrim);
        dispatch({ type: 'scrims/updateScrim', payload: data.scrim });
      }
    };

    socket.on('scrim_updated', handleScrimUpdate);
    socket.on('getScrimTransaction', handleScrimUpdate);

    return () => {
      socket.emit('leave_scrim_room', { scrimId: scrimData._id });
      socket.off('scrim_updated', handleScrimUpdate);
      socket.off('getScrimTransaction', handleScrimUpdate);
    };
  }, [socket, scrimData, isBoxExpanded, dispatch]);

  return [scrim, setScrim];
};


// Default export with basic scrims selector for compatibility
export default function useScrims() {
  const scrims = useSelector((state) => state.scrims);
  return scrims;
}

