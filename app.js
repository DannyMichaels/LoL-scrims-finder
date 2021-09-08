const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const apiKey = require('./utils/apiKey');
const scrimRoutes = require('./routes/scrims');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(logger('dev'));

// this route doesn't need an api key because app.use(apikey) is called later
app.get('/', (_req, res) => {
  res.send(
    '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
  );
});

// require an api key for these routes
app.use(apiKey);
app.use('/api', scrimRoutes);

// Passport config
require('./config/passport')(passport);

app.use('/api', userRoutes);
app.use('/api', authRoutes);

module.exports = app;
