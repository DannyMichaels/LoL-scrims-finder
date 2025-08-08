import api from './apiConfig';

/**
 * Get scrims with advanced filtering
 * @param {Object} params - Query parameters
 * @param {string} params.date - Filter by specific date
 * @param {string} params.startDate - Start date for range
 * @param {string} params.endDate - End date for range
 * @param {string} params.region - Filter by region
 * @param {string} params.status - Filter by status (upcoming/current/previous)
 * @param {boolean} params.includePrivate - Include private scrims
 * @param {boolean} params.fullTeamsOnly - Only show scrims with full teams
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const getScrimsOptimized = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/scrims${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching scrims:', error);
    throw error;
  }
};

/**
 * Get today's scrims
 * @param {string} region - Optional region filter
 */
export const getTodaysScrimsOptimized = async (region) => {
  try {
    const params = region ? { region } : {};
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/scrims/today${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s scrims:', error);
    throw error;
  }
};

/**
 * Get upcoming scrims
 * @param {Object} params - Query parameters
 */
export const getUpcomingScrimsOptimized = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/scrims/upcoming${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming scrims:', error);
    throw error;
  }
};

/**
 * Get current/active scrims
 * @param {Object} params - Query parameters
 */
export const getCurrentScrimsOptimized = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/scrims/current${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current scrims:', error);
    throw error;
  }
};

/**
 * Search scrims by title or creator
 * @param {string} query - Search query
 */
export const searchScrimsOptimized = async (query) => {
  try {
    const response = await api.get(`/scrims/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching scrims:', error);
    throw error;
  }
};

/**
 * Get user's scrims
 * @param {string} userId - User ID
 * @param {string} role - Role filter (creator/player/captain/caster)
 */
export const getUserScrimsOptimized = async (userId, role) => {
  try {
    const params = role ? { role } : {};
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/scrims/user/${userId}${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user scrims:', error);
    throw error;
  }
};

/**
 * Get scrim statistics
 */
export const getScrimStatsOptimized = async () => {
  try {
    const response = await api.get('/scrims/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching scrim stats:', error);
    throw error;
  }
};

// Keep existing CRUD functions but use the optimized response format
export { 
  getScrimById,
  createScrim,
  updateScrim,
  deleteScrim,
  insertPlayerInScrim,
  removePlayerFromScrim,
  insertCasterInScrim,
  removeCasterFromScrim,
  movePlayerInScrim,
  swapPlayersInScrim,
  setScrimWinner,
  addImageToScrim,
  removeImageFromScrim
} from './scrims.services';