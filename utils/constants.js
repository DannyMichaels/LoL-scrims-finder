const MONGODB_URI =
  process.env.PROD_MONGODB || 'mongodb://127.0.0.1:27017/scrimsdatabase';

const REGIONS = ['NA', 'EUW', 'EUNE', 'LAN', 'OCE'];

const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-128a91c1-4299-43f3-a34c-3d2294137d41';

module.exports = {
  MONGODB_URI,
  REGIONS,
  RIOT_API_KEY,
};
