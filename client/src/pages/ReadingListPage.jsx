import { useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import useReadingList from '../hooks/useReadingList.js';
import useAuth from '../hooks/useAuth.js';
import { fetchJson, getErrorMessage } from '../lib/api.js';

function ReadingListBook({ book }) {
  const { status } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function requestBook() {
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const request = await fetchJson('/api/borrow-requests', {
        method: 'POST',
        body: { bookId: book._id },
      });
      setMessage(`Request sent. Due ${new Date(request.dueAt).toLocaleDateString()}.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="reading-list-item">
      <BookCard book={book} />
      {status === 'authenticated' ? (
        <button className="button button-outline reading-request-button" type="button" onClick={requestBook} disabled={submitting}>
          {submitting ? 'Sending request...' : 'Request this book'}
        </button>
      ) : (
        <Link className="reading-request-link" to="/login" state={{ from: { pathname: '/reading-list' } }}>
          Sign in to request this book
        </Link>
      )}
      {message && <p className="form-success reading-request-feedback" role="status">{message}</p>}
      {error && <p className="form-error reading-request-feedback" role="alert">{error}</p>}
    </div>
  );
}

export default function ReadingListPage() {
  const { readingList, clearList } = useReadingList();

  return (
    <section className="reading-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> YOUR OWN LITTLE SHELF</p>
          <h1>Books to come<br /><em>back to.</em></h1>
        </div>
        {readingList.length > 0 && (
          <button className="clear-list-button" type="button" onClick={clearList}>Clear list</button>
        )}
      </div>
      <p className="reading-page-intro" aria-live="polite">
        {readingList.length === 1 ? 'One story saved for later.' : `${readingList.length} stories saved for later.`}
        {' '}This list stays on this device.
      </p>
      {readingList.length === 0 ? (
        <div className="state-panel reading-empty">
          <span className="state-icon state-icon-soft" aria-hidden="true">✳</span>
          <h2>Your shelf is waiting for its first story.</h2>
          <p>Save a book from the catalog and it’ll be here when you return.</p>
          <Link className="button button-dark" to="/">Browse the collection <span aria-hidden="true">→</span></Link>
        </div>
      ) : (
        <div className="book-grid">
          {readingList.map((book) => <ReadingListBook key={book._id} book={book} />)}
        </div>
      )}
    </section>
  );
}
