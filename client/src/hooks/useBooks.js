import { useEffect, useState } from 'react';
import { fetchJson, getErrorMessage } from '../lib/api.js';

export default function useBooks({ genre, search, page, refresh }) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), limit: '12' });
    if (genre) query.set('genre', genre);
    if (search.trim()) query.set('search', search.trim());

    setLoading(true);
    setError('');
    fetchJson(`/books?${query}`, { signal: controller.signal })
      .then((result) => {
        setData(Array.isArray(result.data) ? result.data : []);
        setPagination(result.pagination ?? { page, limit: 12, total: 0, pages: 0 });
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setData([]);
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [genre, search, page, refresh]);

  return { books: data, pagination, loading, error };
}
