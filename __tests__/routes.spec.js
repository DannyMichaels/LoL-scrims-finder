const request = require('supertest');
const createServer = require('../server.js');
const mongoose = require('mongoose');
const databaseName = 'scrimsTestDatabase';
const User = require('../models/user');
const faker = require('faker');

beforeAll(async () => {
  const MONGODB_URI = `mongodb://127.0.0.1/${databaseName}`;
  await mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  const users = [...Array(25)].map((user, idx) => ({
    name: faker.name.firstName(),
    discord: faker.name.lastName() + `#13${idx}`,
    email: faker.internet.email(),
    rank: 'Silver 2',
    region: 'NA',
    uid: '1414141041' + idx,
  }));

  const createdUsers = await User.insertMany(users);
  console.log('Created users!', createdUsers.length);
});

const app = createServer();

let user;

describe('/api/users', () => {
  it('should show all users', async (done) => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    user = res.body[0];
    expect(res.body[0]).toHaveProperty('_id');
    done();
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
