const axios = require('axios');
const { RIOT_API_KEY } = require('../utils/constants');

// Riot API configuration
// Use tournament-stub for testing with development keys
const RIOT_API_BASE_URL = process.env.RIOT_TOURNAMENT_STUB === 'true' 
  ? 'https://americas.api.riotgames.com/lol/tournament-stub/v5'
  : 'https://americas.api.riotgames.com/lol/tournament/v5'; // Fixed: Added /lol/tournament/v5 to base URL

// Valid regions for Tournament API v5 (as per official documentation)
// These are the EXACT values accepted by the API - no mapping needed!
const VALID_REGIONS = [
  'BR', 'EUNE', 'EUW', 'JP', 'LAN', 'LAS', 'NA', 'OCE', 
  'PBE', 'RU', 'TR', 'KR', 'PH', 'SG', 'TH', 'TW', 'VN'
];

// Regional routing for API endpoints (determines which server to hit)
const REGIONAL_ROUTING = {
  'NA': 'americas',
  'BR': 'americas',
  'LAN': 'americas',
  'LAS': 'americas',
  'OCE': 'sea',
  'KR': 'asia',
  'JP': 'asia',
  'EUW': 'europe',
  'EUNE': 'europe',
  'TR': 'europe',
  'RU': 'europe',
  'PH': 'sea',
  'SG': 'sea',
  'TH': 'sea',
  'TW': 'sea',
  'VN': 'sea',
  'PBE': 'americas'  // PBE uses americas routing
};

// Helper function to get the correct base URL for a region
const getRegionalBaseUrl = (region) => {
  const routing = REGIONAL_ROUTING[region.toUpperCase()] || 'americas';
  const apiPath = process.env.RIOT_TOURNAMENT_STUB === 'true' 
    ? '/lol/tournament-stub/v5'
    : '/lol/tournament/v5';
  return `https://${routing}.api.riotgames.com${apiPath}`;
};

// Create axios instance with default headers
const createRiotApi = (region) => {
  return axios.create({
    baseURL: getRegionalBaseUrl(region),
    headers: {
      'X-Riot-Token': RIOT_API_KEY
    }
  });
};

/**
 * Register a tournament provider
 * @param {string} region - The region for the provider (e.g., 'NA', 'EUW')
 * @param {string} callbackUrl - URL to receive game callbacks
 * @returns {Promise<number>} Provider ID
 */
const createTournamentProvider = async (region, callbackUrl) => {
  try {
    // Ensure region is uppercase
    const upperRegion = region?.toUpperCase() || 'NA';
    
    // Validate region
    if (!VALID_REGIONS.includes(upperRegion)) {
      console.error(`Invalid region: ${region}`);
      console.log('Valid regions:', VALID_REGIONS.join(', '));
      throw new Error(`Unsupported region: ${region}. Please use one of: ${VALID_REGIONS.join(', ')}`);
    }
    
    // Create API instance for the correct regional endpoint
    const riotApi = createRiotApi(upperRegion);
    
    const payload = {
      region: upperRegion, // Use the region AS-IS, no mapping!
      url: callbackUrl || `${process.env.API_URL || 'http://localhost:3000'}/api/riot/callback`
    };

    console.log('Creating tournament provider with payload:', JSON.stringify(payload, null, 2));
    console.log(`Using regional endpoint: ${riotApi.defaults.baseURL}/providers`);
    
    const response = await riotApi.post('/providers', payload);
    
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
 * @param {string} region - Region for correct routing
 * @returns {Promise<number>} Tournament ID
 */
const createTournament = async (name, providerId, region) => {
  try {
    const riotApi = createRiotApi(region);
    
    const payload = {
      name: name || 'LoL Scrim Tournament',
      providerId: providerId
    };

    console.log('Creating tournament with payload:', payload);
    
    const response = await riotApi.post('/tournaments', payload);
    
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
 * @param {string} region - Region for correct routing
 * @param {Object} options - Tournament code options
 * @returns {Promise<string[]>} Array of tournament codes
 */
const createTournamentCode = async (tournamentId, region, options = {}) => {
  try {
    const riotApi = createRiotApi(region);
    
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

    // Add allowed participants if provided (specific PUUIDs)
    if (allowedParticipants && Array.isArray(allowedParticipants)) {
      payload.allowedParticipants = allowedParticipants;
    }

    console.log('Creating tournament code with payload:', payload);
    
    const response = await riotApi.post(
      `/codes?tournamentId=${tournamentId}&count=${count}`,
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
 * @param {string} region - Region for correct routing
 * @returns {Promise<Object>} Tournament code details
 */
const getTournamentCode = async (tournamentCode, region) => {
  try {
    const riotApi = createRiotApi(region);
    const response = await riotApi.get(`/codes/${tournamentCode}`);
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
 * @param {string} region - Region for correct routing
 * @param {Object} updates - Updates to apply
 * @returns {Promise<void>}
 */
const updateTournamentCode = async (tournamentCode, region, updates) => {
  try {
    const riotApi = createRiotApi(region);
    
    const payload = {
      allowedParticipants: updates.allowedParticipants,
      mapType: updates.mapType || 'SUMMONERS_RIFT',
      pickType: updates.pickType || 'TOURNAMENT_DRAFT',
      spectatorType: updates.spectatorType || 'ALL'
    };

    await riotApi.put(`/codes/${tournamentCode}`, payload);
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
 * @param {string} region - Region for correct routing
 * @returns {Promise<Object>} Lobby events
 */
const getLobbyEvents = async (tournamentCode, region) => {
  try {
    const riotApi = createRiotApi(region);
    const response = await riotApi.get(`/lobby-events/by-code/${tournamentCode}`);
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
    
    // Validate region
    const upperRegion = region?.toUpperCase();
    if (!VALID_REGIONS.includes(upperRegion)) {
      throw new Error(`Invalid region: ${region}. Valid regions are: ${VALID_REGIONS.join(', ')}`);
    }
    
    // Step 1: Create provider
    console.log('Step 1: Creating tournament provider for region:', upperRegion);
    const providerId = await createTournamentProvider(upperRegion);
    
    // Step 2: Create tournament
    console.log('Step 2: Creating tournament with provider ID:', providerId);
    const tournamentId = await createTournament(title || `Scrim ${_id}`, providerId, upperRegion);
    
    // Step 3: Create tournament code (lobby)
    console.log('Step 3: Creating tournament code for tournament ID:', tournamentId);
    const tournamentCodes = await createTournamentCode(tournamentId, upperRegion, {
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
  VALID_REGIONS,
  REGIONAL_ROUTING
};