const Scrim = require('../models/scrim.model');
const riotServices = require('./riot.services');

// Store active timers
const activeTimers = new Map();

/**
 * Schedule Riot tournament initialization for a scrim
 * @param {Object} scrim - The scrim document
 * @param {Object} io - Socket.io instance for broadcasting
 */
const scheduleRiotTournamentInit = (scrim, io) => {
  const scrimId = scrim._id.toString();
  
  // Clear existing timer if any
  if (activeTimers.has(scrimId)) {
    clearTimeout(activeTimers.get(scrimId));
    activeTimers.delete(scrimId);
  }

  // Don't schedule if already setup
  if (scrim.riotTournament?.setupCompleted) {
    console.log(`Tournament already setup for scrim ${scrimId}`);
    return;
  }

  const now = new Date();
  const gameStartTime = new Date(scrim.gameStartTime);
  const timeUntilStart = gameStartTime - now;

  // If game start time has passed, initialize immediately
  if (timeUntilStart <= 0) {
    console.log(`Game start time passed for scrim ${scrimId}, initializing tournament now`);
    initializeRiotTournamentForScrim(scrimId, io);
    return;
  }

  // Schedule initialization for when countdown reaches 0
  console.log(`Scheduling Riot tournament init for scrim ${scrimId} in ${timeUntilStart}ms`);
  
  const timer = setTimeout(async () => {
    console.log(`Timer triggered for scrim ${scrimId}, initializing tournament`);
    await initializeRiotTournamentForScrim(scrimId, io);
    activeTimers.delete(scrimId);
  }, timeUntilStart);

  activeTimers.set(scrimId, timer);
};

/**
 * Initialize Riot tournament for a scrim
 * @param {string} scrimId - The scrim ID
 * @param {Object} io - Socket.io instance
 */
const initializeRiotTournamentForScrim = async (scrimId, io) => {
  try {
    // Fetch fresh scrim data
    const scrim = await Scrim.findById(scrimId);
    
    if (!scrim) {
      console.error(`Scrim ${scrimId} not found`);
      return;
    }

    // Check if already initialized
    if (scrim.riotTournament?.setupCompleted) {
      console.log(`Tournament already initialized for scrim ${scrimId}`);
      return;
    }

    // Check if teams are full
    if (scrim.teamOne.length !== 5 || scrim.teamTwo.length !== 5) {
      console.log(`Teams not full for scrim ${scrimId}, skipping tournament initialization`);
      // Broadcast to clients that tournament won't be created
      if (io) {
        io.to(`scrim_${scrimId}`).emit('tournamentSkipped', {
          scrimId,
          reason: 'Teams not full',
          message: 'Tournament code will not be generated - teams must be full'
        });
      }
      return;
    }

    console.log(`Initializing Riot tournament for scrim ${scrimId}`);
    
    // Call Riot API to setup tournament
    const tournamentData = await riotServices.setupRiotTournamentForScrim(scrim);
    
    // Update scrim with tournament data
    scrim.riotTournament = {
      ...tournamentData,
      lobbyCreated: true
    };
    
    // Update lobby name with tournament code
    scrim.lobbyName = tournamentData.tournamentCode;
    
    await scrim.save();

    console.log(`Tournament initialized successfully for scrim ${scrimId}`);
    console.log(`Tournament Code: ${tournamentData.tournamentCode}`);

    // Broadcast to all connected clients in the scrim room
    if (io) {
      io.to(`scrim_${scrimId}`).emit('tournamentInitialized', {
        scrimId,
        tournamentCode: tournamentData.tournamentCode,
        lobbyName: tournamentData.tournamentCode,
        providerId: tournamentData.providerId,
        tournamentId: tournamentData.tournamentId
      });

      // Also emit a scrim update event
      const updatedScrim = await Scrim.findById(scrimId)
        .populate('teamOne._user')
        .populate('teamTwo._user')
        .populate('casters')
        .populate('lobbyHost')
        .populate('createdBy');

      io.to(`scrim_${scrimId}`).emit('scrimUpdate', updatedScrim);
    }
  } catch (error) {
    console.error(`Error initializing tournament for scrim ${scrimId}:`, error);
    
    // Broadcast error to clients
    if (io) {
      io.to(`scrim_${scrimId}`).emit('tournamentError', {
        scrimId,
        error: error.message,
        message: 'Failed to generate tournament code. Please create lobby manually.'
      });
    }
  }
};

/**
 * Cancel scheduled tournament initialization
 * @param {string} scrimId - The scrim ID
 */
const cancelScheduledTournament = (scrimId) => {
  if (activeTimers.has(scrimId)) {
    clearTimeout(activeTimers.get(scrimId));
    activeTimers.delete(scrimId);
    console.log(`Cancelled scheduled tournament for scrim ${scrimId}`);
  }
};

/**
 * Reschedule tournament initialization (called when game time changes)
 * @param {Object} scrim - The updated scrim
 * @param {Object} io - Socket.io instance
 */
const rescheduleRiotTournament = (scrim, io) => {
  const scrimId = scrim._id.toString();
  console.log(`Rescheduling tournament for scrim ${scrimId}`);
  
  // Cancel existing timer
  cancelScheduledTournament(scrimId);
  
  // Schedule new timer if not already completed
  if (!scrim.riotTournament?.setupCompleted) {
    scheduleRiotTournamentInit(scrim, io);
  }
};

/**
 * Initialize scheduler for all active scrims on server start
 * @param {Object} io - Socket.io instance
 */
const initializeScheduler = async (io) => {
  try {
    console.log('Initializing scrim scheduler...');
    
    // Find all scrims that haven't started yet and don't have tournament setup
    const now = new Date();
    const activeScrimsToSchedule = await Scrim.find({
      gameStartTime: { $gt: now },
      'riotTournament.setupCompleted': { $ne: true }
    });

    console.log(`Found ${activeScrimsToSchedule.length} scrims to schedule`);

    // Schedule each scrim
    for (const scrim of activeScrimsToSchedule) {
      scheduleRiotTournamentInit(scrim, io);
    }

    // Also check for scrims that should have started but haven't been initialized
    const pastScrimsToInit = await Scrim.find({
      gameStartTime: { $lte: now },
      'riotTournament.setupCompleted': { $ne: true },
      // Only init if created within last 2 hours
      createdAt: { $gte: new Date(now - 2 * 60 * 60 * 1000) }
    });

    console.log(`Found ${pastScrimsToInit.length} past scrims to initialize`);

    // Initialize tournaments for past scrims
    for (const scrim of pastScrimsToInit) {
      await initializeRiotTournamentForScrim(scrim._id.toString(), io);
    }

    console.log('Scrim scheduler initialized');
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
};

/**
 * Clean up scheduler (call on server shutdown)
 */
const cleanupScheduler = () => {
  console.log('Cleaning up scrim scheduler...');
  
  // Clear all timers
  for (const [scrimId, timer] of activeTimers) {
    clearTimeout(timer);
    console.log(`Cleared timer for scrim ${scrimId}`);
  }
  
  activeTimers.clear();
  console.log('Scrim scheduler cleanup complete');
};

module.exports = {
  scheduleRiotTournamentInit,
  cancelScheduledTournament,
  rescheduleRiotTournament,
  initializeScheduler,
  cleanupScheduler,
  initializeRiotTournamentForScrim
};