const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Store PKCE verifiers temporarily (in production, use Redis)
const pkceStore = new Map();

// Configuration
const config = {
  clientId: process.env.RIOT_CLIENT_ID,
  clientSecret: process.env.RIOT_CLIENT_SECRET,
  redirectUri: process.env.RIOT_REDIRECT_URI || 'http://localhost:3000/api/auth/riot/callback',
  authBaseUrl: 'https://auth.riotgames.com'
};

// Generate PKCE code verifier and challenge
const generatePKCE = () => {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  
  return { verifier, challenge };
};

// Generate state for CSRF protection
const generateState = () => {
  return crypto.randomBytes(32).toString('base64url');
};

// Store PKCE data temporarily
const storePKCE = (state, verifier) => {
  // Clean old entries (older than 10 minutes)
  for (const [key, value] of pkceStore.entries()) {
    if (Date.now() - value.timestamp > 600000) {
      pkceStore.delete(key);
    }
  }
  
  pkceStore.set(state, {
    verifier,
    timestamp: Date.now()
  });
};

// Retrieve and delete PKCE data
const retrievePKCE = (state) => {
  const data = pkceStore.get(state);
  if (data) {
    pkceStore.delete(state);
    return data.verifier;
  }
  return null;
};

// Build authorization URL
const getAuthorizationUrl = (state, codeChallenge) => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid offline_access cpid',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${config.authBaseUrl}/authorize?${params.toString()}`;
};

// Exchange authorization code for tokens
const exchangeCodeForTokens = async (code, codeVerifier) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier
  });

  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      `${config.authBaseUrl}/token`,
      params.toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for tokens');
  }
};

// Get user info from Riot
const getUserInfo = async (accessToken) => {
  try {
    const response = await axios.get(`${config.authBaseUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to get user info:', error.response?.data || error.message);
    throw new Error('Failed to get user info');
  }
};

// Get Riot account data (game name, tag line)
const getRiotAccount = async (accessToken, region = 'americas') => {
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/me`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Riot-Token': process.env.RIOT_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to get Riot account:', error.response?.data || error.message);
    // Return null if we can't get account data (might not have API key yet)
    return null;
  }
};

// Get LoL summoner data using PUUID
const getSummonerByPUUID = async (puuid, platform = 'na1') => {
  if (!process.env.RIOT_API_KEY) {
    console.log('No Riot API key configured, skipping summoner data fetch');
    return null;
  }

  try {
    const response = await axios.get(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to get summoner data:', error.response?.data || error.message);
    return null;
  }
};

// Get ranked data for a summoner
const getRankedData = async (summonerId, platform = 'na1') => {
  if (!process.env.RIOT_API_KEY) {
    return 'Unranked';
  }

  try {
    const response = await axios.get(
      `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY
        }
      }
    );

    // Find solo queue rank
    const soloQueue = response.data.find(
      queue => queue.queueType === 'RANKED_SOLO_5x5'
    );

    if (soloQueue) {
      return `${soloQueue.tier} ${soloQueue.rank}`;
    }

    return 'Unranked';
  } catch (error) {
    console.error('Failed to get ranked data:', error.response?.data || error.message);
    return 'Unranked';
  }
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      `${config.authBaseUrl}/token`,
      params.toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    throw new Error('Failed to refresh token');
  }
};

// Map region codes to platforms
const mapRegionToPlatform = (region) => {
  const regionMap = {
    'na': 'na1',
    'na1': 'na1',
    'euw': 'euw1',
    'euw1': 'euw1',
    'eune': 'eun1',
    'eun1': 'eun1',
    'kr': 'kr',
    'br': 'br1',
    'br1': 'br1',
    'lan': 'la1',
    'la1': 'la1',
    'las': 'la2',
    'la2': 'la2',
    'oce': 'oc1',
    'oc1': 'oc1',
    'tr': 'tr1',
    'tr1': 'tr1',
    'ru': 'ru',
    'jp': 'jp1',
    'jp1': 'jp1'
  };

  return regionMap[region?.toLowerCase()] || 'na1';
};

// Map region to routing value for account API
const mapRegionToRouting = (region) => {
  const routingMap = {
    'na': 'americas',
    'na1': 'americas',
    'br': 'americas',
    'br1': 'americas',
    'lan': 'americas',
    'la1': 'americas',
    'las': 'americas',
    'la2': 'americas',
    'euw': 'europe',
    'euw1': 'europe',
    'eune': 'europe',
    'eun1': 'europe',
    'tr': 'europe',
    'tr1': 'europe',
    'ru': 'europe',
    'kr': 'asia',
    'jp': 'asia',
    'jp1': 'asia',
    'oce': 'sea',
    'oc1': 'sea'
  };

  return routingMap[region?.toLowerCase()] || 'americas';
};

module.exports = {
  generatePKCE,
  generateState,
  storePKCE,
  retrievePKCE,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getUserInfo,
  getRiotAccount,
  getSummonerByPUUID,
  getRankedData,
  refreshAccessToken,
  mapRegionToPlatform,
  mapRegionToRouting
};