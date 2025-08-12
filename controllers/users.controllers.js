const User = require('../models/user.model');
const Scrim = require('../models/scrim.model');
const mongoose = require('mongoose');
const escape = require('escape-html'); // sanitize request params
const { REGIONS } = require('../utils/constants');
const KEYS = require('../config/keys');
const { calculateUserStats } = require('../utils/userStatsCalculator');

// @route   GET /api/users
// @desc    get all users for the app
// @access  Public
const getAllUsers = async (req, res) => {
  const region = req.query?.region;
  // /api/users?region=NA
  // optional query to get the users in a specific region, not used in the app
  if (region) {
    try {
      // don't show other fields, using select.
      const users = await User.find({ region: { $eq: region } }).select([
        'discord',
        'name',
        'summonerTagline',
        'rank',
        'region',
        'createdAt',
        'updatedAt',
      ]);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    // if no region, just get all users.
    try {
      const users = await User.find().select([
        'discord',
        'name',
        'summonerTagline',
        'rank',
        'region',
        'createdAt',
        'updatedAt',
      ]);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

// @route   GET /api/users/:name?region="region"&tagline="tagline" or /api/users/:name#tagline
// @desc    get one user by name and optionally tagline, used in the user profile page
// @access  Public
const getOneUser = async (req, res) => {
  try {
    let { name } = req.params;
    let region = req.query.region;
    let tagline = req.query.tagline;

    // Check if name contains # (format: GameName#Tagline)
    if (name.includes('#')) {
      const parts = name.split('#');
      name = parts[0];
      tagline = parts[1]; // Override query tagline if provided in name
    }

    // Build search query
    const searchQuery = {
      name: {
        $regex: `^${name}$`,
        $options: 'i',
      }
    };

    // Add tagline to search if provided
    if (tagline) {
      searchQuery.summonerTagline = {
        $regex: `^${tagline}$`,
        $options: 'i',
      };
    }

    // if region wasn't provided in the query, find first matching user
    if (!region) {
      let foundUser = await User.findOne(searchQuery)
        .sort({ createdAt: 'desc' }) // first user created first
        .exec();

      if (!foundUser) {
        return res.status(404).json({
          message: tagline 
            ? `No user found with name: ${name}#${tagline}`
            : `No user found with name: ${name}`,
        });
      }

      region = foundUser.region;
    } else {
      // upper case region if casing misspelled
      region = region.toUpperCase();
      searchQuery.region = region;
    }

    if (!REGIONS.includes(region)) {
      return res.status(400).json({
        message:
          'Invalid region, please select one of the following: NA, EUW, EUNE, LAN, OCE',
      });
    }

    const userAdminKey = await User.findOne(searchQuery).select(['adminKey']);

    let user = await User.findOne(searchQuery).select([
      'discord',
      'name',
      'summonerTagline',
      'region',
      'rank',
      'createdAt',
      'profileBackgroundImg',
      'profileBackgroundBlur',
      'friends',
      'isDonator',
      'currentBan',
      'lastLoggedIn',
    ]);

    if (!user)
      return res
        .status(404)
        .json({ message: `User not found in region: ${escape(region)}` });

    const isAdmin = userAdminKey && userAdminKey.adminKey === KEYS.ADMIN_KEY;

    return res.status(200).json({ ...user._doc, isAdmin });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET api/users/:id/created-scrims
// @desc    get all scrims that were created by that one user. (can only be seen by if _id === self._id at UserProfile page)
// @access  Public
const getUserCreatedScrims = async (req, res) => {
  try {
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(400).json({ error: 'invalid id' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userCreatedScrims = await Scrim.find({
      createdBy: user._id,
    });

    return res.status(200).json(userCreatedScrims);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/users/:id/scrims
// @desc    get scrims where the user praticipated, ex: user was a caster, or a player (used in UserProfile page)
// @access  Public
const getUserParticipatedScrims = async (req, res) => {
  try {
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(400).json({ error: 'invalid id' });
    }

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userParticipatedScrims = await Scrim.find({
      $and: [{ teamWon: { $exists: true } }, { teamWon: { $ne: null } }],
      // find the player in the teamOne or teamTwo or casters array

      $or: [
        { teamOne: { $elemMatch: { _user: user._id } } },
        { teamTwo: { $elemMatch: { _user: user._id } } },
        { casters: user._id }, // casters is an array of user IDs
      ],
    });

    // Calculate user stats
    const stats = calculateUserStats(userParticipatedScrims, user._id);

    return res.status(200).json({
      scrims: userParticipatedScrims,
      stats,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/users/by-id/:id
// @desc    get a specific user by user._id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select([
      'discord',
      'name',
      'summonerTagline',
      'region',
      'rank',
      'notifications',
      'isAdmin',
      'createdAt',
      'updatedAt',
      'profileBackgroundImg',
      'profileBackgroundBlur',
      'friends',
    ]);

    if (!user)
      return res
        .status(404)
        .json({ error: `User not found with id: ${escape(id)}` });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
  getUserById,
};
