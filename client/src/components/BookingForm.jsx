import { useState } from 'react';
import { fetchJson, getErrorMessage } from '../lib/api.js';

const spaces = [
  'Reading Room — Window Seat',
  'Quiet Study — Desk 1',
  'Quiet Study — Desk 2',
  'Community Room',
];

export default function BookingForm() {
  const [booking, setBooking] = useState({
    space: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const minimumDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);

  function updateField(event) {
    setBooking((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSaved(false);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaved(false);
    setError('');
    setSubmitting(true);
    try {
      await fetchJson('/api/bookings', { method: 'POST', body: booking });
      setSaved(true);
    } catch (bookingError) {
      setError(getErrorMessage(bookingError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <label>
        <span>Choose a space</span>
        <select name="space" value={booking.space} onChange={updateField} required>
          <option value="">Select a library space</option>
          {spaces.map((space) => <option key={space} value={space}>{space}</option>)}
        </select>
      </label>
      <label>
        <span>Date</span>
        <input type="date" name="date" min={minimumDate} value={booking.date} onChange={updateField} required />
      </label>
      <div className="booking-time-row">
        <label>
          <span>Start time</span>
          <input type="time" name="startTime" value={booking.startTime} onChange={updateField} required />
        </label>
        <label>
          <span>End time</span>
          <input type="time" name="endTime" value={booking.endTime} onChange={updateField} required />
        </label>
      </div>
      <p className="booking-note">The library checks your time against existing reservations before confirming the space.</p>
      <button className="button button-dark auth-submit" type="submit" disabled={submitting}>
        {submitting ? 'Checking availability...' : 'Request this time'} <span aria-hidden="true">→</span>
      </button>
      {error && <p className="form-error booking-success" role="alert">{error}</p>}
      {saved && (
        <p className="form-success booking-success" role="status">
          Your space booking is confirmed.
        </p>
      )}
    </form>
  );
}
