const mongoose = require('mongoose');

function dbConnect(dbUri) {
  mongoose.connect(dbUri);
  return mongoose.connection;
}

function dbClose() {
  return mongoose.disconnect();
}

module.exports = { dbConnect, dbClose };
