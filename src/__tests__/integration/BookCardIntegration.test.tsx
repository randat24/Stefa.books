/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookCard from '@/components/BookCard';
import { DevAccessibilityChecker } from '@/components/accessibility/AccessibilityStatus';
import type { Book } from '@/lib/supabase';

// Mock next/image
jest.mock('next/image', () => {
  return function MockedImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock recentViews
jest.mock('@/lib/recentViews', () => ({
  addToRecentViews: jest.fn(),
}));

const mockBook: Book = {
  id: 'test-book-1',
  code: 'TEST-001',
  title: 'Test Book Title',
  author: 'Test Author',
  category: 'Test Category',
  subcategory: null,
  description: null,
  short_description: 'This is a test book description',
  isbn: null,
  pages: null,
  age_range: null,
  language: null,
  publisher: null,
  publication_year: null,
  cover_url: '/test-cover.jpg',
  status: 'available',
  available: true,
  qty_total: 1,
  qty_available: 1,
  price_uah: 299,
  full_price_uah: null,
  location: null,
  rating: null,
  rating_count: null,
  badges: null,
  tags: null,
  search_vector: null,
  search_text: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('BookCard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with accessibility checker in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    expect(screen.getByText('Test Book Title')).toBeInTheDocument();
    expect(screen.getByText('Доступність:')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not render accessibility checker in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    expect(screen.getByText('Test Book Title')).toBeInTheDocument();
    expect(screen.queryByText('Доступність:')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle keyboard navigation with accessibility features', async () => {
    const user = userEvent.setup();
    
    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    const bookCard = screen.getByRole('button');
    
    // Test tab navigation
    await user.tab();
    expect(bookCard).toHaveFocus();
    
    // Test Enter key
    await user.keyboard('{Enter}');
    expect(bookCard).toHaveAttribute('aria-label', expect.stringContaining('Test Book Title'));
    
    // Test Space key
    await user.keyboard(' ');
    // Should handle space key press
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    const bookCard = screen.getByRole('button');
    
    // Check ARIA attributes
    expect(bookCard).toHaveAttribute('aria-label');
    expect(bookCard).toHaveAttribute('tabIndex', '0');
    
    // Check image alt text
    const image = screen.getByAltText('Test Book Title');
    expect(image).toBeInTheDocument();
  });

  it('should handle hover states with accessibility', async () => {
    const user = userEvent.setup();
    
    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    const bookCard = screen.getByRole('button');
    
    // Test hover
    await user.hover(bookCard);
    expect(bookCard).toHaveClass('group');
    
    // Test unhover
    await user.unhover(bookCard);
  });

  it('should handle focus states with accessibility', async () => {
    const user = userEvent.setup();
    
    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    const bookCard = screen.getByRole('button');
    
    // Test focus
    await user.tab();
    expect(bookCard).toHaveFocus();
    expect(bookCard).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-brand-yellow');
  });

  it('should handle error states gracefully', () => {
    const bookWithError = {
      ...mockBook,
      cover_url: null,
      title: '',
      author: ''
    };

    render(
      <DevAccessibilityChecker>
        <BookCard book={bookWithError} />
      </DevAccessibilityChecker>
    );

    // Should not crash with missing data
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle loading states', () => {
    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} priorityLoading={true} />
      </DevAccessibilityChecker>
    );

    const image = screen.getByAltText('Test Book Title');
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('should handle different book states', () => {
    const unavailableBook = {
      ...mockBook,
      available: false
    };

    render(
      <DevAccessibilityChecker>
        <BookCard book={unavailableBook} />
      </DevAccessibilityChecker>
    );

    expect(screen.getByText('Недоступна')).toBeInTheDocument();
  });

  it('should handle long content gracefully', () => {
    const bookWithLongContent = {
      ...mockBook,
      title: 'This is a very long book title that should be handled gracefully by the component layout and accessibility features',
      short_description: 'This is a very long book description that should be truncated properly to maintain consistent card heights and good visual hierarchy while maintaining accessibility'
    };

    render(
      <DevAccessibilityChecker>
        <BookCard book={bookWithLongContent} />
      </DevAccessibilityChecker>
    );

    const title = screen.getByText(bookWithLongContent.title);
    expect(title).toHaveClass('line-clamp-2');
  });

  it('should maintain accessibility with custom props', () => {
    render(
      <DevAccessibilityChecker>
        <BookCard 
          book={mockBook} 
          showActions={false}
          priorityLoading={true}
        />
      </DevAccessibilityChecker>
    );

    const bookCard = screen.getByRole('button');
    expect(bookCard).toBeInTheDocument();
    
    // Should not show action buttons when showActions is false
    expect(screen.queryByLabelText(/Додати в обране/)).not.toBeInTheDocument();
  });

  it('should handle click events with accessibility', async () => {
    const user = userEvent.setup();
    
    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    const bookCard = screen.getByRole('button');
    
    // Test click
    await user.click(bookCard);
    
    // Should handle click without errors
    expect(bookCard).toBeInTheDocument();
  });

  it('should handle keyboard events with accessibility', async () => {
    const user = userEvent.setup();
    
    render(
      <DevAccessibilityChecker>
        <BookCard book={mockBook} />
      </DevAccessibilityChecker>
    );

    const bookCard = screen.getByRole('button');
    
    // Test various keyboard events
    await user.tab();
    expect(bookCard).toHaveFocus();
    
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.keyboard('{Escape}');
    
    // Should handle all keyboard events without errors
    expect(bookCard).toBeInTheDocument();
  });
});
