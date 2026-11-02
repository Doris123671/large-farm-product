import { Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm.jsx';

export default function BookingPage() {
  return (
    <section className="booking-page">
      <Link className="back-link" to="/">← <span>Back to the collection</span></Link>
      <div className="booking-layout">
        <div className="booking-heading">
          <p className="eyebrow"><span className="eyebrow-line" /> MAKE A LITTLE ROOM</p>
          <h1>A place to<br /><em>settle in.</em></h1>
          <p>Choose a favorite corner of the library and a time to enjoy it. We’ll hold onto your selections right here.</p>
          <span className="booking-ornament" aria-hidden="true">✳</span>
        </div>
        <div className="booking-card">
          <h2>Plan your visit</h2>
          <p className="booking-card-intro">Pick a space, date, and time that work for you.</p>
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
