const mongoose = require('mongoose');

async function connect(dbURI, options = {}) {
  return mongoose
    .connect(dbURI, options)
    .then(() => console.log('successfully connected to MongoDB on  ' + dbURI));
}

module.exports = connect;
