import api from './apiConfig';

/**
 * Initialize Riot tournament for a scrim
 * @param {string} scrimId - The scrim ID
 * @returns {Promise<Object>} Tournament data
 */
export const initializeRiotTournament = async (scrimId) => {
  try {
    const response = await api.post(`/scrims/${scrimId}/riot/initialize`);
    return response.data;
  } catch (error) {
    console.error('Error initializing Riot tournament:', error);
    throw error;
  }
};

/**
 * Get tournament code for a scrim
 * @param {string} scrimId - The scrim ID
 * @returns {Promise<Object>} Tournament code data
 */
export const getTournamentCode = async (scrimId) => {
  try {
    const response = await api.get(`/scrims/${scrimId}/riot/tournament-code`);
    return response.data;
  } catch (error) {
    console.error('Error getting tournament code:', error);
    throw error;
  }
};

/**
 * Update tournament participants
 * @param {string} scrimId - The scrim ID
 * @param {Array<string>} allowedParticipants - Array of summoner names
 * @returns {Promise<Object>} Updated participants data
 */
export const updateTournamentParticipants = async (scrimId, allowedParticipants) => {
  try {
    const response = await api.put(`/scrims/${scrimId}/riot/participants`, {
      allowedParticipants
    });
    return response.data;
  } catch (error) {
    console.error('Error updating tournament participants:', error);
    throw error;
  }
};

/**
 * Get lobby events for a scrim
 * @param {string} scrimId - The scrim ID
 * @returns {Promise<Object>} Lobby events data
 */
export const getLobbyEvents = async (scrimId) => {
  try {
    const response = await api.get(`/scrims/${scrimId}/riot/lobby-events`);
    return response.data;
  } catch (error) {
    console.error('Error getting lobby events:', error);
    throw error;
  }
};