const mongoose = require('mongoose');

async function connect(dbURI, options = {}) {
  mongoose.set('useCreateIndex', true);

  return mongoose
    .connect(dbURI, options)
    .then(() => {
      console.log('successfully connected to MongoDB on  ' + dbURI);
    })
    .catch((e) => {
      console.error('Connection error', e.message);
    });
}

module.exports = connect;
