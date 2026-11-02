import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJson, getErrorMessage } from '../lib/api.js';
import useReadingList from '../hooks/useReadingList.js';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  const { readingList, addBook, removeBook } = useReadingList();

  useEffect(() => {
    const controller = new AbortController();
    setBook(null);
    setImageFailed(false);
    setLoading(true);
    setError('');
    fetchJson(`/books/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(setBook)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-state" role="status">
        <span className="loading-spinner" />
        <h1>Finding that story...</h1>
        <p>Just a moment while we check the shelves.</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <section className="detail-state">
        <span className="state-icon state-icon-soft" aria-hidden="true">⌕</span>
        <p className="eyebrow">{error ? 'A SMALL DETOUR' : 'NOT ON THIS SHELF'}</p>
        <h1>{error ? 'We couldn’t find that book.' : 'That book seems to have wandered off.'}</h1>
        <p>{error || 'The link may be out of date, or this book may no longer be in the catalog.'}</p>
        <Link className="button button-dark" to="/">Return to the catalog <span aria-hidden="true">→</span></Link>
      </section>
    );
  }

  const genreName = typeof book.genre === 'object' ? book.genre?.name : '';
  const isSaved = readingList.some((item) => item._id === book._id);

  return (
    <article className="detail-page">
      <Link className="back-link" to="/">← <span>Back to the collection</span></Link>
      <div className="detail-layout">
        <div className="detail-cover-wrap">
          {book.coverImage && !imageFailed ? (
            <img
              className="detail-cover"
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="detail-cover cover-fallback">
              <span className="fallback-leaf" aria-hidden="true">✳</span>
              <span>{book.title}</span>
              <small>{book.author}</small>
            </div>
          )}
          <span className="detail-cover-caption">A story worth holding onto</span>
        </div>
        <div className="detail-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> {genreName || 'FROM THE COLLECTION'}</p>
          <h1>{book.title}</h1>
          <p className="detail-author">Words by <strong>{book.author}</strong></p>
          <div className="detail-divider" />
          <h2>Between the covers</h2>
          <p className="detail-description">{book.description || 'A story waiting to be discovered.'}</p>
          <dl className="book-facts">
            {book.isbn && <div><dt>ISBN</dt><dd>{book.isbn}</dd></div>}
            {Number.isInteger(book.availableCopies) && (
              <div><dt>On the shelf</dt><dd>{book.availableCopies} {book.availableCopies === 1 ? 'copy' : 'copies'}</dd></div>
            )}
            {genreName && <div><dt>Genre</dt><dd>{genreName}</dd></div>}
          </dl>
          <button
            className={`button button-outline detail-save${isSaved ? ' is-saved' : ''}`}
            type="button"
            onClick={() => (isSaved ? removeBook(book._id) : addBook(book))}
            aria-pressed={isSaved}
          >
            {isSaved ? '✓ Saved to reading list' : '+ Add to reading list'}
          </button>
          <Link className="button button-dark detail-cta" to="/">Keep exploring <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}
