const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const KEYS = require('../config/keys');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
  const region = req.query?.region;
  // /api/users?region=NA
  if (region) {
    try {
      // don't show other fields, using select.
      const users = await User.find({ region }).select([
        'discord',
        'name',
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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminKey = req?.query?.adminKey;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    if (!adminKey) {
      return res.status(500).json({ error: 'admin key not provided' });
    }

    if (adminKey !== KEYS.ADMIN_KEY) {
      return res.status(500).json({ error: 'incorrect admin key' });
    }

    let user = await User.findOne({ _id: id }).select([
      'discord',
      'name',
      'region',
      'createdAt',
      'updatedAt',
      'email',
      'adminKey',
    ]);

    if (!user) return res.status(404).json({ message: 'User not found!' });

    // using populate to show more than _id when using Ref on the model.
    return res.json({
      ...user._doc,
      'isAdmin?': user.adminKey === KEYS.ADMIN_KEY,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserCreatedScrims = async (req, res) => {
  try {
    const { id } = req.params;
    const adminKey = req?.query?.adminKey;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    if (!adminKey) {
      return res.status(500).json({ error: 'admin key not provided' });
    }

    if (adminKey !== KEYS.ADMIN_KEY) {
      return res.status(500).json({ error: 'incorrect admin key' });
    }

    let user = await User.findOne({ _id: id }).select([
      'discord',
      'name',
      'region',
      'createdAt',
      'updatedAt',
      'email',
      'adminKey',
    ]);

    if (!user) return res.status(404).json({ message: 'User not found!' });

    // using populate to show more than _id when using Ref on the model.
    return res.json({
      ...user._doc,
      'isAdmin?': user.adminKey === KEYS.ADMIN_KEY,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserCreatedScrims,
};
