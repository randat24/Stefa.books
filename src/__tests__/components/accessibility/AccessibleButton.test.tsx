/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleButton, ToggleButton, ButtonGroup } from '@/components/accessibility/AccessibleButton';

describe('AccessibleButton', () => {
  it('should render button with correct text', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AccessibleButton disabled>Disabled button</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should show loading state', () => {
    render(<AccessibleButton loading loadingText="Loading...">Click me</AccessibleButton>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<AccessibleButton variant="primary">Primary</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');

    rerender(<AccessibleButton variant="secondary">Secondary</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-neutral-100');

    rerender(<AccessibleButton variant="outline">Outline</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('border');

    rerender(<AccessibleButton variant="ghost">Ghost</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');

    rerender(<AccessibleButton variant="danger">Danger</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<AccessibleButton size="sm">Small</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<AccessibleButton size="md">Medium</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<AccessibleButton size="lg">Large</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('should render with full width when specified', () => {
    render(<AccessibleButton fullWidth>Full width</AccessibleButton>);
    
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('should render with left and right icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">←</span>;
    const RightIcon = () => <span data-testid="right-icon">→</span>;
    
    render(
      <AccessibleButton leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
        With icons
      </AccessibleButton>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('should have proper focus styles', () => {
    render(<AccessibleButton>Focusable</AccessibleButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-accent');
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<AccessibleButton>Keyboard test</AccessibleButton>);
    
    const button = screen.getByRole('button');
    await user.tab();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    // Button should be clickable with Enter key
  });
});

describe('ToggleButton', () => {
  it('should render unpressed state by default', () => {
    render(
      <ToggleButton
        pressed={false}
        pressedText="Pressed"
        unpressedText="Unpressed"
      />
    );
    
    expect(screen.getByText('Unpressed')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render pressed state when pressed', () => {
    render(
      <ToggleButton
        pressed={true}
        pressedText="Pressed"
        unpressedText="Unpressed"
      />
    );
    
    expect(screen.getByText('Pressed')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should render with icons', () => {
    const PressedIcon = () => <span data-testid="pressed-icon">✓</span>;
    const UnpressedIcon = () => <span data-testid="unpressed-icon">○</span>;
    
    render(
      <ToggleButton
        pressed={false}
        pressedText="Pressed"
        unpressedText="Unpressed"
        pressedIcon={<PressedIcon />}
        unpressedIcon={<UnpressedIcon />}
      />
    );
    
    expect(screen.getByTestId('unpressed-icon')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <ToggleButton
        pressed={false}
        pressedText="Pressed"
        unpressedText="Unpressed"
        onClick={handleClick}
      />
    );
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('ButtonGroup', () => {
  it('should render horizontal group by default', () => {
    render(
      <ButtonGroup>
        <AccessibleButton>Button 1</AccessibleButton>
        <AccessibleButton>Button 2</AccessibleButton>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toHaveClass('flex-row');
  });

  it('should render vertical group when specified', () => {
    render(
      <ButtonGroup orientation="vertical">
        <AccessibleButton>Button 1</AccessibleButton>
        <AccessibleButton>Button 2</AccessibleButton>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toHaveClass('flex-col');
  });

  it('should render as toolbar when specified', () => {
    render(
      <ButtonGroup role="toolbar" ariaLabel="Toolbar">
        <AccessibleButton>Button 1</AccessibleButton>
        <AccessibleButton>Button 2</AccessibleButton>
      </ButtonGroup>
    );
    
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Toolbar');
  });

  it('should apply custom className', () => {
    render(
      <ButtonGroup className="custom-group">
        <AccessibleButton>Button 1</AccessibleButton>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toHaveClass('custom-group');
  });
});
