import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import useAuth from './useAuth';
import useSocket from './useSocket';
import { 
  getScrimsOptimized, 
  getUpcomingScrimsOptimized,
  getCurrentScrimsOptimized,
  getUserScrimsOptimized 
} from '../services/scrims.services.optimized';
import devLog from '../utils/devLog';

/**
 * Optimized hook for fetching and managing scrims with server-side filtering
 */
export const useScrimsOptimized = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
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
  }, [filters]);
  
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

export default useScrimsOptimized;