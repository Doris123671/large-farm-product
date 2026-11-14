const request = require('supertest');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { clearDatabase, createToken, startTestApp, stopTestApp } = require('./helpers');

describe('space booking conflicts', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    ({ app, mongoServer } = await startTestApp());
  });

  afterEach(clearDatabase);

  afterAll(async () => {
    await stopTestApp(mongoServer);
  });

  test('rejects a partial time overlap for the same space and date', async () => {
    const patron = await User.create({
      username: 'booking_reader',
      email: 'booking@example.com',
      password: 'secure-password',
    });
    const date = new Date('2026-07-14T00:00:00.000Z');
    await Booking.create({
      space: 'Quiet Study - Desk 1',
      user: patron._id,
      date,
      startTime: '10:00',
      endTime: '11:00',
    });

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${createToken(patron)}`)
      .send({
        space: 'Quiet Study - Desk 1',
        date: '2026-07-14',
        startTime: '10:30',
        endTime: '11:30',
      })
      .expect(409)
      .expect(({ body }) => {
        expect(body.error).toMatch(/already booked/i);
      });
  });
});