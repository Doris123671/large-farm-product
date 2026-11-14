import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../SearchBar.jsx';

describe('SearchBar', () => {
  afterEach(() => vi.useRealTimers());

  it('calls onChange with the typed search after the debounce delay', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} delay={250} />);

    fireEvent.change(screen.getByRole('searchbox', { name: /search by title or author/i }), {
      target: { value: 'quiet library' },
    });
    act(() => vi.advanceTimersByTime(250));

    expect(onChange).toHaveBeenCalledWith('quiet library');
  });
});