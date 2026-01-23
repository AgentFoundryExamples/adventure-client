import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with custom aria label', () => {
    render(<LoadingSpinner ariaLabel="Loading characters" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading characters');
  });

  it('renders with visible label', () => {
    render(<LoadingSpinner label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders small size variant', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinnerRing = container.querySelector('.loading-spinner-ring.small');
    expect(spinnerRing).toBeInTheDocument();
  });

  it('renders medium size variant by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerRing = container.querySelector('.loading-spinner-ring.medium');
    expect(spinnerRing).toBeInTheDocument();
  });

  it('renders large size variant', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinnerRing = container.querySelector('.loading-spinner-ring.large');
    expect(spinnerRing).toBeInTheDocument();
  });

  it('renders fullscreen overlay when fullscreen is true', () => {
    const { container } = render(<LoadingSpinner fullscreen={true} />);
    const wrapper = container.querySelector('.loading-spinner-wrapper.fullscreen');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const wrapper = container.querySelector('.loading-spinner-wrapper.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('hides spinner ring from screen readers', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerRing = container.querySelector('.loading-spinner-ring');
    expect(spinnerRing).toHaveAttribute('aria-hidden', 'true');
  });
});
