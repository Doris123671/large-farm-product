import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ReadingListProvider } from '../../context/ReadingListContext.jsx';
import BookCard from '../BookCard.jsx';

const book = {
  _id: 'book-123',
  title: 'The Quiet Library',
  author: 'A. Reader',
  genre: { name: 'Fiction' },
  coverImage: '',
};

function renderBookCard() {
  return render(
    <MemoryRouter>
      <ReadingListProvider>
        <BookCard book={book} />
      </ReadingListProvider>
    </MemoryRouter>
  );
}

beforeEach(() => window.localStorage.clear());

describe('BookCard', () => {
  it('renders the book title, author, and genre', () => {
    renderBookCard();

    expect(screen.getByRole('heading', { name: 'The Quiet Library' })).toBeTruthy();
    expect(screen.getAllByText('A. Reader')).toHaveLength(2);
    expect(screen.getByText('Fiction')).toBeTruthy();
  });

  it('adds a book to the reading list when its save control is pressed', () => {
    renderBookCard();
    fireEvent.click(screen.getByRole('button', { name: /add to reading list/i }));

    expect(screen.getByRole('button', { name: /saved to reading list/i }).getAttribute('aria-pressed')).toBe('true');
  });
});