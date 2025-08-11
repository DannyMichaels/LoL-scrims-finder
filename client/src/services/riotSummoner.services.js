import api from './apiConfig';

/**
 * Get summoner data using Riot ID (gameName + tagLine)
 * This is a two-step process:
 * 1. Get PUUID from Account-v1 API using Riot ID
 * 2. Get summoner data from Summoner-v4 API using PUUID
 *
 * @param {string} gameName - The player's Riot ID game name
 * @param {string} tagLine - The player's tagline (without #)
 * @param {string} region - The region (NA, EUW, etc.)
 * @returns {Promise<Object>} Summoner data including profileIconId
 */
export const getRiotSummonerData = async (gameName, tagLine, region = 'NA') => {
  try {
    // Validate tagLine doesn't contain #
    if (tagLine && tagLine.includes('#')) {
      throw new Error('Tagline should not include # symbol');
    }

    // Call our backend API which will handle the Riot API calls
    const response = await api.get('/riot/summoner', {
      params: {
        gameName,
        tagLine,
        region: region.toUpperCase(),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching Riot summoner data:', error);
    throw error;
  }
};

/**
 * Get the Data Dragon version for constructing CDN URLs
 * @returns {Promise<string>} Latest Data Dragon version
 */
export const getDataDragonVersion = async () => {
  try {
    const response = await api.get('/riot/ddragon-version');
    return response.data.version || '14.24.1';
  } catch (error) {
    console.error('Error fetching Data Dragon version:', error);
    // Fallback to a known version if API fails
    return '14.24.1';
  }
};

/**
 * Construct profile icon URL from profileIconId
 * @param {number} profileIconId - The profile icon ID from summoner data
 * @param {boolean} useDataDragon - Whether to use official Data Dragon or Community Dragon
 * @returns {Promise<string>} Profile icon URL
 */
export const getProfileIconUrl = async (
  profileIconId,
  useDataDragon = true
) => {
  if (!profileIconId) {
    // Return a default icon if no profileIconId
    return '/fallback-user.png';
  }

  if (useDataDragon) {
    try {
      const version = await getDataDragonVersion();
      return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`;
    } catch (error) {
      // Fallback to Community Dragon if Data Dragon fails
      return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileIconId}.jpg`;
    }
  } else {
    // Use Community Dragon (auto-updating, no version needed)
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileIconId}.jpg`;
  }
};

/**
 * Get complete summoner profile including icon URL
 * @param {string} gameName - The player's Riot ID game name
 * @param {string} tagLine - The player's tagline (without #)
 * @param {string} region - The region (NA, EUW, etc.)
 * @returns {Promise<Object>} Complete profile data with icon URL
 */
export const getCompleteProfile = async (gameName, tagLine, region = 'NA') => {
  try {
    // Get summoner data
    const summonerData = await getRiotSummonerData(gameName, tagLine, region);

    // Get profile icon URL
    const profileIconUrl = await getProfileIconUrl(summonerData.profileIconId);

    return {
      ...summonerData,
      profileIconUrl,
      gameName,
      tagLine,
      region,
    };
  } catch (error) {
    console.error('Error fetching complete profile:', error);
    throw error;
  }
};

/**
 * Parse a full Riot ID (GameName#TAG) into components
 * @param {string} fullRiotId - Full Riot ID like "PlayerName#NA1"
 * @returns {Object} Object with gameName and tagLine
 */
export const parseRiotId = (fullRiotId) => {
  if (!fullRiotId || typeof fullRiotId !== 'string') {
    return { gameName: '', tagLine: '' };
  }

  const parts = fullRiotId.split('#');
  return {
    gameName: parts[0] || '',
    tagLine: parts[1] || '',
  };
};

/**
 * Get ranked border image based on tier
 * This returns border decoration for ranked tiers
 * @param {string} tier - The ranked tier (IRON, BRONZE, SILVER, etc.)
 * @param {string} rank - The rank within tier (I, II, III, IV)
 * @returns {string} Border image URL or empty string
 */
export const getRankedBorderImage = (tier, rank) => {
  if (!tier || tier === 'UNRANKED') {
    return '';
  }

  // Map tier to border style
  const tierBorders = {
    IRON: 'iron',
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
    EMERALD: 'emerald',
    DIAMOND: 'diamond',
    MASTER: 'master',
    GRANDMASTER: 'grandmaster',
    CHALLENGER: 'challenger',
  };

  const borderStyle = tierBorders[tier.toUpperCase()];
  if (!borderStyle) {
    return '';
  }

  // Use Community Dragon for ranked borders
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-regalia/plate-prestige/plate-prestige-${borderStyle}.png`;
};
