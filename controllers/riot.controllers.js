const Scrim = require('../models/scrim.model');
const riotServices = require('../services/riot.services');

/**
 * Initialize Riot tournament for a scrim when countdown reaches 0
 * This creates provider, tournament, and tournament code
 */
const initializeRiotTournament = async (req, res) => {
  try {
    const { scrimId } = req.params;
    
    // Find the scrim
    const scrim = await Scrim.findById(scrimId);
    
    if (!scrim) {
      return res.status(404).json({
        success: false,
        message: 'Scrim not found'
      });
    }

    // Check if tournament is already setup
    if (scrim.riotTournament?.setupCompleted) {
      return res.status(200).json({
        success: true,
        message: 'Tournament already initialized',
        data: {
          tournamentCode: scrim.riotTournament.tournamentCode,
          providerId: scrim.riotTournament.providerId,
          tournamentId: scrim.riotTournament.tournamentId
        }
      });
    }

    // Check if game start time has been reached
    const now = new Date();
    const gameStartTime = new Date(scrim.gameStartTime);
    
    if (now < gameStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot initialize tournament before game start time',
        timeRemaining: gameStartTime - now
      });
    }

    console.log(`Initializing Riot tournament for scrim: ${scrimId}`);
    
    // Setup Riot tournament (provider, tournament, and code)
    const tournamentData = await riotServices.setupRiotTournamentForScrim(scrim);
    
    // Update scrim with tournament data
    scrim.riotTournament = {
      ...tournamentData,
      lobbyCreated: true
    };

    // Also update the lobby name with the tournament code
    scrim.lobbyName = tournamentData.tournamentCode;
    
    await scrim.save();

    console.log(`Riot tournament initialized successfully for scrim: ${scrimId}`);
    
    // Emit socket event to notify all connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(`scrim_${scrimId}`).emit('tournamentInitialized', {
        scrimId,
        tournamentCode: tournamentData.tournamentCode,
        lobbyName: tournamentData.tournamentCode
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tournament initialized successfully',
      data: {
        tournamentCode: tournamentData.tournamentCode,
        providerId: tournamentData.providerId,
        tournamentId: tournamentData.tournamentId,
        lobbyName: tournamentData.tournamentCode
      }
    });
  } catch (error) {
    console.error('Error initializing Riot tournament:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize tournament',
      error: error.message
    });
  }
};

/**
 * Get tournament code for a scrim
 */
const getTournamentCode = async (req, res) => {
  try {
    const { scrimId } = req.params;
    
    const scrim = await Scrim.findById(scrimId);
    
    if (!scrim) {
      return res.status(404).json({
        success: false,
        message: 'Scrim not found'
      });
    }

    if (!scrim.riotTournament?.tournamentCode) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not initialized for this scrim'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        tournamentCode: scrim.riotTournament.tournamentCode,
        lobbyName: scrim.lobbyName,
        setupCompleted: scrim.riotTournament.setupCompleted
      }
    });
  } catch (error) {
    console.error('Error getting tournament code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tournament code',
      error: error.message
    });
  }
};

/**
 * Handle Riot API callback for game results
 */
const handleRiotCallback = async (req, res) => {
  try {
    console.log('Received Riot API callback:', req.body);
    
    const callbackData = req.body;
    const { metaData, gameId, startTime, endTime } = callbackData;
    
    // Extract scrim ID from metadata (we stored it as scrim_<id>)
    const scrimId = metaData?.replace('scrim_', '');
    
    if (!scrimId) {
      console.error('No scrim ID found in callback metadata');
      return res.status(400).json({
        success: false,
        message: 'Invalid callback data - no scrim ID'
      });
    }

    // Find and update the scrim
    const scrim = await Scrim.findById(scrimId);
    
    if (!scrim) {
      console.error(`Scrim not found for callback: ${scrimId}`);
      return res.status(404).json({
        success: false,
        message: 'Scrim not found'
      });
    }

    // Update scrim with game completion data
    if (!scrim.riotTournament) {
      scrim.riotTournament = {};
    }
    
    scrim.riotTournament.gameId = gameId;
    scrim.riotTournament.gameCompleted = true;
    scrim.riotTournament.gameCompletedAt = new Date(endTime);
    scrim.riotTournament.riotCallbackData = callbackData;
    
    await scrim.save();

    console.log(`Game completed for scrim ${scrimId}, game ID: ${gameId}`);
    
    // Emit socket event to notify about game completion
    const io = req.app.get('io');
    if (io) {
      io.to(`scrim_${scrimId}`).emit('gameCompleted', {
        scrimId,
        gameId,
        callbackData
      });
    }

    // Respond with 200 to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: 'Callback processed successfully'
    });
  } catch (error) {
    console.error('Error handling Riot callback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process callback',
      error: error.message
    });
  }
};

/**
 * Update tournament code with allowed participants
 */
const updateTournamentParticipants = async (req, res) => {
  try {
    const { scrimId } = req.params;
    const { allowedParticipants } = req.body;
    
    const scrim = await Scrim.findById(scrimId).populate('teamOne._user teamTwo._user');
    
    if (!scrim) {
      return res.status(404).json({
        success: false,
        message: 'Scrim not found'
      });
    }

    if (!scrim.riotTournament?.tournamentCode) {
      return res.status(400).json({
        success: false,
        message: 'Tournament not initialized for this scrim'
      });
    }

    // If no participants provided, extract from teams
    let participants = allowedParticipants;
    if (!participants) {
      participants = [];
      
      // Add team one summoner names
      if (scrim.teamOne) {
        scrim.teamOne.forEach(player => {
          if (player._user?.name) {
            participants.push(player._user.name);
          }
        });
      }
      
      // Add team two summoner names
      if (scrim.teamTwo) {
        scrim.teamTwo.forEach(player => {
          if (player._user?.name) {
            participants.push(player._user.name);
          }
        });
      }
    }

    // Update tournament code with participants
    await riotServices.updateTournamentCode(scrim.riotTournament.tournamentCode, scrim.region, {
      allowedParticipants: participants
    });

    return res.status(200).json({
      success: true,
      message: 'Tournament participants updated',
      data: {
        allowedParticipants: participants
      }
    });
  } catch (error) {
    console.error('Error updating tournament participants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update tournament participants',
      error: error.message
    });
  }
};

/**
 * Get lobby events for a scrim's tournament
 */
const getLobbyEvents = async (req, res) => {
  try {
    const { scrimId } = req.params;
    
    const scrim = await Scrim.findById(scrimId);
    
    if (!scrim) {
      return res.status(404).json({
        success: false,
        message: 'Scrim not found'
      });
    }

    if (!scrim.riotTournament?.tournamentCode) {
      return res.status(400).json({
        success: false,
        message: 'Tournament not initialized for this scrim'
      });
    }

    const lobbyEvents = await riotServices.getLobbyEvents(scrim.riotTournament.tournamentCode, scrim.region);

    return res.status(200).json({
      success: true,
      data: lobbyEvents
    });
  } catch (error) {
    console.error('Error getting lobby events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get lobby events',
      error: error.message
    });
  }
};

module.exports = {
  initializeRiotTournament,
  getTournamentCode,
  handleRiotCallback,
  updateTournamentParticipants,
  getLobbyEvents
};