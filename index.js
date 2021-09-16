const createServer = require('./server');
const db = require('./db/connection');
const PORT = process.env.PORT || 3000;

const app = createServer();

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

db.on(`error`, console.error.bind(console, `connection error:`));
