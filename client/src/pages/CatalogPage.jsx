import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import GenreFilter from '../components/GenreFilter.jsx';
import SearchBar from '../components/SearchBar.jsx';
import useBooks from '../hooks/useBooks.js';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre') ?? '';
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const [refresh, setRefresh] = useState(0);
  const { books, pagination, loading, error } = useBooks({ genre, search, page, refresh });

  const updateQuery = useCallback((updates) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      return next;
    });
  }, [setSearchParams]);

  const onSearchChange = useCallback((value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value.trim()) next.set('search', value.trim());
      else next.delete('search');
      next.delete('page');
      return next;
    });
  }, [setSearchParams]);

  const resultLabel = useMemo(() => {
    if (loading) return 'Finding your next favorite...';
    const noun = pagination.total === 1 ? 'book' : 'books';
    return `${pagination.total} ${noun} on the shelf`;
  }, [loading, pagination.total]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> A LITTLE ROOM FOR BIG STORIES</span>
          <h1>Find your next<br /><em>favorite chapter.</em></h1>
          <p>Thoughtful reads, curious minds, and a fresh story around every corner.</p>
          <Link className="hero-link" to="#catalog">Wander the shelves <span aria-hidden="true">↓</span></Link>
        </div>
        <div className="hero-art" aria-label="Illustration of books and a leafy branch" role="img">
          <div className="art-sun" />
          <div className="art-plant plant-one"><i /><i /><i /><i /><b /></div>
          <div className="art-plant plant-two"><i /><i /><i /><b /></div>
          <div className="art-books">
            <span className="art-book art-book-one"><i /></span>
            <span className="art-book art-book-two"><i /></span>
            <span className="art-book art-book-three"><i /></span>
          </div>
          <span className="art-spark spark-one">✳</span>
          <span className="art-spark spark-two">✳</span>
        </div>
        <div className="hero-index"><span>01</span> / 04</div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> THE COLLECTION</p>
            <h2>Stories worth<br className="mobile-break" /> staying for<span className="heading-period">.</span></h2>
          </div>
          <p className="section-aside">Take your time. The right book has a way<br className="desktop-break" /> of finding you.</p>
        </div>

        <div className="catalog-toolbar">
          <div className="catalog-count" aria-live="polite">
            <span className="count-mark" aria-hidden="true">✳</span> {resultLabel}
          </div>
          <div className="catalog-controls">
            <GenreFilter value={genre} onChange={(value) => updateQuery({ genre: value, page: '' })} />
            <SearchBar value={search} onChange={onSearchChange} />
          </div>
        </div>

        {loading ? (
          <div className="state-panel" role="status" aria-live="polite">
            <span className="loading-spinner" />
            <h3>Turning a few pages...</h3>
            <p>The shelves will be ready in a moment.</p>
          </div>
        ) : error ? (
          <div className="state-panel state-error" role="alert">
            <span className="state-icon" aria-hidden="true">!</span>
            <h3>We couldn’t reach the shelves.</h3>
            <p>{error} Check your connection and try again.</p>
            <button className="button button-dark" type="button" onClick={() => setRefresh((value) => value + 1)}>
              Try again <span aria-hidden="true">↻</span>
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="state-panel">
            <span className="state-icon state-icon-soft" aria-hidden="true">⌕</span>
            <h3>No stories on this shelf just yet.</h3>
            <p>Try another title or genre, and we’ll keep looking.</p>
            {(search || genre) && (
              <button className="button button-outline" type="button" onClick={() => setSearchParams({})}>
                Clear filters <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="book-grid">
              {books.map((book) => <BookCard key={book._id} book={book} />)}
            </div>
            {pagination.pages > 1 && (
              <nav className="pagination" aria-label="Catalog pages">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => updateQuery({ page: String(page - 1) })}
                >
                  ← Previous
                </button>
                <span>Page {page} of {pagination.pages}</span>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => updateQuery({ page: String(page + 1) })}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
