const supertest = require('supertest');
const createServer = require('../server.js');
const mongoose = require('mongoose');
const databaseName = 'scrimsTestDatabase';
const User = require('../models/user');
const faker = require('faker');
const sample = require('../utils/sample');

// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
const makeUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

let conn;

beforeAll(async () => {
  const MONGODB_URI = `mongodb://127.0.0.1/${databaseName}`;
  conn = await mongoose
    .connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then((data) => {
      console.log('Successfully connected to MongoDB on  ' + MONGODB_URI);

      return data;
    })
    .catch((e) => {
      console.error('Connection error', e.message);
    });

  const ranks = [
    'Diamond 2',
    'Platinum 1',
    'Platinum 4',
    'Grandmaster',
    'Challenger',
    'Gold 3',
    'Silver 3',
    'Bronze 1',
    'Gold 2',
    'Master',
  ];

  let users = new Array(10).fill().map((_user, idx) => {
    let name = faker.name.firstName();

    return {
      name: name,
      rank: sample(ranks),
      discord: `${name}#1${idx}3`,
      email: faker.internet.email(name),
      region: 'NA',
      uid: makeUuid(),
    };
  });

  let createdUsers = await User.insertMany(users);

  console.log(`Created ${createdUsers.length} new users!`);
});

let user;

const app = createServer();

describe('GET /', () => {
  it('should show welcome with instructions on how to use api', async (done) => {
    let response = await supertest(app).get('/').expect(200);

    expect(response.text).toBe(
      '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
    );

    done();
  });
});

// describe('/api/users', () => {
//   it('should show all users', async (done) => {
//     const app = await createServer();

//     const res = await request(app).get('/api/users');
//     console.log('res', res);
//     expect(res.statusCode).toEqual(200);
//     user = res.body[0];
//     expect(res.body[0]).toHaveProperty('_id');
//     done();
//   });
// });

afterAll(async () => {
  // clear database and close after tests are over
  await conn.connection.db.dropDatabase();
  await conn.connection.close();
});
