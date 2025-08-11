import useSWR from 'swr';
import {
  getRiotSummonerData,
  getProfileIconUrl,
  getRankedBorderImage,
} from '../services/riotSummoner.services';
import FallbackImage from '../assets/images/user/fallback-user.png';

// Cache for 30 minutes
const CACHE_TIME = 30 * 60 * 1000;

const fetchSummonerProfile = async (key) => {
  // Parse the key string
  const [summonerName, summonerTagline, region] = key.split('::');

  if (!summonerName || !region) {
    return {
      profileIcon: FallbackImage,
      borderImage: '',
      level: 0,
      rank: null,
      tier: null,
    };
  }

  try {
    // If we have a tagline, use the new Riot API
    if (summonerTagline) {
      const summonerData = await getRiotSummonerData(
        summonerName,
        summonerTagline,
        region
      );

      // Get profile icon URL from profileIconId
      const iconUrl = await getProfileIconUrl(summonerData.profileIconId);

      // Get ranked data
      let borderUrl = '';
      let rank = null;
      let tier = null;

      if (summonerData.rankedData && summonerData.rankedData.length > 0) {
        // Find solo queue rank
        const soloQueue = summonerData.rankedData.find(
          (queue) => queue.queueType === 'RANKED_SOLO_5x5'
        );

        if (soloQueue) {
          borderUrl = getRankedBorderImage(soloQueue.tier, soloQueue.rank);
          rank = soloQueue.rank;
          tier = soloQueue.tier;
        }
      }

      return {
        profileIcon: iconUrl,
        borderImage: borderUrl,
        level: summonerData.summonerLevel || 0,
        rank,
        tier,
      };
    } else {
      // Fallback to default image if no tagline
      return {
        profileIcon: FallbackImage,
        borderImage: '',
        level: 0,
        rank: null,
        tier: null,
      };
    }
  } catch (error) {
    console.error('Error fetching summoner data:', error);
    return {
      profileIcon: FallbackImage,
      borderImage: '',
      level: 0,
      rank: null,
      tier: null,
    };
  }
};

/**
 * Hook to fetch and cache summoner profile data
 * @param {string} summonerName - The summoner name
 * @param {string} summonerTagline - The summoner tagline
 * @param {string} region - The region
 * @returns {Object} Profile data with loading and error states
 */
export default function useSummonerProfile(
  summonerName,
  summonerTagline,
  region
) {
  const { data, error, isLoading } = useSWR(
    summonerName && region && summonerTagline
      ? `${summonerName}::${summonerTagline || ''}::${region}`
      : null,
    fetchSummonerProfile,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_TIME,
      refreshInterval: 0, // Don't auto-refresh
      errorRetryCount: 2,
    }
  );

  return {
    profileData: data || {
      profileIcon: FallbackImage,
      borderImage: '',
      level: 0,
      rank: null,
      tier: null,
    },
    isLoading,
    error,
  };
}
