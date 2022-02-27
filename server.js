const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const apiKey = require('./middleware/apiKey');
const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrf');

// routes
const scrimRoutes = require('./routes/scrims.routes');
const userRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes');
const conversationRoutes = require('./routes/conversations.routes');
const messageRoutes = require('./routes/messages.routes');
const friendRoutes = require('./routes/friends.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');

function createServer() {
  const app = express();

  const corsOptions = {
    // origin: 'https://lol-scrims-finder.netlify.app',
    origin: 'http://localhost:3001',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
  };

  app.use(cors(corsOptions));

  // parse cookies
  // we need this because "cookie" is true in csrfProtection

  app.use(helmet()); // security with express-helmet

  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));

  // to prohibited characters with _ (mongoSanitize)
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        console.warn(`This request[${key}] is sanitized`, req);
      },
    })
  );

  app.use(logger('dev'));

  // Passport config
  require('./config/passport')(passport);

  app.use(cookieParser());
  app.use(
    csrf({
      cookie: {
        key: '_csrf-token-scrims',
        path: '/context-route',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1-hour
      },
    })
  );

  // app.use('/', (req, res, next) => {
  //   res.cookie('csrf-token', req.csrfToken());
  //   next();
  // });

  // this route doesn't need an api key because app.use(apikey) is called later
  app.get('/', (_req, res) => {
    res.send(
      '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
    );
  });

  // require an api key for these routes
  app.use(apiKey);

  app.get('/api/getCSRFToken', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  app.get('/api/server-status', async (req, res) => {
    try {
      res.status(200).send({ isServerUp: true, success: true });
      return;
    } catch (error) {
      res.status(503).send({ isServerUp: false, success: false });
    }
  });

  app.use('/api', scrimRoutes);
  app.use('/api', userRoutes);
  app.use('/api', authRoutes);
  app.use('/api', conversationRoutes);
  app.use('/api', messageRoutes);
  app.use('/api', friendRoutes);
  app.use('/api', notificationRoutes);
  app.use('/api', adminRoutes);

  return app;
}

module.exports = createServer;
