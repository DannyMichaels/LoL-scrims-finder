const KEYS = require('../config/keys');
const User = require('../models/user.model');
const Ban = require('../models/ban.model');
const Scrim = require('../models/scrim.model');
const { unbanUser: utilUnbanUser } = require('../utils/adminUtils');
const { validateRank } = require('../utils/validators');
const { manualLiftExpiredBans } = require('../services/cronJobs.services');
const mongoose = require('mongoose');
const axios = require('axios');

const banUser = async (req, res) => {
  try {
    const { user = {} } = req;

    const { banUserId = '', dateFrom, dateTo, reason = '' } = req.body;

    if (!banUserId) {
      return res.status(400).json({
        error: 'User ID not provided',
      });
    }

    if (!dateFrom) {
      return res.status(400).json({
        error: 'Start date not provided',
      });
    }

    if (!dateTo) {
      return res.status(400).json({
        error: 'End date not provided',
      });
    }

    let userToBan = await User.findById(String(banUserId));

    if (!userToBan) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    if (userToBan.currentBan?.isActive) {
      return res.status(400).json({
        error: 'User is already banned',
      });
    }

    if (userToBan.adminKey === KEYS.ADMIN_KEY) {
      return res.status(403).json({
        error: 'You cannot ban an admin',
      });
    }

    const newBan = new Ban({
      _user: userToBan,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      _bannedBy: user._id,
      isActive: true,
      reason,
    });

    const savedBan = await newBan.save();

    userToBan.currentBan = {
      isActive: true,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      _bannedBy: user,
      _ban: savedBan._id,
    };

    if (!userToBan.bansHistory) {
      userToBan.bansHistory = [newBan];
    } else {
      userToBan.bansHistory.push(newBan);
    }

    await userToBan.markModified('currentBan');
    await userToBan.markModified('bansHistory');

    const updatedUser = await userToBan.save();

    return res.status(200).json({
      success: true,
      dateFrom,
      dateTo,
      bannedUserId: updatedUser._id,
      _bannedBy: user._id,
      _ban: savedBan._id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { user = {} } = req;

    const { bannedUserId = '' } = req.body;

    if (Object.keys(user) <= 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.adminKey !== KEYS.ADMIN_KEY) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    if (!bannedUserId) {
      return res.status(400).json({
        error: 'User ID not provided',
      });
    }

    const selectedUser = await User.findOne({ _id: { $eq: bannedUserId } });

    if (!selectedUser) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    if (!selectedUser.currentBan?.isActive) {
      return res.status(400).json({
        error: 'User is not banned',
      });
    }

    const { savedBan, updatedUser } = await utilUnbanUser(selectedUser);

    return res.status(200).json({
      success: true,
      unbannedUserId: updatedUser._id,
      _bannedBy: user._id,
      updatedBan: savedBan,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllBans = async (req, res) => {
  try {
    const populateUser = ['name', 'discord', 'region'];

    const _allBans = await Ban.find()
      .populate('_bannedBy', populateUser)
      .populate('_unbannedBy', populateUser)
      .populate('_user', populateUser);
    
    return res.status(200).json(_allBans);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateUserAsAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // check for valid rank
    if (req.body.rank) {
      const isValidRank = await validateRank({
        rank: req.body.rank,
        req,
        res,
      });

      if (!isValidRank) return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/admin/recent-activities
// @desc    Get recent activities for admin dashboard
// @access  Admin only
const getRecentActivities = async (req, res) => {
  try {
    const activities = [];
    
    // Get most recent scrims (regardless of time, just get the latest ones)
    const recentScrims = await Scrim.find({})
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get most recent users
    const recentUsers = await User.find({})
    .select('name discord region rank createdAt summonerTagline')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get most recent bans
    const recentBans = await Ban.find({})
    .populate('_user', 'name')
    .populate('_bannedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get recently completed scrims (scrims that have started)
    const completedScrims = await Scrim.find({
      gameStartTime: { $lte: new Date() }
    })
    .populate('createdBy', 'name')
    .sort({ gameStartTime: -1 })
    .limit(5);
    
    // Format activities
    recentScrims.forEach(scrim => {
      activities.push({
        type: 'scrim',
        action: 'created',
        description: `New scrim created: "${scrim.title}"`,
        details: {
          scrimId: scrim._id,
          title: scrim.title,
          createdBy: scrim.createdBy?.name || 'Unknown',
          region: scrim.region,
          gameMode: scrim.gameMode
        },
        timestamp: scrim.createdAt,
        status: scrim.isActive ? 'active' : 'inactive'
      });
    });
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        action: 'registered',
        description: `New user registered: ${user.name}`,
        details: {
          userId: user._id,
          userName: user.name,
          discord: user.discord,
          region: user.region,
          rank: user.rank
        },
        timestamp: user.createdAt,
        status: 'new'
      });
    });
    
    recentBans.forEach(ban => {
      activities.push({
        type: 'ban',
        action: ban.isActive ? 'banned' : 'unbanned',
        description: `User ${ban.isActive ? 'banned' : 'unbanned'}: ${ban._user?.name || 'Unknown'}`,
        details: {
          banId: ban._id,
          userId: ban._user?._id,
          userName: ban._user?.name || 'Unknown',
          bannedBy: ban._bannedBy?.name || 'System',
          reason: ban.reason,
          dateFrom: ban.dateFrom,
          dateTo: ban.dateTo
        },
        timestamp: ban.createdAt,
        status: ban.isActive ? 'banned' : 'lifted'
      });
    });
    
    completedScrims.forEach(scrim => {
      if (scrim.gameStartTime < new Date()) {
        activities.push({
          type: 'scrim',
          action: 'completed',
          description: `Scrim completed: "${scrim.title}"`,
          details: {
            scrimId: scrim._id,
            title: scrim.title,
            createdBy: scrim.createdBy?.name || 'Unknown',
            region: scrim.region
          },
          timestamp: scrim.gameStartTime,
          status: 'completed'
        });
      }
    });
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Return top 20 most recent activities
    res.json(activities.slice(0, 20));
    
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics for admin
// @access  Admin only
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalScrims = await Scrim.countDocuments();
    
    // Get detailed ban statistics
    const currentDate = new Date();
    
    // Active bans (not expired)
    const activeBans = await User.countDocuments({ 
      'currentBan.isActive': true,
      'currentBan.dateTo': { $gt: currentDate }
    });
    
    // Expired but not lifted bans
    const expiredBans = await User.countDocuments({
      'currentBan.isActive': true,
      'currentBan.dateTo': { $lte: currentDate }
    });
    
    // Total users with ban history
    const totalBannedUsers = await User.countDocuments({
      'bansHistory.0': { $exists: true }
    });
    
    // Get all bans from Ban collection for more detailed stats
    const allBans = await Ban.countDocuments();
    const activeBansFromBanModel = await Ban.countDocuments({
      isActive: true,
      dateTo: { $gt: currentDate }
    });

    // Get active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyNewUsers = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });
    
    const weeklyNewScrims = await Scrim.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Get region distribution
    const regionDistribution = await User.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get rank distribution  
    const rankDistribution = await User.aggregate([
      {
        $group: {
          _id: '$rank',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      totalScrims,
      banStatistics: {
        activeBans,
        expiredBans,
        totalBannedUsers,
        totalBans: allBans
      },
      weeklyNewUsers,
      weeklyNewScrims,
      regionDistribution: regionDistribution.map(r => ({
        region: r._id,
        count: r.count
      })),
      rankDistribution: rankDistribution.map(r => ({
        rank: r._id,
        count: r.count
      })),
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// @route   POST /api/admin/lift-expired-bans
// @desc    Manually lift all expired bans
// @access  Admin only
const liftExpiredBans = async (req, res) => {
  try {
    await manualLiftExpiredBans();
    
    // Get updated ban statistics
    const currentDate = new Date();
    const activeBans = await User.countDocuments({ 
      'currentBan.isActive': true,
      'currentBan.dateTo': { $gt: currentDate }
    });
    
    const expiredBans = await User.countDocuments({
      'currentBan.isActive': true,
      'currentBan.dateTo': { $lte: currentDate }
    });
    
    res.json({
      success: true,
      message: 'Expired bans have been lifted',
      statistics: {
        activeBans,
        expiredBans
      }
    });
  } catch (error) {
    console.error('Error lifting expired bans:', error);
    res.status(500).json({ error: 'Failed to lift expired bans' });
  }
};

// @route   GET /api/admin/server-status
// @desc    Get real-time server status
// @access  Admin only
const getServerStatus = async (req, res) => {
  try {
    const status = {
      database: {
        name: 'MongoDB',
        status: 'unknown',
        details: null,
        latency: null
      },
      websocket: {
        name: 'WebSocket Server',
        status: 'unknown',
        details: null,
        connections: 0
      },
      emailService: {
        name: 'Email Service',
        status: 'unknown',
        details: null
      },
      riotApi: {
        name: 'Riot API',
        status: 'unknown',
        details: null,
        rateLimit: null
      },
      server: {
        name: 'Express Server',
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    // Check MongoDB connection
    try {
      const dbState = mongoose.connection.readyState;
      const startTime = Date.now();
      
      if (dbState === 1) {
        // Ping the database to check latency
        await mongoose.connection.db.admin().ping();
        const latency = Date.now() - startTime;
        
        status.database.status = 'operational';
        status.database.details = 'Connected and responsive';
        status.database.latency = `${latency}ms`;
      } else if (dbState === 2) {
        status.database.status = 'connecting';
        status.database.details = 'Connecting to database';
      } else if (dbState === 0) {
        status.database.status = 'error';
        status.database.details = 'Disconnected from database';
      } else {
        status.database.status = 'error';
        status.database.details = 'Unknown connection state';
      }
    } catch (error) {
      status.database.status = 'error';
      status.database.details = error.message;
    }

    // Check WebSocket (Socket.io) status
    try {
      const io = req.app.get('io');
      if (io) {
        const sockets = await io.fetchSockets();
        status.websocket.status = 'operational';
        status.websocket.connections = sockets.length;
        status.websocket.details = `${sockets.length} active connections`;
      } else {
        status.websocket.status = 'error';
        status.websocket.details = 'Socket.io not initialized';
      }
    } catch (error) {
      status.websocket.status = 'error';
      status.websocket.details = error.message;
    }

    // Check Email Service (mock check - replace with actual email service check)
    try {
      // In a real scenario, you'd check your email service (SendGrid, AWS SES, etc.)
      // For now, we'll just check if email config exists
      if (process.env.EMAIL_SERVICE_KEY) {
        status.emailService.status = 'operational';
        status.emailService.details = 'Email service configured';
      } else {
        status.emailService.status = 'inactive';
        status.emailService.details = 'Email service not configured';
      }
    } catch (error) {
      status.emailService.status = 'error';
      status.emailService.details = error.message;
    }

    // Check Riot API status
    try {
      // Check if we have an API key
      if (process.env.RIOT_API_KEY) {
        // Make a simple request to Riot API status endpoint
        const riotResponse = await axios.get(
          'https://na1.api.riotgames.com/lol/status/v4/platform-data',
          {
            headers: {
              'X-Riot-Token': process.env.RIOT_API_KEY
            },
            timeout: 5000
          }
        ).catch(err => {
          if (err.response?.status === 429) {
            return { status: 429, data: { message: 'Rate limited' } };
          }
          throw err;
        });

        if (riotResponse.status === 200) {
          status.riotApi.status = 'operational';
          status.riotApi.details = 'API key valid and working';
        } else if (riotResponse.status === 429) {
          status.riotApi.status = 'warning';
          status.riotApi.details = 'Rate limited';
          status.riotApi.rateLimit = 'Exceeded';
        }
      } else {
        status.riotApi.status = 'inactive';
        status.riotApi.details = 'API key not configured';
      }
    } catch (error) {
      if (error.response?.status === 403) {
        status.riotApi.status = 'error';
        status.riotApi.details = 'Invalid API key';
      } else if (error.response?.status === 429) {
        status.riotApi.status = 'warning';
        status.riotApi.details = 'Rate limited';
      } else {
        status.riotApi.status = 'error';
        status.riotApi.details = error.message || 'Connection failed';
      }
    }

    // Calculate overall health
    const services = [status.database, status.websocket, status.emailService, status.riotApi, status.server];
    const operationalCount = services.filter(s => s.status === 'operational').length;
    const warningCount = services.filter(s => s.status === 'warning').length;
    const errorCount = services.filter(s => s.status === 'error').length;

    let overallStatus = 'operational';
    if (errorCount > 0) {
      overallStatus = 'partial';
    }
    if (errorCount >= 3) {
      overallStatus = 'degraded';
    }
    if (status.database.status === 'error' || status.server.status === 'error') {
      overallStatus = 'critical';
    }

    res.json({
      overall: overallStatus,
      services: status,
      summary: {
        operational: operationalCount,
        warning: warningCount,
        error: errorCount,
        total: services.length
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error checking server status:', error);
    res.status(500).json({ 
      error: 'Failed to check server status',
      overall: 'error'
    });
  }
};

module.exports = {
  banUser,
  unbanUser,
  getAllBans,
  updateUserAsAdmin,
  getDashboardStats,
  liftExpiredBans,
  getRecentActivities,
  getServerStatus,
};
