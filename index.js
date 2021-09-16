const createServer = require('./server');
const connect = require('./db/connection');

const PORT = process.env.PORT || 3000;

let MONGODB_URI =
  process.env.PROD_MONGODB || 'mongodb://127.0.0.1:27017/scrimsdatabase';

const app = createServer();

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

let connection = connect(MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

// connection.on(`error`, console.error.bind(console, `connection error:`));
