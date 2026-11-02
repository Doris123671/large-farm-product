import { Link, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';

function BrandMark() {
  return (
    <Link className="brand" to="/" aria-label="Fieldnotes home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>fieldnotes<span className="brand-period">.</span></span>
    </Link>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <BrandMark />
        <div className="header-note">
          <span className="header-dot" />
          Your neighborhood library, online
        </div>
        <Link className="header-link" to="/">Explore the collection <span aria-hidden="true">↗</span></Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <BrandMark />
        <span>Good books make a good day.</span>
        <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>This page wandered off the shelf.</h1>
      <p>Let’s get you back to something good.</p>
      <Link className="button button-dark" to="/">Browse the catalog <span aria-hidden="true">→</span></Link>
    </section>
  );
}
