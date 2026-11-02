import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'fieldnotes-reading-list';
export const ReadingListContext = createContext(null);

function readStoredBooks() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const books = JSON.parse(stored);
    return Array.isArray(books)
      ? books.filter((book) => book && typeof book._id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function ReadingListProvider({ children }) {
  const [readingList, setReadingList] = useState(readStoredBooks);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList));
    } catch (error) {
      console.error('Could not persist the reading list:', error);
    }
  }, [readingList]);

  const addBook = useCallback((book) => {
    if (!book || typeof book._id !== 'string') {
      throw new TypeError('A book with a valid id is required.');
    }
    setReadingList((current) => current.some((item) => item._id === book._id)
      ? current
      : [...current, book]);
  }, []);

  const removeBook = useCallback((bookId) => {
    setReadingList((current) => current.filter((book) => book._id !== bookId));
  }, []);

  const clearList = useCallback(() => setReadingList([]), []);

  const value = useMemo(
    () => ({ readingList, addBook, removeBook, clearList }),
    [readingList, addBook, removeBook, clearList]
  );

  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}
