import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('skeleton', 'text');
  });

  it('renders text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('.skeleton.text');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders title variant', () => {
    const { container } = render(<Skeleton variant="title" />);
    const skeleton = container.querySelector('.skeleton.title');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders avatar variant', () => {
    const { container } = render(<Skeleton variant="avatar" />);
    const skeleton = container.querySelector('.skeleton.avatar');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders rectangle variant', () => {
    const { container } = render(<Skeleton variant="rectangle" />);
    const skeleton = container.querySelector('.skeleton.rectangle');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders rounded variant', () => {
    const { container } = render(<Skeleton variant="rounded" />);
    const skeleton = container.querySelector('.skeleton.rounded');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies custom width as number', () => {
    render(<Skeleton width={200} />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('applies custom width as string', () => {
    render(<Skeleton width="50%" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ width: '50%' });
  });

  it('applies custom height as number', () => {
    render(<Skeleton height={100} />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ height: '100px' });
  });

  it('applies custom height as string', () => {
    render(<Skeleton height="10rem" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ height: '10rem' });
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    const skeleton = container.querySelector('.skeleton.custom-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
  });

  it('includes screen reader text', () => {
    render(<Skeleton />);
    const srText = screen.getByText('Loading...');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });
});
