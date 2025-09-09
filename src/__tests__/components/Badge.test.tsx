/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('should render with default props', () => {
    render(<Badge>Test Badge</Badge>);
    
    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-2xl');
  });

  it('should apply default variant styling', () => {
    render(<Badge>Default Badge</Badge>);
    
    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass('bg-neutral-100', 'text-neutral-800');
  });

  it('should apply secondary variant styling', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    
    const badge = screen.getByText('Secondary Badge');
    expect(badge).toHaveClass('bg-neutral-800', 'text-neutral-50');
  });

  it('should apply destructive variant styling', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    
    const badge = screen.getByText('Destructive Badge');
    expect(badge).toHaveClass('bg-red-500', 'text-neutral-50');
  });

  it('should apply outline variant styling', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    
    const badge = screen.getByText('Outline Badge');
    expect(badge).toHaveClass('border', 'border-neutral-200', 'bg-transparent');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    
    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('should merge custom className with default classes', () => {
    render(<Badge className="text-h4">Large Badge</Badge>);
    
    const badge = screen.getByText('Large Badge');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'text-xl');
  });

  it('should forward additional props', () => {
    render(<Badge data-testid="test-badge" title="Test Title">Badge</Badge>);
    
    const badge = screen.getByTestId('test-badge');
    expect(badge).toHaveAttribute('title', 'Test Title');
  });

  it('should render children correctly', () => {
    render(
      <Badge>
        <span>Icon</span>
        Badge Text
      </Badge>
    );
    
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<Badge />);
    
    const badge = screen.getByRole('generic'); // div element
    expect(badge).toBeInTheDocument();
    expect(badge).toBeEmptyDOMElement();
  });

  describe('Accessibility', () => {
    it('should be accessible by default', () => {
      render(<Badge>Accessible Badge</Badge>);
      
      const badge = screen.getByText('Accessible Badge');
      expect(badge).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(
        <Badge 
          aria-label="Status badge" 
          role="status"
        >
          Active
        </Badge>
      );
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });
  });

  describe('Variant combinations', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const;
    
    variants.forEach((variant) => {
      it(`should render ${variant} variant without errors`, () => {
        render(<Badge variant={variant}>{variant} Badge</Badge>);
        
        const badge = screen.getByText(`${variant} Badge`);
        expect(badge).toBeInTheDocument();
      });
    });
  });
});