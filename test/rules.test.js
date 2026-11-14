const assert = require('node:assert/strict');
const test = require('node:test');
const { buildBookingOverlapFilter } = require('../utils/bookingRules');
const { calculateFine } = require('../utils/borrowRules');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

test('fine is zero when returned before or at the due time', () => {
  const dueAt = new Date('2026-06-01T12:00:00Z');
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() - 1)), 0);
  assert.equal(calculateFine(dueAt, dueAt), 0);
});

test('fine charges 25 cents for each started 24-hour period late', () => {
  const dueAt = new Date('2026-06-01T12:00:00Z');
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() + 1)), 0.25);
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() + DAY)), 0.25);
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() + DAY + 1)), 0.5);
});

test('booking overlap query uses strict interval intersection on the same space and date', () => {
  const date = new Date('2026-07-14T00:00:00Z');
  const filter = buildBookingOverlapFilter({
    space: 'Quiet Study — Desk 1',
    date,
    startTime: '10:00',
    endTime: '11:00',
  });
  assert.deepEqual(filter, {
    space: 'Quiet Study — Desk 1',
    date,
    startTime: { $lt: '11:00' },
    endTime: { $gt: '10:00' },
  });
});