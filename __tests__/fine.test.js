const mongoose = require('mongoose');
const request = require('supertest');
const BorrowRequest = require('../models/BorrowRequest');
const User = require('../models/User');
const { clearDatabase, createToken, startTestApp, stopTestApp } = require('./helpers');

const DAY = 24 * 60 * 60 * 1000;

describe('server-side return fines', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    ({ app, mongoServer } = await startTestApp());
  });

  afterEach(clearDatabase);

  afterAll(async () => {
    await stopTestApp(mongoServer);
  });

  test('calculates 75 cents for a return two days and one millisecond late', async () => {
    const librarian = await User.create({
      username: 'librarian_one',
      email: 'librarian@example.com',
      password: 'secure-password',
      role: 'librarian',
    });
    const dueAt = new Date(Date.now() - (2 * DAY + 1));
    const borrowRequest = await BorrowRequest.create({
      book: new mongoose.Types.ObjectId(),
      user: librarian._id,
      requestedAt: new Date(dueAt.getTime() - 14 * DAY),
      dueAt,
    });

    const response = await request(app)
      .patch(`/api/borrow-requests/${borrowRequest._id}`)
      .set('Authorization', `Bearer ${createToken(librarian)}`)
      .send({ status: 'returned' })
      .expect(200);

    expect(response.body.status).toBe('returned');
    expect(response.body.fine).toBe(0.75);
    expect(response.body.returnedAt).toBeTruthy();
  });
});