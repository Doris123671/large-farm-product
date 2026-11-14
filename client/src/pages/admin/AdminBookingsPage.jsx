import { useEffect, useState } from 'react';
import AdminNavigation from '../../components/admin/AdminNavigation.jsx';
import { fetchJson, getErrorMessage } from '../../lib/api.js';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadBookings() {
    setLoading(true);
    setError('');
    try {
      const result = await fetchJson('/api/bookings');
      setBookings(Array.isArray(result) ? result : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  return (
    <section className="admin-page">
      <p className="eyebrow"><span className="eyebrow-line" /> LIBRARY STAFF</p>
      <h1>Space bookings</h1>
      <AdminNavigation />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-table-heading"><h2>Reservations</h2><button className="admin-refresh" type="button" onClick={loadBookings}>Refresh</button></div>
      {loading ? <div className="state-panel" role="status"><span className="loading-spinner" /><p>Loading bookings...</p></div> : bookings.length === 0 ? (
        <div className="state-panel"><h3>No space bookings yet.</h3><p>Confirmed reservations will appear here.</p></div>
      ) : (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Space</th><th>Patron</th><th>Date</th><th>Start</th><th>End</th></tr></thead>
          <tbody>{bookings.map((booking) => <tr key={booking._id}>
            <td>{booking.space}</td><td>{booking.user?.username || booking.user?.email || 'Unknown'}</td>
            <td>{new Date(booking.date).toLocaleDateString()}</td><td>{booking.startTime}</td><td>{booking.endTime}</td>
          </tr>)}</tbody>
        </table></div>
      )}
    </section>
  );
}