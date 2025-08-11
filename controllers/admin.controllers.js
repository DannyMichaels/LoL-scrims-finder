const KEYS = require('../config/keys');
const User = require('../models/user.model');
const Ban = require('../models/ban.model');
const Scrim = require('../models/scrim.model');
const { unbanUser: utilUnbanUser } = require('../utils/adminUtils');
const { validateRank } = require('../utils/validators');
const { manualLiftExpiredBans } = require('../services/cronJobs.services');

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

module.exports = {
  banUser,
  unbanUser,
  getAllBans,
  updateUserAsAdmin,
  getDashboardStats,
  liftExpiredBans,
  getRecentActivities,
};
