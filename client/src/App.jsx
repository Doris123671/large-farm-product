import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';
import useReadingList from './hooks/useReadingList.js';
import CatalogPage from './pages/CatalogPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ReadingListPage from './pages/ReadingListPage.jsx';

function SiteHeader() {
  const { status, logout } = useAuth();
  const { readingList } = useReadingList();
  const [logoutError, setLogoutError] = useState('');

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message || 'Could not log out. Please try again.');
    }
  }

  return (
    <>
      <header className="site-header">
        <BrandMark />
        <div className="header-note">
          <span className="header-dot" />
          Your neighborhood library, online
        </div>
        <nav className="header-nav" aria-label="Main navigation">
          <Link className="header-nav-link" to="/reading-list">Reading list <span className="reading-count">{readingList.length}</span></Link>
          {status === 'authenticated' ? (
            <>
              <Link className="header-nav-link" to="/booking">Book a space</Link>
              <button className="header-nav-link header-button" type="button" onClick={handleLogout}>Sign out</button>
            </>
          ) : status === 'loading' ? (
            <span className="header-nav-link" aria-label="Checking sign-in status">Checking...</span>
          ) : (
            <Link className="header-nav-link" to="/login">Sign in</Link>
          )}
          <Link className="header-link" to="/">Explore the collection <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>
      {logoutError && <p className="global-auth-error" role="alert">{logoutError}</p>}
    </>
  );
}

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
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="/reading-list" element={<ReadingListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
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
