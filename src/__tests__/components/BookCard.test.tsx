/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookCard from '@/components/BookCard';
import type { Book } from '@/lib/supabase';
import * as recentViews from '@/lib/recentViews';

// Mock next/image
jest.mock('next/image', () => {
  return function MockedImage({ src, alt, ...props }: any) {
    return <div data-testid="mocked-image" data-src={src} data-alt={alt} {...props} />;
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

const mockUnavailableBook: Book = {
  ...mockBook,
  id: 'unavailable-book',
  available: false,
};

describe('BookCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render book information correctly', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('Test Book Title')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('This is a test book description')).toBeInTheDocument();
    expect(screen.getByText('299 ₴')).toBeInTheDocument();
  });

  it('should render book cover image', () => {
    render(<BookCard book={mockBook} />);

    const image = screen.getByAltText('Test Book Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-cover.jpg');
  });

  it('should show available status for available books', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('Доступна')).toBeInTheDocument();
    expect(screen.getByText('Доступна')).toHaveClass('bg-green-500');
  });

  it('should show unavailable status for unavailable books', () => {
    render(<BookCard book={mockUnavailableBook} />);

    expect(screen.getByText('Недоступна')).toBeInTheDocument();
    expect(screen.getByText('Недоступна')).toHaveClass('bg-red-500');
  });

  it('should handle click events and add to recent views', async () => {
    const user = userEvent.setup();
    render(<BookCard book={mockBook} />);

    const bookCard = screen.getByRole('button');
    await user.click(bookCard);

    expect(recentViews.addToRecentViews).toHaveBeenCalledWith('test-book-1');
  });

  it('should apply hover effects', async () => {
    const user = userEvent.setup();
    render(<BookCard book={mockBook} />);

    const bookCard = screen.getByRole('button');
    
    await user.hover(bookCard);
    expect(bookCard).toHaveClass('hover:shadow-lg');
  });

  it('should handle keyboard interactions', async () => {
    const user = userEvent.setup();
    render(<BookCard book={mockBook} />);

    const bookCard = screen.getByRole('button');
    await user.tab();
    expect(bookCard).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(recentViews.addToRecentViews).toHaveBeenCalledWith('test-book-1');
  });

  it('should handle missing optional fields gracefully', () => {
    const bookWithoutShort: Book = {
      ...mockBook,
      short_description: null,
    };

    render(<BookCard book={bookWithoutShort} />);

    expect(screen.getByText('Test Book Title')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    // Should not crash without short description
  });

  it('should handle missing price gracefully', () => {
    const bookWithoutPrice: Book = {
      ...mockBook,
      price_uah: null,
    };

    render(<BookCard book={bookWithoutPrice} />);

    expect(screen.getByText('Test Book Title')).toBeInTheDocument();
    // Should render without price or show placeholder
  });

  it('should apply custom className when provided', () => {
    render(<div className="custom-class"><BookCard book={mockBook} /></div>);

    const bookCard = screen.getByRole('button');
    expect(bookCard).toHaveClass('custom-class');
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<BookCard book={mockBook} />);

      const bookCard = screen.getByRole('button');
      expect(bookCard).toHaveAttribute('aria-label', expect.stringContaining('Test Book Title'));
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <>
          <BookCard book={mockBook} />
          <BookCard book={mockUnavailableBook} />
        </>
      );

      await user.tab();
      expect(screen.getAllByRole('button')[0]).toHaveFocus();

      await user.tab();
      expect(screen.getAllByRole('button')[1]).toHaveFocus();
    });

    it('should have proper image alt text', () => {
      render(<BookCard book={mockBook} />);

      const image = screen.getByAltText('Test Book Title');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle missing book data gracefully', () => {
      const incompleteBook = {
        id: 'incomplete',
        code: 'test',
        title: '',
        author: '',
        category: '',
        subcategory: null,
        description: null,
        short_description: null,
        isbn: null,
        pages: null,
        age_range: null,
        language: null,
        publisher: null,
        publication_year: null,
        cover_url: null,
        status: 'available',
        available: true,
        qty_total: 1,
        qty_available: 1,
        price_uah: null,
        full_price_uah: null,
        location: null,
        rating: null,
        rating_count: null,
        badges: null,
        tags: null,
        search_vector: null,
        search_text: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      } as Book;

      expect(() => render(<BookCard book={incompleteBook} />)).not.toThrow();
    });

    it('should handle recentViews errors gracefully', async () => {
      const mockError = jest.spyOn(recentViews, 'addToRecentViews')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const user = userEvent.setup();
      render(<BookCard book={mockBook} />);

      const bookCard = screen.getByRole('button');
      
      // Should not crash even if addToRecentViews throws
      await expect(user.click(bookCard)).resolves.not.toThrow();
      
      mockError.mockRestore();
    });
  });

  describe('Visual states', () => {
    it('should show loading state for image', () => {
      render(<BookCard book={mockBook} />);

      // Check that image container has proper classes for loading
      const imageContainer = screen.getByAltText('Test Book Title').closest('div');
      expect(imageContainer).toHaveClass('bg-neutral-100');
    });

    it('should handle long titles gracefully', () => {
      const bookWithLongTitle: Book = {
        ...mockBook,
        title: 'This is a very long book title that should be handled gracefully by the component layout',
      };

      render(<BookCard book={bookWithLongTitle} />);

      const title = screen.getByText(bookWithLongTitle.title);
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('line-clamp-2'); // Should truncate long titles
    });

    it('should handle long descriptions gracefully', () => {
      const bookWithLongDescription: Book = {
        ...mockBook,
        short_description: 'This is a very long book description that should be truncated properly to maintain consistent card heights and good visual hierarchy',
      };

      render(<BookCard book={bookWithLongDescription} />);

      const description = screen.getByText(bookWithLongDescription.short_description!);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('line-clamp-2');
    });
  });
});