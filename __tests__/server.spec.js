const supertest = require('supertest');
const mongoose = require('mongoose');
const createServer = require('../server');
// jest.useFakeTimers();

// const User = require('../models/user');
// const faker = require('faker');
const app = createServer();

const DATABASE_NAME = 'scrimsTestDatabase';

beforeAll(async () => {
  let MONGODB_URI = 'mongodb://127.0.0.1:27017/scrimsTestDatabase';

  //  Can't call `openUri()` on an active connection with different connection strings. Make sure you aren't calling `mongoose.connect()` multiple times. See: https://mongoosejs.com/docs/connections.html#multiple_connections
  await mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  // const users = [...Array(25)].map((user, idx) => ({
  //   name: faker.name.firstName(),
  //   discord: faker.name.firstName() + `#123${idx}`,
  //   email: faker.internet.email(),
  //   uid: `13918310120${idx}`,
  //   adminKey: '',
  //   region: 'NA',
  //   rank: 'Silver 2',
  // }));

  // const createdUsers = await User.insertMany(users);
  // console.log('Created users!', createdUsers);
});

describe('GET /', () => {
  it('is the home page and returns the name and instructions on how to use the api', async (done) => {
    const res = await supertest(app).get('/');
    expect(res.text).toBe(
      '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
    );

    done();
  });
});

// fix: Jest has detected the following 1 open handle potentially keeping Jest from exiting mongoose connection
afterAll(async () => {
  await mongoose.connection.db.dropDatabase(); // TypeError: Cannot read property 'dropDatabase' of undefined
  await mongoose.connection.close();
  return;
});
