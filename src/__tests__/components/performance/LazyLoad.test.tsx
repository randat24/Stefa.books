/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LazyLoad, LazyImage, LazyList } from '@/components/performance/LazyLoad';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LazyLoad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when visible', async () => {
    const { rerender } = mockIntersectionObserver.mock.calls[0][0];
    
    render(
      <LazyLoad>
        <div data-testid="lazy-content">Lazy content</div>
      </LazyLoad>
    );

    // Simulate intersection
    rerender([
      {
        isIntersecting: true,
        target: document.createElement('div')
      }
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('lazy-content')).toBeInTheDocument();
    });
  });

  it('should show fallback while loading', () => {
    render(
      <LazyLoad fallback={<div data-testid="fallback">Loading...</div>}>
        <div data-testid="lazy-content">Lazy content</div>
      </LazyLoad>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('should show placeholder when not visible', () => {
    render(
      <LazyLoad placeholder={<div data-testid="placeholder">Placeholder</div>}>
        <div data-testid="lazy-content">Lazy content</div>
      </LazyLoad>
    );

    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <LazyLoad className="custom-class">
        <div data-testid="lazy-content">Lazy content</div>
      </LazyLoad>
    );

    const container = screen.getByTestId('lazy-content').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('should handle delay prop', async () => {
    const { rerender } = mockIntersectionObserver.mock.calls[0][0];
    
    render(
      <LazyLoad delay={100}>
        <div data-testid="lazy-content">Lazy content</div>
      </LazyLoad>
    );

    // Simulate intersection
    rerender([
      {
        isIntersecting: true,
        target: document.createElement('div')
      }
    ]);

    // Content should not be visible immediately due to delay
    expect(screen.queryByTestId('lazy-content')).not.toBeInTheDocument();

    // Wait for delay
    await waitFor(() => {
      expect(screen.getByTestId('lazy-content')).toBeInTheDocument();
    }, { timeout: 200 });
  });
});

describe('LazyImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render image with correct attributes', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('width', '300');
    expect(image).toHaveAttribute('height', '200');
  });

  it('should show placeholder while loading', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        placeholder="/placeholder.jpg"
      />
    );

    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });

  it('should handle image load events', async () => {
    const handleLoad = jest.fn();
    
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        onLoad={handleLoad}
      />
    );

    const image = screen.getByAltText('Test image');
    fireEvent.load(image);

    expect(handleLoad).toHaveBeenCalled();
  });

  it('should handle image error events', async () => {
    const handleError = jest.fn();
    
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        onError={handleError}
        fallbackSrc="/fallback.jpg"
      />
    );

    const image = screen.getByAltText('Test image');
    fireEvent.error(image);

    expect(handleError).toHaveBeenCalled();
  });

  it('should show fallback image on error', async () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        fallbackSrc="/fallback.jpg"
      />
    );

    const image = screen.getByAltText('Test image');
    fireEvent.error(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', '/fallback.jpg');
    });
  });

  it('should render with priority when specified', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        priority={true}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });
});

describe('LazyList', () => {
  const mockItems = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: i * 10
  }));

  const renderItem = (item: typeof mockItems[0], index: number) => (
    <div key={item.id} data-testid={`item-${item.id}`}>
      {item.name} - {item.value}
    </div>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render initial batch of items', () => {
    render(
      <LazyList
        items={mockItems}
        renderItem={renderItem}
        batchSize={10}
      />
    );

    // Should render first 10 items
    for (let i = 0; i < 10; i++) {
      expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument();
    }

    // Should not render items beyond batch size
    expect(screen.queryByTestId('item-10')).not.toBeInTheDocument();
  });

  it('should load more items when scrolling', async () => {
    const { rerender } = mockIntersectionObserver.mock.calls[0][0];
    
    render(
      <LazyList
        items={mockItems}
        renderItem={renderItem}
        batchSize={10}
      />
    );

    // Simulate intersection with load more trigger
    rerender([
      {
        isIntersecting: true,
        target: document.createElement('div')
      }
    ]);

    await waitFor(() => {
      // Should now render first 20 items
      expect(screen.getByTestId('item-19')).toBeInTheDocument();
    });
  });

  it('should show loading indicator while loading more', async () => {
    const { rerender } = mockIntersectionObserver.mock.calls[0][0];
    
    render(
      <LazyList
        items={mockItems}
        renderItem={renderItem}
        batchSize={10}
      />
    );

    // Simulate intersection
    rerender([
      {
        isIntersecting: true,
        target: document.createElement('div')
      }
    ]);

    // Should show loading indicator
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('should not show load more when all items are loaded', () => {
    const smallItems = mockItems.slice(0, 5);
    
    render(
      <LazyList
        items={smallItems}
        renderItem={renderItem}
        batchSize={10}
      />
    );

    // Should not show load more button
    expect(screen.queryByText('Завантаження...')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <LazyList
        items={mockItems}
        renderItem={renderItem}
        className="custom-list"
      />
    );

    const list = screen.getByTestId('item-0').parentElement;
    expect(list).toHaveClass('custom-list');
  });

  it('should use custom placeholder', () => {
    render(
      <LazyList
        items={mockItems}
        renderItem={renderItem}
        placeholder={<div data-testid="custom-placeholder">Custom loading...</div>}
      />
    );

    expect(screen.getByTestId('custom-placeholder')).toBeInTheDocument();
  });
});
