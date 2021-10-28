// models
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
// utils
// const { MONGODB_URI } = require('../utils/constants');
const mongooseConnect = require('../db/connection');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

let connection;

// run this after uid change to re-hash the uid (reset)
const main = async () => {
  try {
    const _id = ''; // user._id
    const USER_UID = ''; // google uid

    bcrypt.genSalt(10, async (err, salt) => {
      console.log('genSalt');

      bcrypt.hash(USER_UID, salt, async (err, hashUid) => {
        if (err) throw err;

        let user = await User.findById(_id);
        user.uid = hashUid;
        let savedUser = await user.save();
        console.log({ savedUser });
        await connection.close();
        return;
      });
    });
    return;
  } catch (error) {
    console.log(error);
    await connection.close();
    return;
  }
};

const run = async () => {
  connection = mongooseConnect.dbConnect(MONGODB_URI);
  connection.once('open', () =>
    console.log('running mongoose to query file on ' + MONGODB_URI)
  );

  connection.on('error', (error) => done(error));

  await main();

  // await connection.close();
};

run();
