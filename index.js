const createServer = require('./server');
const mongooseConnect = require('./db/connection');
const { MONGODB_URI } = require('./utils/constants');
const createSocket = require('./socket');
const scrimScheduler = require('./services/scrimScheduler.services');
const { initializeCronJobs } = require('./services/cronJobs.services');

const PORT = process.env.PORT || 3000;

const app = createServer();

const server = app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

const io = createSocket(server);

// Store io instance on app for use in controllers
app.set('io', io);

const connection = mongooseConnect.dbConnect(MONGODB_URI);

connection.on(`error`, console.error.bind(console, `connection error:`));

connection.once(`open`, async () => {
  // we`re connected!
  console.log(`index.js: MongoDB connected on "  ${MONGODB_URI}`);
  
  // Initialize the scrim scheduler after DB connection
  await scrimScheduler.initializeScheduler(io);
  
  // Initialize cron jobs for automatic ban management
  initializeCronJobs();
});

// Cleanup on server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  scrimScheduler.cleanupScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  scrimScheduler.cleanupScheduler();
  process.exit(0);
});
