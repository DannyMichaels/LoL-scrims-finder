const createServer = require('../server');
const supertest = require('supertest');
const User = require('../models/user');
const mongoose = require('mongoose');
const faker = require('faker');

const app = createServer();

beforeAll(async () => {
  let MONGODB_URI =
    process.env.PROD_MONGODB || 'mongodb://127.0.0.1:27017/scrimsdatabase';

  await mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  const users = [...Array(25)].map((user, idx) => ({
    name: faker.name.firstName(),
    discord: faker.name.firstName() + `#123${idx}`,
    email: faker.internet.email(),
    uid: `13918310120${idx}`,
    adminKey: '',
    region: 'NA',
    rank: 'Silver 2',
  }));

  const createdUsers = await User.insertMany(users);
  console.log('Created users!', createdUsers);
});

let user;

describe('GET /', () => {
  it('is the home page and returns the name and instructions on how to use the api', async (done) => {
    await supertest(app)
      .get('/')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe(
          '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
        );
      });

    done();
  });
});
