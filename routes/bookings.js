const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { requireAuth, requireRole } = require('../middleware/auth');
const { buildBookingOverlapFilter } = require('../utils/bookingRules');

const router = express.Router();
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

router.post('/', requireAuth, asyncRoute(async (req, res) => {
  const { space, date, startTime, endTime } = req.body || {};
  const errors = {};
  if (typeof space !== 'string' || !space.trim() || space.trim().length > 120) {
    errors.space = 'Must be a non-empty space name of at most 120 characters.';
  }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00.000Z`)) ||
      new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date) {
    errors.date = 'Must be a valid date in YYYY-MM-DD format.';
  }
  if (typeof startTime !== 'string' || !TIME_PATTERN.test(startTime)) errors.startTime = 'Must use 24-hour HH:MM format.';
  if (typeof endTime !== 'string' || !TIME_PATTERN.test(endTime)) errors.endTime = 'Must use 24-hour HH:MM format.';
  if (TIME_PATTERN.test(startTime || '') && TIME_PATTERN.test(endTime || '') && startTime >= endTime) {
    errors.endTime = 'Must be later than startTime.';
  }
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed.', details: errors });

  const bookingDate = new Date(`${date}T00:00:00.000Z`);
  const conflict = await Booking.exists(buildBookingOverlapFilter({
    space: space.trim(),
    date: bookingDate,
    startTime,
    endTime,
  }));
  if (conflict) return res.status(409).json({ error: 'This space is already booked during part of that time range.' });

  const booking = await Booking.create({
    space: space.trim(),
    user: req.user._id,
    date: bookingDate,
    startTime,
    endTime,
  });
  return res.status(201).json(await Booking.findById(booking._id).populate('user', 'username email'));
}));

router.get('/', requireAuth, requireRole('librarian'), asyncRoute(async (_req, res) => {
  const bookings = await Booking.find().populate('user', 'username email')
    .sort({ date: 1, startTime: 1 });
  return res.status(200).json(bookings);
}));

router.get('/:id', requireAuth, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid booking id.' });
  const booking = await Booking.findById(req.params.id).populate('user', 'username email');
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'librarian') {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  return res.status(200).json(booking);
}));

module.exports = router;