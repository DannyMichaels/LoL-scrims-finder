const createServer = require('./server');
const connect = require('./db/connection');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./utils/constants');

const PORT = process.env.PORT || 3000;

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
