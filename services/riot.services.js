const axios = require('axios');
const { RIOT_API_KEY } = require('../utils/constants');

// Riot API configuration
// Use tournament-stub for testing with development keys
const RIOT_API_BASE_URL = process.env.RIOT_TOURNAMENT_STUB === 'true' 
  ? 'https://americas.api.riotgames.com/lol/tournament-stub/v5'
  : 'https://americas.api.riotgames.com'; // Americas routing for tournament API

// Region mapping for Riot API
const REGION_MAP = {
  'NA': 'NA1',
  'EUW': 'EUW1',
  'EUNE': 'EUN1',
  'BR': 'BR1',
  'LAN': 'LA1',
  'LAS': 'LA2',
  'OCE': 'OC1',
  'RU': 'RU',
  'TR': 'TR1',
  'JP': 'JP1',
  'KR': 'KR',
  'PH': 'PH2',
  'SG': 'SG2',
  'TH': 'TH2',
  'TW': 'TW2',
  'VN': 'VN2'
};

// Axios instance with default headers
const riotApi = axios.create({
  baseURL: RIOT_API_BASE_URL,
  headers: {
    'X-Riot-Token': RIOT_API_KEY
  }
});

/**
 * Register a tournament provider
 * @param {string} region - The region for the provider (e.g., 'NA', 'EUW')
 * @param {string} callbackUrl - URL to receive game callbacks
 * @returns {Promise<number>} Provider ID
 */
const createTournamentProvider = async (region, callbackUrl) => {
  try {
    // Ensure region is uppercase for mapping
    const upperRegion = region?.toUpperCase() || 'NA';
    const regionCode = REGION_MAP[upperRegion];
    
    if (!regionCode) {
      console.error(`No region mapping found for: ${region}`);
      console.log('Available mappings:', REGION_MAP);
      throw new Error(`Unsupported region: ${region}. Please use one of: ${Object.keys(REGION_MAP).join(', ')}`);
    }
    
    const payload = {
      region: regionCode,
      url: callbackUrl || `${process.env.API_URL || 'http://localhost:3000'}/api/riot/callback`
    };

    console.log('Creating tournament provider with payload:', JSON.stringify(payload, null, 2));
    console.log(`Region mapping: ${region} -> ${regionCode}`);
    console.log(`Using API endpoint: ${riotApi.defaults.baseURL}/lol/tournament/v5/providers`);
    
    const response = await riotApi.post('/lol/tournament/v5/providers', payload);
    
    console.log('Tournament provider created successfully. Provider ID:', response.data);
    return response.data; // Returns the provider ID
  } catch (error) {
    console.error('Full error object:', error.response?.data || error);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.status?.message || 
                        error.message;
    throw new Error(`Failed to create tournament provider: ${errorMessage}`);
  }
};

/**
 * Create a tournament
 * @param {string} name - Name of the tournament
 * @param {number} providerId - Provider ID from createTournamentProvider
 * @returns {Promise<number>} Tournament ID
 */
const createTournament = async (name, providerId) => {
  try {
    const payload = {
      name: name || 'LoL Scrim Tournament',
      providerId: providerId
    };

    console.log('Creating tournament with payload:', payload);
    
    const response = await riotApi.post('/lol/tournament/v5/tournaments', payload);
    
    console.log('Tournament created successfully. Tournament ID:', response.data);
    return response.data; // Returns the tournament ID
  } catch (error) {
    console.error('Error creating tournament:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.status?.message || error.message;
    throw new Error(`Failed to create tournament: ${errorMessage}`);
  }
};

/**
 * Create tournament codes (lobby codes)
 * @param {number} tournamentId - Tournament ID from createTournament
 * @param {Object} options - Tournament code options
 * @returns {Promise<string[]>} Array of tournament codes
 */
const createTournamentCode = async (tournamentId, options = {}) => {
  try {
    const {
      count = 1,
      teamSize = 5,
      mapType = 'SUMMONERS_RIFT',
      pickType = 'TOURNAMENT_DRAFT',
      spectatorType = 'ALL',
      metadata = '',
      allowedParticipants = null,
      enoughPlayers = false
    } = options;

    const payload = {
      teamSize,
      mapType,
      pickType,
      spectatorType,
      metadata: metadata || `scrim_${Date.now()}`,
      enoughPlayers
    };

    // Add allowed participants if provided (specific summoner IDs)
    if (allowedParticipants && Array.isArray(allowedParticipants)) {
      payload.allowedParticipants = allowedParticipants;
    }

    console.log('Creating tournament code with payload:', payload);
    
    const response = await riotApi.post(
      `/lol/tournament/v5/codes?tournamentId=${tournamentId}&count=${count}`,
      payload
    );
    
    console.log('Tournament codes created successfully:', response.data);
    return response.data; // Returns array of tournament codes
  } catch (error) {
    console.error('Error creating tournament code:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.status?.message || error.message;
    throw new Error(`Failed to create tournament code: ${errorMessage}`);
  }
};

/**
 * Get tournament code details
 * @param {string} tournamentCode - The tournament code to look up
 * @returns {Promise<Object>} Tournament code details
 */
const getTournamentCode = async (tournamentCode) => {
  try {
    const response = await riotApi.get(`/lol/tournament/v5/codes/${tournamentCode}`);
    return response.data;
  } catch (error) {
    console.error('Error getting tournament code:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.status?.message || error.message;
    throw new Error(`Failed to get tournament code: ${errorMessage}`);
  }
};

/**
 * Update tournament code
 * @param {string} tournamentCode - The tournament code to update
 * @param {Object} updates - Updates to apply
 * @returns {Promise<void>}
 */
const updateTournamentCode = async (tournamentCode, updates) => {
  try {
    const payload = {
      allowedParticipants: updates.allowedParticipants,
      mapType: updates.mapType || 'SUMMONERS_RIFT',
      pickType: updates.pickType || 'TOURNAMENT_DRAFT',
      spectatorType: updates.spectatorType || 'ALL'
    };

    await riotApi.put(`/lol/tournament/v5/codes/${tournamentCode}`, payload);
    console.log('Tournament code updated successfully');
  } catch (error) {
    console.error('Error updating tournament code:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.status?.message || error.message;
    throw new Error(`Failed to update tournament code: ${errorMessage}`);
  }
};

/**
 * Get lobby events for a tournament code
 * @param {string} tournamentCode - The tournament code
 * @returns {Promise<Object>} Lobby events
 */
const getLobbyEvents = async (tournamentCode) => {
  try {
    const response = await riotApi.get(`/lol/tournament/v5/lobby-events/by-code/${tournamentCode}`);
    return response.data;
  } catch (error) {
    console.error('Error getting lobby events:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.status?.message || error.message;
    throw new Error(`Failed to get lobby events: ${errorMessage}`);
  }
};

/**
 * Complete Riot tournament setup flow for a scrim
 * @param {Object} scrimData - Scrim data including region and title
 * @returns {Promise<Object>} Tournament data with provider ID, tournament ID, and code
 */
const setupRiotTournamentForScrim = async (scrimData) => {
  try {
    const { region, title, _id } = scrimData;
    
    // Step 1: Create provider
    console.log('Step 1: Creating tournament provider for region:', region);
    const providerId = await createTournamentProvider(region);
    
    // Step 2: Create tournament
    console.log('Step 2: Creating tournament with provider ID:', providerId);
    const tournamentId = await createTournament(title || `Scrim ${_id}`, providerId);
    
    // Step 3: Create tournament code (lobby)
    console.log('Step 3: Creating tournament code for tournament ID:', tournamentId);
    const tournamentCodes = await createTournamentCode(tournamentId, {
      count: 1,
      metadata: `scrim_${_id}`,
      teamSize: 5,
      pickType: 'TOURNAMENT_DRAFT',
      spectatorType: 'ALL'
    });
    
    const tournamentCode = tournamentCodes[0]; // Get the first (and only) code
    
    console.log('Riot tournament setup complete!');
    console.log('Tournament Code:', tournamentCode);
    
    return {
      providerId,
      tournamentId,
      tournamentCode,
      setupCompleted: true,
      setupTimestamp: new Date()
    };
  } catch (error) {
    console.error('Error in Riot tournament setup flow:', error);
    throw error;
  }
};

module.exports = {
  createTournamentProvider,
  createTournament,
  createTournamentCode,
  getTournamentCode,
  updateTournamentCode,
  getLobbyEvents,
  setupRiotTournamentForScrim,
  REGION_MAP
};