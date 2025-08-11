const Scrim = require('../models/scrim.model');
const riotServices = require('./riot.services');
const User = require('../models/user.model');

// Store active timers
const activeTimers = new Map();
// Store notification timers separately
const notificationTimers = new Map();

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

  // Don't schedule if scrim is cancelled or abandoned
  if (scrim.status === 'cancelled' || scrim.status === 'abandoned' || scrim.status === 'completed') {
    console.log(`Scrim ${scrimId} has status ${scrim.status}, skipping tournament init`);
    return;
  }

  const now = new Date();
  const gameStartTime = new Date(scrim.gameStartTime);
  const timeUntilStart = gameStartTime - now;

  // If game start time has passed, check if it's within a reasonable window
  if (timeUntilStart <= 0) {
    const timeSinceStart = Math.abs(timeUntilStart);
    const maxInitWindowMs = 30 * 60 * 1000; // 30 minutes window
    
    if (timeSinceStart > maxInitWindowMs) {
      console.log(`Scrim ${scrimId} start time passed more than 30 minutes ago, marking as abandoned`);
      markScrimAsAbandoned(scrimId);
      return;
    }
    
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
 * Send notification to all scrim participants
 * @param {Object} scrim - The scrim document
 * @param {Object} io - Socket.io instance
 */
const sendScrimStartNotification = async (scrim, io) => {
  try {
    const scrimId = scrim._id.toString();
    
    // Collect all participant IDs
    const participantIds = new Set();
    
    // Add players from both teams
    scrim.teamOne.forEach(player => {
      if (player._user) {
        participantIds.add(player._user._id ? player._user._id.toString() : player._user.toString());
      }
    });
    
    scrim.teamTwo.forEach(player => {
      if (player._user) {
        participantIds.add(player._user._id ? player._user._id.toString() : player._user.toString());
      }
    });
    
    // Add casters
    scrim.casters?.forEach(caster => {
      if (caster) {
        participantIds.add(caster._id ? caster._id.toString() : caster.toString());
      }
    });
    
    // Create notification message
    const notificationMessage = `Your scrim "${scrim.title || 'Untitled Scrim'}" is starting now! Click to join.`;
    
    // Send notification to each participant
    for (const userId of participantIds) {
      try {
        // Add notification to user's notifications array
        const user = await User.findById(userId);
        if (user) {
          const newNotification = {
            message: notificationMessage,
            _relatedScrim: scrim._id,
            isScrimAlert: true,
            createdDate: new Date()
          };
          
          user.notifications = [...(user.notifications || []), newNotification];
          await user.save();
          
          // Send socket notification to the user if they're online
          if (io && global.socketUsers) {
            // Ensure string comparison for user IDs
            const socketUser = global.socketUsers.find(u => String(u.userId) === String(userId));
            if (socketUser) {
              console.log(`Sending scrim start notification to user ${userId} via socket ${socketUser.socketId}`);
              io.to(socketUser.socketId).emit('scrimStartNotification', {
                notification: newNotification,
                scrimId: scrimId,
                scrimTitle: scrim.title || 'Untitled Scrim',
                message: notificationMessage
              });
            } else {
              console.log(`User ${userId} not found in socketUsers, notification saved to DB only`);
            }
          }
        }
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
      }
    }
    
    // Broadcast to scrim room as well
    if (io) {
      io.to(`scrim_${scrimId}`).emit('scrimStarting', {
        scrimId,
        message: 'The scrim is starting now!',
        gameStartTime: scrim.gameStartTime
      });
    }
    
    console.log(`Sent start notifications for scrim ${scrimId} to ${participantIds.size} participants`);
  } catch (error) {
    console.error(`Error sending scrim start notifications:`, error);
  }
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

    // Check if tournament code is disabled for this scrim
    if (scrim.useTournamentCode === false) {
      console.log(`Tournament code disabled for scrim ${scrimId}, using manual lobby`);
      // Update status to active without generating tournament code
      scrim.status = 'active';
      scrim.statusUpdatedAt = new Date();
      await scrim.save();
      
      // Send notifications to all participants
      await sendScrimStartNotification(scrim, io);
      
      // Broadcast to clients that manual lobby should be used
      if (io) {
        io.to(`scrim_${scrimId}`).emit('tournamentSkipped', {
          scrimId,
          reason: 'Manual lobby mode',
          message: 'Using manual lobby creation - no tournament code will be generated'
        });
      }
      return;
    }

    // Check if already initialized
    if (scrim.riotTournament?.setupCompleted) {
      console.log(`Tournament already initialized for scrim ${scrimId}`);
      return;
    }

    // Check scrim status
    if (scrim.status === 'cancelled' || scrim.status === 'abandoned' || scrim.status === 'completed') {
      console.log(`Scrim ${scrimId} has status ${scrim.status}, skipping tournament init`);
      return;
    }

    // Update status to active
    scrim.status = 'active';
    scrim.statusUpdatedAt = new Date();
    await scrim.save();
    
    // Send notifications to all participants
    await sendScrimStartNotification(scrim, io);

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
 * Mark a scrim as abandoned
 * @param {string} scrimId - The scrim ID
 */
const markScrimAsAbandoned = async (scrimId) => {
  try {
    const scrim = await Scrim.findByIdAndUpdate(
      scrimId,
      { 
        status: 'abandoned',
        statusUpdatedAt: new Date()
      },
      { new: true }
    );
    
    if (scrim) {
      console.log(`Marked scrim ${scrimId} as abandoned`);
    }
  } catch (error) {
    console.error(`Error marking scrim ${scrimId} as abandoned:`, error);
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
      'riotTournament.setupCompleted': { $ne: true },
      status: { $in: ['pending', 'active', null] } // Only schedule pending/active scrims
    });

    console.log(`Found ${activeScrimsToSchedule.length} scrims to schedule`);

    // Schedule each scrim
    for (const scrim of activeScrimsToSchedule) {
      scheduleRiotTournamentInit(scrim, io);
    }

    // Check for recent scrims that should have started but haven't been initialized
    // Only process scrims that started within the last 30 minutes
    const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);
    const pastScrimsToInit = await Scrim.find({
      gameStartTime: { 
        $lte: now,
        $gte: thirtyMinutesAgo // Only scrims that started within last 30 minutes
      },
      'riotTournament.setupCompleted': { $ne: true },
      status: { $in: ['pending', 'active', null] } // Only process pending/active scrims
    });

    console.log(`Found ${pastScrimsToInit.length} recent past scrims to initialize`);

    // Initialize tournaments for recent past scrims
    for (const scrim of pastScrimsToInit) {
      await initializeRiotTournamentForScrim(scrim._id.toString(), io);
    }

    // Mark old scrims as abandoned
    const oldScrimsToAbandon = await Scrim.find({
      gameStartTime: { $lt: thirtyMinutesAgo },
      'riotTournament.setupCompleted': { $ne: true },
      status: { $in: ['pending', 'active', null] }
    });

    console.log(`Found ${oldScrimsToAbandon.length} old scrims to mark as abandoned`);
    
    for (const scrim of oldScrimsToAbandon) {
      await markScrimAsAbandoned(scrim._id.toString());
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