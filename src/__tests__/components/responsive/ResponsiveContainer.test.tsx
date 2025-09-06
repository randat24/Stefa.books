/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveContainer, useBreakpoint, ResponsiveRender, ResponsiveGrid } from '@/components/responsive/ResponsiveContainer';

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock window.addEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
});
Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
});

describe('ResponsiveContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInnerWidth(1024);
  });

  it('should render children', () => {
    render(
      <ResponsiveContainer>
        <div data-testid="content">Content</div>
      </ResponsiveContainer>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ResponsiveContainer className="custom-class">
        <div data-testid="content">Content</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('content').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('should set data-breakpoint attribute', () => {
    render(
      <ResponsiveContainer>
        <div data-testid="content">Content</div>
      </ResponsiveContainer>
    );

    const container = screen.getByTestId('content').parentElement;
    expect(container).toHaveAttribute('data-breakpoint');
  });

  it('should call onBreakpointChange when breakpoint changes', () => {
    const onBreakpointChange = jest.fn();
    
    render(
      <ResponsiveContainer onBreakpointChange={onBreakpointChange}>
        <div data-testid="content">Content</div>
      </ResponsiveContainer>
    );

    // Simulate window resize
    fireEvent(window, new Event('resize'));
    
    expect(onBreakpointChange).toHaveBeenCalled();
  });
});

describe('useBreakpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct breakpoint for different screen sizes', () => {
    const TestComponent = () => {
      const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
      return (
        <div>
          <div data-testid="breakpoint">{breakpoint}</div>
          <div data-testid="is-mobile">{isMobile.toString()}</div>
          <div data-testid="is-tablet">{isTablet.toString()}</div>
          <div data-testid="is-desktop">{isDesktop.toString()}</div>
        </div>
      );
    };

    // Test mobile
    mockInnerWidth(600);
    const { rerender } = render(<TestComponent />);
    expect(screen.getByTestId('breakpoint')).toHaveTextContent('sm');
    expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
    expect(screen.getByTestId('is-tablet')).toHaveTextContent('false');
    expect(screen.getByTestId('is-desktop')).toHaveTextContent('false');

    // Test tablet
    mockInnerWidth(900);
    rerender(<TestComponent />);
    expect(screen.getByTestId('breakpoint')).toHaveTextContent('md');
    expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
    expect(screen.getByTestId('is-tablet')).toHaveTextContent('true');
    expect(screen.getByTestId('is-desktop')).toHaveTextContent('false');

    // Test desktop
    mockInnerWidth(1200);
    rerender(<TestComponent />);
    expect(screen.getByTestId('breakpoint')).toHaveTextContent('lg');
    expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
    expect(screen.getByTestId('is-tablet')).toHaveTextContent('false');
    expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
  });
});

describe('ResponsiveRender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInnerWidth(1024);
  });

  it('should render children when showOn includes current breakpoint', () => {
    render(
      <ResponsiveRender showOn={['lg', 'xl']}>
        <div data-testid="content">Content</div>
      </ResponsiveRender>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should not render children when showOn does not include current breakpoint', () => {
    render(
      <ResponsiveRender showOn={['xs', 'sm']}>
        <div data-testid="content">Content</div>
      </ResponsiveRender>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should not render children when hideOn includes current breakpoint', () => {
    render(
      <ResponsiveRender hideOn={['lg', 'xl']}>
        <div data-testid="content">Content</div>
      </ResponsiveRender>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should render children when hideOn does not include current breakpoint', () => {
    render(
      <ResponsiveRender hideOn={['xs', 'sm']}>
        <div data-testid="content">Content</div>
      </ResponsiveRender>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ResponsiveRender className="custom-class">
        <div data-testid="content">Content</div>
      </ResponsiveRender>
    );

    const container = screen.getByTestId('content').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});

describe('ResponsiveGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInnerWidth(1024);
  });

  it('should render children in grid', () => {
    render(
      <ResponsiveGrid>
        <div data-testid="item-1">Item 1</div>
        <div data-testid="item-2">Item 2</div>
        <div data-testid="item-3">Item 3</div>
      </ResponsiveGrid>
    );

    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
  });

  it('should apply correct grid columns for different breakpoints', () => {
    const TestComponent = () => {
      const { breakpoint } = useBreakpoint();
      return (
        <ResponsiveGrid
          cols={{
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5
          }}
        >
          <div data-testid="breakpoint">{breakpoint}</div>
        </ResponsiveGrid>
      );
    };

    // Test different breakpoints
    mockInnerWidth(600); // sm
    const { rerender } = render(<TestComponent />);
    let grid = screen.getByTestId('breakpoint').parentElement;
    expect(grid).toHaveClass('grid-cols-2');

    mockInnerWidth(900); // md
    rerender(<TestComponent />);
    grid = screen.getByTestId('breakpoint').parentElement;
    expect(grid).toHaveClass('grid-cols-3');

    mockInnerWidth(1200); // lg
    rerender(<TestComponent />);
    grid = screen.getByTestId('breakpoint').parentElement;
    expect(grid).toHaveClass('grid-cols-4');

    mockInnerWidth(1400); // xl
    rerender(<TestComponent />);
    grid = screen.getByTestId('breakpoint').parentElement;
    expect(grid).toHaveClass('grid-cols-5');
  });

  it('should apply custom gap', () => {
    render(
      <ResponsiveGrid gap="gap-8">
        <div data-testid="item">Item</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('item').parentElement;
    expect(grid).toHaveClass('gap-8');
  });

  it('should apply custom className', () => {
    render(
      <ResponsiveGrid className="custom-grid">
        <div data-testid="item">Item</div>
      </ResponsiveGrid>
    );

    const grid = screen.getByTestId('item').parentElement;
    expect(grid).toHaveClass('custom-grid');
  });
});
