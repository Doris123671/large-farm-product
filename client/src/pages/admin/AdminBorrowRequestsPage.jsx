import { useEffect, useState } from 'react';
import AdminNavigation from '../../components/admin/AdminNavigation.jsx';
import { fetchJson, getErrorMessage } from '../../lib/api.js';

const statuses = ['pending', 'approved', 'returned', 'late'];

export default function AdminBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const result = await fetchJson('/api/borrow-requests');
      setRequests(Array.isArray(result) ? result : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequests(); }, []);

  async function updateStatus(requestId, status) {
    setUpdatingId(requestId);
    setError('');
    try {
      const updated = await fetchJson(`/api/borrow-requests/${requestId}`, {
        method: 'PATCH',
        body: { status },
      });
      setRequests((current) => current.map((request) => request._id === requestId ? updated : request));
    } catch (updateError) {
      setError(getErrorMessage(updateError));
      await loadRequests();
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <section className="admin-page">
      <p className="eyebrow"><span className="eyebrow-line" /> LIBRARY STAFF</p>
      <h1>Borrow requests</h1>
      <AdminNavigation />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-table-heading"><h2>Circulation queue</h2><button className="admin-refresh" type="button" onClick={loadRequests}>Refresh</button></div>
      {loading ? <div className="state-panel" role="status"><span className="loading-spinner" /><p>Loading requests...</p></div> : requests.length === 0 ? (
        <div className="state-panel"><h3>No borrow requests yet.</h3><p>New patron requests will appear here.</p></div>
      ) : (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Book</th><th>Patron</th><th>Requested</th><th>Due</th><th>Status</th><th>Returned</th><th>Fine</th></tr></thead>
          <tbody>{requests.map((request) => <tr key={request._id}>
            <td>{request.book?.title || 'Book removed'}</td>
            <td>{request.user?.username || request.user?.email || 'Unknown'}</td>
            <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
            <td>{new Date(request.dueAt).toLocaleDateString()}</td>
            <td><select aria-label={`Status for ${request.book?.title || 'borrow request'}`} value={request.status} disabled={updatingId === request._id || request.status === 'returned'} onChange={(event) => updateStatus(request._id, event.target.value)}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select></td>
            <td>{request.returnedAt ? new Date(request.returnedAt).toLocaleDateString() : '—'}</td>
            <td>${Number(request.fine || 0).toFixed(2)}</td>
          </tr>)}</tbody>
        </table></div>
      )}
      <p className="admin-help">Returned books are checked against the due date and fined at $0.25 per late calendar day.</p>
    </section>
  );
}