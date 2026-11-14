const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const BorrowRequest = require('../models/BorrowRequest');
const { requireAuth, requireRole } = require('../middleware/auth');
const { calculateFine } = require('../utils/borrowRules');

const router = express.Router();
const LOAN_DAYS = 14;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function populatedRequest(query) {
  return query.populate('book').populate('user', 'username email');
}

router.post('/', requireAuth, asyncRoute(async (req, res) => {
  const { bookId } = req.body || {};
  if (typeof bookId !== 'string' || !mongoose.isValidObjectId(bookId)) {
    return res.status(400).json({ error: 'A valid bookId is required.' });
  }

  const book = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true }
  );
  if (!book) {
    if (!(await Book.exists({ _id: bookId }))) return res.status(404).json({ error: 'Book not found.' });
    return res.status(409).json({ error: 'No copies of this book are currently available.' });
  }

  const requestedAt = new Date();
  const dueAt = new Date(requestedAt.getTime() + LOAN_DAYS * MILLISECONDS_PER_DAY);
  try {
    const request = await BorrowRequest.create({
      book: book._id,
      user: req.user._id,
      requestedAt,
      dueAt,
    });
    return res.status(201).json(await populatedRequest(BorrowRequest.findById(request._id)));
  } catch (error) {
    await Book.updateOne({ _id: book._id }, { $inc: { availableCopies: 1 } });
    throw error;
  }
}));

router.get('/', requireAuth, requireRole('librarian'), asyncRoute(async (_req, res) => {
  const requests = await populatedRequest(BorrowRequest.find()).sort({ requestedAt: -1 });
  return res.status(200).json(requests);
}));

router.patch('/:id', requireAuth, requireRole('librarian'), asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid borrow request id.' });
  }
  if (!req.body || typeof req.body.status !== 'string' ||
      Object.keys(req.body).some((field) => field !== 'status') ||
      !['pending', 'approved', 'returned', 'late'].includes(req.body.status)) {
    return res.status(400).json({ error: 'Provide only a valid status: pending, approved, returned, or late.' });
  }

  const existing = await BorrowRequest.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Borrow request not found.' });
  if (existing.status === 'returned' && req.body.status !== 'returned') {
    return res.status(409).json({ error: 'A returned request cannot be reopened.' });
  }
  if (existing.status === 'returned') {
    return res.status(200).json(await populatedRequest(BorrowRequest.findById(existing._id)));
  }

  const updates = { status: req.body.status };
  if (req.body.status === 'returned') {
    const returnedAt = new Date();
    updates.returnedAt = returnedAt;
    updates.fine = calculateFine(existing.dueAt, returnedAt);
  } else {
    updates.returnedAt = null;
    updates.fine = 0;
  }

  const updated = await BorrowRequest.findOneAndUpdate(
    { _id: existing._id, status: { $ne: 'returned' } },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(409).json({ error: 'This request has already been returned.' });
  if (req.body.status === 'returned') {
    await Book.updateOne({ _id: updated.book }, { $inc: { availableCopies: 1 } });
  }

  return res.status(200).json(await populatedRequest(BorrowRequest.findById(updated._id)));
}));

module.exports = router;