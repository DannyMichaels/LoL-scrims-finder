const db = require('../db/connection');
const keys = require('../config/keys');
// jwt
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// models
const User = require('../models/user');

/**
 * @method removeSpacesBeforeHashTag
 * takes a discord name and trims the spaces.
 * @param {String} str
 * @returns {String}
 */
const removeSpacesBeforeHashTag = (str) => {
  // for discord name
  return str
    .trim()
    .replace(/\s([#])/g, function (el1, el2) {
      return '' + el2;
    })
    .replace(/(«)\s/g, function (el1, el2) {
      return el2 + '';
    });
};

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// get google uid and email by using google auth firebase, then give rest of user data hosted in database.
// same as verify user but with errors.
const loginUser = async (req, res) => {
  const { email, uid } = req.body;

  if (!email) {
    res.status(500).json({
      error: `No Email Provided`,
    });
    return;
  }

  if (!uid) {
    res.status(500).json({
      error: `No google id Provided.`,
    });
    return;
  }

  // will find the one user with the exact uid and email combination
  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    res.status(500).json({
      error: `User not found with the email: ${email}, please sign up or try again.`,
    });
    return;
  }

  // Check uid
  bcrypt.compare(uid, foundUser.uid).then((isMatch) => {
    if (isMatch) {
      console.log({ isMatch, uid });
      // User matched
      // Create JWT Payload
      const payload = {
        uid: foundUser.uid,
        email: foundUser.uid,
      };
      // Sign token
      jwt.sign(
        payload,
        keys.secretOrKey,
        {
          expiresIn: 31556926, // 1 year in seconds
          // expiresIn: new Date(new Date()).setDate(new Date().getDate() + 30), // 30 days from now, does this work?
        },
        (err, token) => {
          return res.json({
            success: true,
            token: 'Bearer ' + token,
          });
        }
      );
    } else {
      return res.status(500).json('password incorrect');
    }
  });
};

const registerUser = async (req, res) => {
  try {
    const { uid, name, discord, rank, adminKey, email, region } = req.body;

    const noSpacesDiscord = removeSpacesBeforeHashTag(discord);

    const userData = {
      uid,
      name,
      discord: noSpacesDiscord,
      rank,
      adminKey,
      email,
      region,
    };

    const userExists = await User.find({ uid, email });

    const discordTaken = await User.findOne({ discord: noSpacesDiscord });

    if (discordTaken) {
      return res.status(500).json({
        error: `Error: User with discord: ${discord} already exists!`,
      });
    }

    if (userExists.length) {
      return res.status(500).json({
        error: `Error: User with email ${email} already exists!`,
      });
    }

    const newUser = new User(userData);

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.uid, salt, (err, hash) => {
        if (err) throw err;
        newUser.uid = hash; // hash google uid to use as token, maybe there's something better that google provides as token.
        newUser.save();
        res.status(201).json(newUser);
        console.log('User created: ', newUser);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// get google uid and email by using google auth firebase, then give rest of user data hosted in database.
const verifyUser = async (req, res) => {
  const { email, uid } = req.body;

  // will find the one user with the exact uid and email combination
  const foundUser = await User.findOne({ uid, email });

  if (foundUser) {
    return res.json(foundUser);
  }
};

module.exports = {
  loginUser,
  verifyUser,
  registerUser,
};
