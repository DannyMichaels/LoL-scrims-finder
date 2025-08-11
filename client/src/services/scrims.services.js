import api from './apiConfig';

// ===============================
// BASIC CRUD OPERATIONS
// ===============================

export const getAllScrims = async (params = {}) => {
  try {
    // Build query string from params
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/scrims?${queryString}` : '/scrims';

    const response = await api.get(url);

    // Handle both old format (array) and new format (object with data and pagination)
    if (response.data && response.data.data) {
      return response.data.data; // Return just the scrims array for backward compatibility
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getScrimById = async (id) => {
  try {
    const response = await api.get(`/scrims/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===============================
// ADVANCED FILTERING & SEARCH
// ===============================

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
    const response = await api.get(
      `/scrims${queryString ? `?${queryString}` : ''}`
    );
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
    const response = await api.get(
      `/scrims/today${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching today's scrims:", error);
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
    const response = await api.get(
      `/scrims/upcoming${queryString ? `?${queryString}` : ''}`
    );
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
    const response = await api.get(
      `/scrims/current${queryString ? `?${queryString}` : ''}`
    );
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
    const response = await api.get(
      `/scrims/search?q=${encodeURIComponent(query)}`
    );
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
    const response = await api.get(
      `/scrims/user/${userId}${queryString ? `?${queryString}` : ''}`
    );
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

export const createScrim = async (scrim, setCurrentAlert) => {
  try {
    const response = await api.post('/scrims', scrim);
    console.log('new scrim: ', response.data);
    return response.data;
  } catch (error) {
    if (setCurrentAlert) {
      setCurrentAlert({ type: 'Error', message: 'error creating scrim' });
    }

    throw error;
  }
};

export const updateScrim = async (id, scrim) => {
  try {
    const response = await api.put(`/scrims/${id}`, scrim);
    return response.data;
  } catch (error) {
    // Let the calling code handle the error alert to avoid conflicts
    console.error('updateScrim service error:', error);
    throw error;
  }
};

export const insertPlayerInScrim = async ({
  scrimId,
  userId,
  playerData,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  // sending the role joining and the team name inside playerData in the req.body.
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/insert-player/${userId}`,
      { playerData }
    );

    // Update the local state with the response data
    if (setScrim && response.data) {
      setScrim(response.data);
    }

    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);
    const scrim = error.response.data.scrim ?? null;

    if (
      errorMsg ===
      'Player already exists in game. Did you mean to move the player? use the /move-player endpoint instead.'
    ) {
      return;
    }

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);

    return;
  }
};

export const removePlayerFromScrim = async ({
  scrimId,
  userId,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/remove-player/${userId}`
    );

    // Update the local state with the response data
    if (setScrim && response.data) {
      setScrim(response.data);
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response.data?.error ?? error;

    setButtonsDisabled(false);

    setAlert({ type: 'Error', message: errorMsg });

    return;
  }
};

export const movePlayerInScrim = async ({
  scrimId,
  userId,
  playerData,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/move-player/${userId}`,
      { playerData }
    );

    // Update the local state with the response data
    if (setScrim && response.data) {
      setScrim(response.data);
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    const scrim = error.response.data.scrim ?? null;

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);

    return;
  }
};

export const insertCasterInScrim = async ({
  scrimId,
  userId,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/insert-caster/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response.data?.error ?? error?.message ?? JSON.stringify(error);

    const scrim = error.response.data?.scrim ?? null;

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);
    return;
  }
};

export const removeCasterFromScrim = async ({
  scrimId,
  userId,
  setAlert,
  setButtonsDisabled,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/remove-caster/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      JSON.stringify(error.response.data?.error) ??
      error?.message ??
      JSON.stringify(error);

    if (typeof setAlert === 'function') {
      return setAlert({ type: 'Error', message: errorMsg });
    }

    setButtonsDisabled(false);

    return alert(errorMsg);
  }
};

export const addImageToScrim = async (id, data, setAlert) => {
  try {
    const response = await api.patch(`/scrims/${id}/add-image`, data);
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response.data?.error.message ??
      JSON.stringify(error?.message) ??
      JSON.stringify(error);

    if (typeof setAlert === 'function') {
      return setAlert({
        type: 'Error',
        message: errorMsg,
      });
    }

    return alert(errorMsg);
  }
};

export const removeImageFromScrim = async (id) => {
  try {
    const response = await api.patch(`/scrims/${id}/remove-image`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteScrim = async (id) => {
  try {
    const response = await api.delete(`/scrims/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const regenerateTournamentCode = async (id) => {
  try {
    const response = await api.post(`/scrims/${id}/regenerate-tournament-code`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// the who won buttons (only admins or lobby captains/hosts can see)
export const setScrimWinner = async (id, winnerTeamName, setAlert) => {
  try {
    const response = await api.patch(`/scrims/${id}/set-winner`, {
      winnerTeamName,
    });
    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);

    setAlert({ type: 'Error', message: errorMsg });
  }
};

export const swapPlayersInScrim = async ({
  scrimId,
  swapPlayers,
  setButtonsDisabled,
  setAlert,
  setScrim,
}) => {
  // sending the role joining and the team name inside playerData in the req.body.
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/swap-players`,
      swapPlayers
    );
    setAlert({ type: 'Success', message: 'Players swapped!' });

    // Update the local state with the response data
    if (setScrim && response.data) {
      setScrim(response.data);
    }

    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);
    const scrim = error.response.data.scrim ?? null;

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);

    return;
  }
};

// ===============================
// ADMIN FUNCTIONS
// ===============================

export const adminAssignPlayer = async ({
  scrimId,
  userId,
  teamName,
  role,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  try {
    const response = await api.patch(`/scrims/${scrimId}/admin-assign-player`, {
      userId,
      teamName,
      role,
    });

    setAlert({
      type: 'Success',
      message: 'Player assigned successfully!',
    });

    // Update the local state with the response data
    if (setScrim && response.data) {
      setScrim(response.data);
    }

    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);

    setAlert({ type: 'Error', message: errorMsg });

    if (setButtonsDisabled) {
      setButtonsDisabled(false);
    }

    return;
  }
};

export const adminFillRandomPositions = async ({
  scrimId,
  region,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  try {
    const response = await api.patch(`/scrims/${scrimId}/admin-fill-random`, {
      region,
    });

    const { filledPositions, scrim } = response.data;

    setAlert({
      type: 'Success',
      message: `Successfully filled ${filledPositions} positions with random players!`,
    });

    // Update the local state with the response data
    if (setScrim && scrim) {
      setScrim(scrim);
    }

    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);

    setAlert({ type: 'Error', message: errorMsg });

    if (setButtonsDisabled) {
      setButtonsDisabled(false);
    }

    return;
  }
};
