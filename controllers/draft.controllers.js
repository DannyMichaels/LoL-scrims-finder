const Draft = require('../models/draft.model');
const draftEngine = require('../services/draftEngine.services');

// @route   POST /api/drafts
// @desc    Create a new draft
// @access  Private
const createDraft = async (req, res) => {
  try {
    const {
      mode,
      blueTeamName,
      redTeamName,
      scrimId,
      timerDuration,
      fearlessMode,
      seriesId,
      gameNumber,
      blueTeamPlayers,
      redTeamPlayers,
      blueCaptain,
      redCaptain,
    } = req.body;

    if (!mode || !blueTeamName || !redTeamName) {
      return res.status(400).json({
        success: false,
        error: 'mode, blueTeamName, and redTeamName are required',
      });
    }

    if (!['captain', 'individual'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'mode must be "captain" or "individual"',
      });
    }

    const draft = await draftEngine.createDraft({
      mode,
      blueTeamName,
      redTeamName,
      scrimId,
      timerDuration,
      fearlessMode,
      seriesId,
      gameNumber,
      createdBy: req.user._id,
      blueTeamPlayers: blueTeamPlayers || [],
      redTeamPlayers: redTeamPlayers || [],
      blueCaptain,
      redCaptain,
    });

    return res.status(201).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error('Error creating draft:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @route   GET /api/drafts/:id
// @desc    Get a draft by ID
// @access  Private
const getDraftById = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id)
      .populate('blueTeam._captain', 'name discord')
      .populate('redTeam._captain', 'name discord')
      .populate('blueTeam.players._user', 'name discord')
      .populate('redTeam.players._user', 'name discord')
      .populate('createdBy', 'name discord')
      .lean();

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: 'Draft not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @route   PATCH /api/drafts/:id/cancel
// @desc    Cancel a draft
// @access  Private
const cancelDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: 'Draft not found',
      });
    }

    if (draft.status === 'completed' || draft.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: `Draft is already ${draft.status}`,
      });
    }

    const cancelled = await draftEngine.cancelDraft(draft);

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(`draft_${draft._id}`).emit('draft:cancelled', {
        draftId: draft._id,
      });
    }

    return res.status(200).json({
      success: true,
      data: cancelled,
    });
  } catch (error) {
    console.error('Error cancelling draft:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @route   GET /api/drafts/scrim/:scrimId
// @desc    Get draft linked to a scrim
// @access  Private
const getDraftByScrimId = async (req, res) => {
  try {
    const draft = await Draft.findOne({ _scrim: req.params.scrimId })
      .sort({ createdAt: -1 })
      .populate('blueTeam._captain', 'name discord')
      .populate('redTeam._captain', 'name discord')
      .lean();

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: 'No draft found for this scrim',
      });
    }

    return res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error('Error fetching draft by scrim:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createDraft,
  getDraftById,
  cancelDraft,
  getDraftByScrimId,
};
