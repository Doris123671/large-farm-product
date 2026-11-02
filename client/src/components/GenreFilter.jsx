import { useEffect, useState } from 'react';
import { fetchJson, getErrorMessage } from '../lib/api.js';

export default function GenreFilter({ value, onChange }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchJson('/genres', { signal: controller.signal })
      .then((result) => setGenres(Array.isArray(result) ? result : []))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <label className="filter-control">
      <span className="control-label">Browse by</span>
      <span className="select-wrap">
        <select
          aria-label="Filter by genre"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading || Boolean(error)}
        >
          <option value="">All genres</option>
          {genres.map((genre) => <option key={genre._id} value={genre._id}>{genre.name}</option>)}
        </select>
        <span aria-hidden="true">⌄</span>
      </span>
      {error && <span className="inline-error" role="status">Genre filter unavailable: {error}</span>}
      {!loading && !error && genres.length === 0 && (
        <span className="inline-hint">No genres are available yet.</span>
      )}
    </label>
  );
}
