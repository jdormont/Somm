import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { ErrorBoundary, ErrorBoundaryFallback } from '../ErrorBoundary';

const Bomb = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Kaboom!');
  }
  return <div>Safe Component</div>;
};

describe('ErrorBoundary', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Component')).toBeInTheDocument();
  });

  it('catches render errors and renders default fallback UI', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/i)).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('catches render errors and renders custom fallback UI', () => {
    const customFallback = <div>Custom Error State</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error State')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('ErrorBoundaryFallback renders custom message and title', () => {
    render(
      <ErrorBoundaryFallback
        title="Custom Scanner Error"
        message="Your cellar history is completely safe."
      />
    );

    expect(screen.getByText('Custom Scanner Error')).toBeInTheDocument();
    expect(screen.getByText('Your cellar history is completely safe.')).toBeInTheDocument();
  });
});
