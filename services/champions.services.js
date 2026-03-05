const axios = require('axios');

const DDRAGON_VERSIONS_URL =
  'https://ddragon.leagueoflegends.com/api/versions.json';
const DDRAGON_CHAMPIONS_URL = (version) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
const DDRAGON_IMAGE_URL = (version, image) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${image}`;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let cachedChampions = null;
let cachedVersion = null;
let lastFetchTime = null;
let refreshTimer = null;

const fetchLatestVersion = async () => {
  const response = await axios.get(DDRAGON_VERSIONS_URL);
  return response.data[0]; // first element is latest
};

const fetchChampions = async (version) => {
  const response = await axios.get(DDRAGON_CHAMPIONS_URL(version));
  const championsData = response.data.data;

  return Object.values(championsData).map((champ) => ({
    id: champ.id,
    key: champ.key,
    name: champ.name,
    title: champ.title,
    image: champ.image.full,
    imageUrl: DDRAGON_IMAGE_URL(version, champ.image.full),
    tags: champ.tags,
  }));
};

const refreshCache = async () => {
  try {
    const version = await fetchLatestVersion();
    const champions = await fetchChampions(version);

    cachedChampions = champions;
    cachedVersion = version;
    lastFetchTime = Date.now();

    console.log(
      `Champions cache refreshed: ${champions.length} champions (patch ${version})`
    );
  } catch (error) {
    console.error('Failed to refresh champions cache:', error.message);
    // Keep stale cache if refresh fails
  }
};

const initialize = async () => {
  await refreshCache();

  // Schedule periodic refresh
  refreshTimer = setInterval(refreshCache, CACHE_DURATION);

  console.log('Champions service initialized');
};

const getChampions = () => {
  return cachedChampions || [];
};

const getVersion = () => {
  return cachedVersion;
};

const isCacheStale = () => {
  if (!lastFetchTime) return true;
  return Date.now() - lastFetchTime > CACHE_DURATION;
};

const cleanup = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

module.exports = {
  initialize,
  getChampions,
  getVersion,
  isCacheStale,
  cleanup,
};
