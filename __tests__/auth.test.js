const request = require('supertest');
const User = require('../models/User');
const { clearDatabase, createToken, startTestApp, stopTestApp } = require('./helpers');

describe('borrow-request authorization', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    ({ app, mongoServer } = await startTestApp());
  });

  afterEach(clearDatabase);

  afterAll(async () => {
    await stopTestApp(mongoServer);
  });

  test('rejects a request without a token', async () => {
    await request(app).get('/api/borrow-requests').expect(401);
  });

  test('allows configured credentialed CORS origins and rejects unknown origins', async () => {
    await request(app)
      .get('/health')
      .set('Origin', 'https://catalog.example')
      .expect('Access-Control-Allow-Origin', 'https://catalog.example')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect(200);

    await request(app)
      .get('/health')
      .set('Origin', 'https://untrusted.example')
      .expect(403);
  });

  test('rejects a patron from the librarian-only request list', async () => {
    const patron = await User.create({
      username: 'reader_one',
      email: 'reader@example.com',
      password: 'secure-password',
    });
    const token = createToken(patron);

    await request(app)
      .get('/api/borrow-requests')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});