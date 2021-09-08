const createServer = require('../server');
const supertest = require('supertest');

const app = createServer();

describe('GET /', () => {
  it('is the home page and returns the name and instructions on how to use the api', async () => {
    await supertest(app)
      .get('/')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe(
          '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
        );
      });
  });
});
