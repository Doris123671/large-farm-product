import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const [imageFailed, setImageFailed] = useState(false);
  const genreName = typeof book.genre === 'object' ? book.genre?.name : '';

  return (
    <article className="book-card">
      <Link className="book-cover-link" to={`/book/${book._id}`} aria-label={`View ${book.title}`}>
        <div className="book-cover">
          {book.coverImage && !imageFailed ? (
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="cover-fallback" aria-label="Cover image unavailable">
              <span className="fallback-leaf" aria-hidden="true">✳</span>
              <span>{book.title}</span>
              <small>{book.author}</small>
            </div>
          )}
          <span className="cover-arrow" aria-hidden="true">↗</span>
        </div>
      </Link>
      <div className="book-card-copy">
        {genreName && <span className="book-genre">{genreName}</span>}
        <h2><Link to={`/book/${book._id}`}>{book.title}</Link></h2>
        <p>{book.author}</p>
      </div>
    </article>
  );
}
