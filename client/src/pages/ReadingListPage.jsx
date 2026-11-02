import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import useReadingList from '../hooks/useReadingList.js';

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
          {readingList.map((book) => <BookCard key={book._id} book={book} />)}
        </div>
      )}
    </section>
  );
}
