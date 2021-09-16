const createServer = require('./server');
const connect = require('./db/connection');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

let MONGODB_URI =
  process.env.PROD_MONGODB || 'mongodb://127.0.0.1:27017/scrimsdatabase';

const app = createServer();

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

connect(MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on(
  `error`,
  console.error.bind(console, `connection error:`)
);

mongoose.connection.once(`open`, () => {
  // we`re connected!
  console.log(`index.js: MongoDB connected on "  ${MONGODB_URI}`);
});
