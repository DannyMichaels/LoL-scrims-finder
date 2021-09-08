const createServer = require('./server');
const db = require('./db/connection');
const PORT = process.env.PORT || 3000;

const app = createServer();

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
