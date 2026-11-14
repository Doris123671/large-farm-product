import { useEffect, useState } from 'react';
import AdminNavigation from '../../components/admin/AdminNavigation.jsx';
import { fetchJson, getErrorMessage } from '../../lib/api.js';

function emptyBook() {
  return {
    title: '',
    author: '',
    isbn: '',
    description: '',
    coverImage: '',
    totalCopies: '1',
    availableCopies: '1',
    genre: '',
  };
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [book, setBook] = useState(emptyBook);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [bookResult, genreResult] = await Promise.all([
        fetchJson('/books?limit=100'),
        fetchJson('/genres'),
      ]);
      setBooks(Array.isArray(bookResult.data) ? bookResult.data : []);
      setGenres(Array.isArray(genreResult) ? genreResult : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function editBook(selectedBook) {
    setEditingId(selectedBook._id);
    setBook({
      title: selectedBook.title,
      author: selectedBook.author,
      isbn: selectedBook.isbn,
      description: selectedBook.description,
      coverImage: selectedBook.coverImage,
      totalCopies: String(selectedBook.totalCopies),
      availableCopies: String(selectedBook.availableCopies),
      genre: typeof selectedBook.genre === 'object' ? selectedBook.genre._id : selectedBook.genre,
    });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId('');
    setBook(emptyBook());
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      ...book,
      totalCopies: Number(book.totalCopies),
      availableCopies: Number(book.availableCopies),
    };
    try {
      await fetchJson(editingId ? `/books/${editingId}` : '/books', {
        method: editingId ? 'PUT' : 'POST',
        body: payload,
      });
      setNotice(editingId ? 'Book updated.' : 'Book added.');
      cancelEdit();
      await loadData();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function deleteBook(bookId) {
    if (!window.confirm('Delete this book from the catalog?')) return;
    setError('');
    setNotice('');
    try {
      await fetchJson(`/books/${bookId}`, { method: 'DELETE' });
      setBooks((current) => current.filter((item) => item._id !== bookId));
      setNotice('Book deleted.');
      if (editingId === bookId) cancelEdit();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  return (
    <section className="admin-page">
      <p className="eyebrow"><span className="eyebrow-line" /> LIBRARY STAFF</p>
      <h1>Catalog administration</h1>
      <AdminNavigation />
      <div className="admin-form-panel">
        <h2>{editingId ? 'Edit book' : 'Add a book'}</h2>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}
        <form className="admin-book-form" onSubmit={handleSubmit}>
          <label>Title<input required value={book.title} onChange={(event) => setBook({ ...book, title: event.target.value })} /></label>
          <label>Author<input required value={book.author} onChange={(event) => setBook({ ...book, author: event.target.value })} /></label>
          <label>ISBN<input required value={book.isbn} onChange={(event) => setBook({ ...book, isbn: event.target.value })} /></label>
          <label>Genre<select required value={book.genre} onChange={(event) => setBook({ ...book, genre: event.target.value })}>
            <option value="">Select a genre</option>
            {genres.map((genre) => <option key={genre._id} value={genre._id}>{genre.name}</option>)}
          </select></label>
          <label className="admin-form-wide">Cover image URL<input type="url" required value={book.coverImage} onChange={(event) => setBook({ ...book, coverImage: event.target.value })} /></label>
          <label>Total copies<input type="number" min="0" step="1" required value={book.totalCopies} onChange={(event) => setBook({ ...book, totalCopies: event.target.value })} /></label>
          <label>Available copies<input type="number" min="0" step="1" required value={book.availableCopies} onChange={(event) => setBook({ ...book, availableCopies: event.target.value })} /></label>
          <label className="admin-form-wide">Description<textarea required rows="3" value={book.description} onChange={(event) => setBook({ ...book, description: event.target.value })} /></label>
          <div className="admin-form-actions">
            <button className="button button-dark" type="submit" disabled={saving || loading || genres.length === 0}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add book'}
            </button>
            {editingId && <button className="button button-outline" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="admin-table-heading"><h2>Books</h2><button className="admin-refresh" type="button" onClick={loadData}>Refresh</button></div>
      {loading ? <div className="state-panel" role="status"><span className="loading-spinner" /><p>Loading books...</p></div> : error && books.length === 0 ? (
        <div className="state-panel state-error" role="alert"><h3>Books could not be loaded.</h3><p>{error}</p></div>
      ) : books.length === 0 ? <div className="state-panel"><h3>No books in the catalog.</h3><p>Add the first book using the form above.</p></div> : (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Title</th><th>Author</th><th>ISBN</th><th>Copies</th><th>Genre</th><th>Actions</th></tr></thead>
          <tbody>{books.map((item) => <tr key={item._id}>
            <td>{item.title}</td><td>{item.author}</td><td>{item.isbn}</td>
            <td>{item.availableCopies} / {item.totalCopies}</td>
            <td>{typeof item.genre === 'object' ? item.genre?.name : '—'}</td>
            <td className="admin-row-actions"><button type="button" onClick={() => editBook(item)}>Edit</button><button type="button" onClick={() => deleteBook(item._id)}>Delete</button></td>
          </tr>)}</tbody>
        </table></div>
      )}
    </section>
  );
}