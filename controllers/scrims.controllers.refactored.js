const mongoose = require('mongoose');

// models
const Scrim = require('../models/scrim.model');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');

// services
const scrimScheduler = require('../services/scrimScheduler.services');

// utils
const generatePassword = require('../utils/generatePassword');
const {
  checkIfScrimIsToday,
  swapPlayer,
  getAvailableRoles,
  compareArrays,
  isValidRole,
  populateTeam,
  populateUser,
  getLobbyName,
  getLobbyHost,
  populateOneScrim,
  onSpotTaken,
  checkUnauthorized,
} = require('../utils/scrimUtils');
const capitalizeWord = require('../utils/capitalizeWord');
const KEYS = require('../config/keys');
const escape = require('escape-html');
const createS3 = require('../utils/createS3');
const uploadToBucket = require('../utils/uploadToBucket');

// for post-game lobby image upload
let s3Bucket = createS3();

/**
 * Build MongoDB query from request parameters
 */
const buildScrimQuery = (req) => {
  const query = {};
  
  // Date filtering
  if (req.query.date) {
    const startDate = new Date(req.query.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(req.query.date);
    endDate.setHours(23, 59, 59, 999);
    
    query.gameStartTime = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  // Date range filtering
  if (req.query.startDate && req.query.endDate) {
    query.gameStartTime = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  // Region filtering
  if (req.query.region) {
    query.region = req.query.region;
  }
  
  // Privacy filtering (default to public scrims only)
  if (req.query.includePrivate !== 'true') {
    query.isPrivate = { $ne: true };
  }
  
  // Status filtering (current, upcoming, previous)
  const now = new Date();
  if (req.query.status) {
    switch (req.query.status) {
      case 'upcoming':
        query.gameStartTime = { $gt: now };
        query.teamWon = null;
        break;
      case 'current':
        query.gameStartTime = { $lte: now };
        query.teamWon = null;
        break;
      case 'previous':
        query.gameStartTime = { $lte: now };
        query.teamWon = { $ne: null };
        break;
    }
  }
  
  // Team won filtering
  if (req.query.teamWon) {
    query.teamWon = req.query.teamWon;
  }
  
  // Creator filtering
  if (req.query.createdBy) {
    query.createdBy = req.query.createdBy;
  }
  
  // Lobby host filtering
  if (req.query.lobbyHost) {
    query.lobbyHost = req.query.lobbyHost;
  }
  
  // Tournament status filtering
  if (req.query.hasTournament === 'true') {
    query['riotTournament.setupCompleted'] = true;
  }
  
  // Full teams only
  if (req.query.fullTeamsOnly === 'true') {
    query.$and = [
      { $expr: { $eq: [{ $size: '$teamOne' }, 5] } },
      { $expr: { $eq: [{ $size: '$teamTwo' }, 5] } }
    ];
  }
  
  return query;
};

/**
 * Build sort options from request parameters
 */
const buildSortOptions = (req) => {
  const sortBy = req.query.sortBy || 'gameStartTime';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;
  
  // Secondary sort by creation date for stable ordering
  if (sortBy !== 'createdAt') {
    sortOptions.createdAt = -1;
  }
  
  return sortOptions;
};

/**
 * @route   GET /api/scrims
 * @desc    Get scrims with advanced filtering and pagination
 * @access  Public
 */
const getAllScrims = async (req, res) => {
  try {
    // Build query from request parameters
    const query = buildScrimQuery(req);
    
    // Build sort options
    const sortOptions = buildSortOptions(req);
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const [scrims, totalCount] = await Promise.all([
      Scrim.find(query)
        .select('-editHistory')
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Scrim.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return res.status(200).json({
      success: true,
      data: scrims,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching scrims:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/scrims/today
 * @desc    Get today's scrims
 * @access  Public
 */
const getTodaysScrims = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const query = {
      gameStartTime: {
        $gte: today,
        $lt: tomorrow
      }
    };
    
    // Add region filter if provided
    if (req.query.region) {
      query.region = req.query.region;
    }
    
    // Add privacy filter
    if (req.query.includePrivate !== 'true') {
      query.isPrivate = { $ne: true };
    }
    
    const scrims = await Scrim.find(query)
      .select('-editHistory')
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .sort({ gameStartTime: 1 })
      .lean()
      .exec();
    
    return res.status(200).json({
      success: true,
      data: scrims,
      date: today.toISOString()
    });
  } catch (error) {
    console.error('Error fetching today\'s scrims:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/scrims/upcoming
 * @desc    Get upcoming scrims
 * @access  Public
 */
const getUpcomingScrims = async (req, res) => {
  try {
    const now = new Date();
    
    const query = {
      gameStartTime: { $gt: now },
      teamWon: null
    };
    
    // Add filters
    if (req.query.region) query.region = req.query.region;
    if (req.query.includePrivate !== 'true') query.isPrivate = { $ne: true };
    
    // Limit to next X hours if specified
    if (req.query.hoursAhead) {
      const hoursAhead = parseInt(req.query.hoursAhead);
      const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
      query.gameStartTime.$lte = futureTime;
    }
    
    const limit = parseInt(req.query.limit) || 20;
    
    const scrims = await Scrim.find(query)
      .select('-editHistory')
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .sort({ gameStartTime: 1 })
      .limit(limit)
      .lean()
      .exec();
    
    return res.status(200).json({
      success: true,
      data: scrims
    });
  } catch (error) {
    console.error('Error fetching upcoming scrims:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/scrims/current
 * @desc    Get currently active scrims
 * @access  Public
 */
const getCurrentScrims = async (req, res) => {
  try {
    const now = new Date();
    
    const query = {
      gameStartTime: { $lte: now },
      teamWon: null
    };
    
    // Add filters
    if (req.query.region) query.region = req.query.region;
    if (req.query.includePrivate !== 'true') query.isPrivate = { $ne: true };
    
    const scrims = await Scrim.find(query)
      .select('-editHistory')
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .sort({ gameStartTime: -1 })
      .lean()
      .exec();
    
    return res.status(200).json({
      success: true,
      data: scrims
    });
  } catch (error) {
    console.error('Error fetching current scrims:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/scrims/user/:userId
 * @desc    Get scrims for a specific user (created, participated, or captained)
 * @access  Public
 */
const getUserScrims = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; // 'creator', 'player', 'captain', 'caster'
    
    let query = {};
    
    switch (role) {
      case 'creator':
        query.createdBy = userId;
        break;
      case 'captain':
        query.lobbyHost = userId;
        break;
      case 'caster':
        query.casters = userId;
        break;
      case 'player':
        query.$or = [
          { 'teamOne._user': userId },
          { 'teamTwo._user': userId }
        ];
        break;
      default:
        // Get all scrims where user is involved
        query.$or = [
          { createdBy: userId },
          { lobbyHost: userId },
          { casters: userId },
          { 'teamOne._user': userId },
          { 'teamTwo._user': userId }
        ];
    }
    
    // Add additional filters
    if (req.query.teamWon !== undefined) {
      query.teamWon = req.query.teamWon;
    }
    
    const scrims = await Scrim.find(query)
      .select('-editHistory')
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .sort({ gameStartTime: -1 })
      .lean()
      .exec();
    
    // Calculate user statistics
    const stats = {
      total: scrims.length,
      won: 0,
      lost: 0,
      upcoming: 0,
      current: 0
    };
    
    const now = new Date();
    scrims.forEach(scrim => {
      if (scrim.gameStartTime > now) {
        stats.upcoming++;
      } else if (!scrim.teamWon) {
        stats.current++;
      } else {
        // Check if user won
        const userInTeam = scrim.teamOne.some(p => p._user?._id?.toString() === userId) ? 'teamOne' :
                          scrim.teamTwo.some(p => p._user?._id?.toString() === userId) ? 'teamTwo' : null;
        if (userInTeam === scrim.teamWon) {
          stats.won++;
        } else if (userInTeam) {
          stats.lost++;
        }
      }
    });
    
    return res.status(200).json({
      success: true,
      data: scrims,
      stats
    });
  } catch (error) {
    console.error('Error fetching user scrims:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/scrims/search
 * @desc    Search scrims by title or creator name
 * @access  Public
 */
const searchScrims = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    // First, find users matching the search query
    const matchingUsers = await User.find({
      name: { $regex: q, $options: 'i' }
    }).select('_id');
    
    const userIds = matchingUsers.map(u => u._id);
    
    // Build search query
    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { createdBy: { $in: userIds } }
      ]
    };
    
    // Add privacy filter
    if (req.query.includePrivate !== 'true') {
      query.isPrivate = { $ne: true };
    }
    
    const scrims = await Scrim.find(query)
      .select('-editHistory')
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .sort({ gameStartTime: -1 })
      .limit(50)
      .lean()
      .exec();
    
    return res.status(200).json({
      success: true,
      data: scrims,
      query: q
    });
  } catch (error) {
    console.error('Error searching scrims:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/scrims/stats
 * @desc    Get scrim statistics
 * @access  Public
 */
const getScrimStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [
      totalScrims,
      todayScrims,
      upcomingScrims,
      currentScrims,
      regionStats,
      tournamentStats
    ] = await Promise.all([
      Scrim.countDocuments({}),
      Scrim.countDocuments({
        gameStartTime: { $gte: today, $lt: tomorrow }
      }),
      Scrim.countDocuments({
        gameStartTime: { $gt: now },
        teamWon: null
      }),
      Scrim.countDocuments({
        gameStartTime: { $lte: now },
        teamWon: null
      }),
      Scrim.aggregate([
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Scrim.aggregate([
        {
          $group: {
            _id: null,
            withTournament: {
              $sum: { $cond: ['$riotTournament.setupCompleted', 1, 0] }
            },
            total: { $sum: 1 }
          }
        }
      ])
    ]);
    
    return res.status(200).json({
      success: true,
      stats: {
        total: totalScrims,
        today: todayScrims,
        upcoming: upcomingScrims,
        current: currentScrims,
        byRegion: regionStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        tournaments: tournamentStats[0] || { withTournament: 0, total: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching scrim stats:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Keep existing CRUD operations but optimized
const getScrimById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid scrim ID' 
      });
    }
    
    const scrim = await Scrim.findById(id)
      .select('-editHistory')
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .lean()
      .exec();
    
    if (!scrim) {
      return res.status(404).json({ 
        success: false,
        error: 'Scrim not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: scrim
    });
  } catch (error) {
    console.error('Error fetching scrim:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  getAllScrims,
  getTodaysScrims,
  getUpcomingScrims,
  getCurrentScrims,
  getUserScrims,
  searchScrims,
  getScrimStats,
  getScrimById,
  // ... include other existing functions from original controller
};