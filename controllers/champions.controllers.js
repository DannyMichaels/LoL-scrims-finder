const championsService = require('../services/champions.services');

// @route   GET /api/champions
// @desc    Get all champion data (cached from Data Dragon)
// @access  Public (API key only)
const getAllChampions = async (_req, res) => {
  try {
    const champions = championsService.getChampions();

    if (!champions || champions.length === 0) {
      return res.status(503).json({
        success: false,
        error: 'Champion data not yet available. Please try again shortly.',
      });
    }

    return res.status(200).json({
      success: true,
      data: champions,
      version: championsService.getVersion(),
    });
  } catch (error) {
    console.error('Error fetching champions:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllChampions,
};
