import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ErrorNotice from '../ErrorNotice';

describe('ErrorNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required props', () => {
    render(<ErrorNotice title="Error" message="Something went wrong" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders error severity by default', () => {
    const { container } = render(<ErrorNotice title="Error" message="Test error" />);
    const notice = container.querySelector('.error-notice.error');
    expect(notice).toBeInTheDocument();
  });

  it('renders warning severity', () => {
    const { container } = render(
      <ErrorNotice title="Warning" message="Test warning" severity="warning" />
    );
    const notice = container.querySelector('.error-notice.warning');
    expect(notice).toBeInTheDocument();
  });

  it('renders info severity', () => {
    const { container } = render(
      <ErrorNotice title="Info" message="Test info" severity="info" />
    );
    const notice = container.querySelector('.error-notice.info');
    expect(notice).toBeInTheDocument();
  });

  it('renders inline variant by default', () => {
    const { container } = render(<ErrorNotice title="Error" message="Test" />);
    const notice = container.querySelector('.error-notice.inline');
    expect(notice).toBeInTheDocument();
  });

  it('renders toast variant', () => {
    const { container } = render(
      <ErrorNotice title="Error" message="Test" variant="toast" />
    );
    const notice = container.querySelector('.error-notice.toast');
    expect(notice).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorNotice title="Error" message="Test" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorNotice title="Error" message="Test" />);
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorNotice title="Error" message="Test" onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorNotice title="Error" message="Test" />);
    expect(
      screen.queryByRole('button', { name: /dismiss notification/i })
    ).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ErrorNotice title="Error" message="Test" className="custom-error" />
    );
    const notice = container.querySelector('.error-notice.custom-error');
    expect(notice).toBeInTheDocument();
  });

  it('has proper accessibility role for error', () => {
    const { container } = render(
      <ErrorNotice title="Error" message="Test" severity="error" />
    );
    const notice = container.querySelector('[role="alert"]');
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveAttribute('aria-live', 'assertive');
  });

  it('has proper accessibility role for warning', () => {
    const { container } = render(
      <ErrorNotice title="Warning" message="Test" severity="warning" />
    );
    const notice = container.querySelector('[role="status"]');
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveAttribute('aria-live', 'polite');
  });

  it('has proper accessibility role for info', () => {
    const { container } = render(
      <ErrorNotice title="Info" message="Test" severity="info" />
    );
    const notice = container.querySelector('[role="status"]');
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveAttribute('aria-live', 'polite');
  });

  it('has proper aria-labelledby and aria-describedby', () => {
    const { container } = render(<ErrorNotice title="Error" message="Test message" />);
    const notice = container.querySelector('.error-notice');
    const labelledBy = notice?.getAttribute('aria-labelledby');
    const describedBy = notice?.getAttribute('aria-describedby');

    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Error')).toHaveAttribute('id', labelledBy!);
    expect(screen.getByText('Test message')).toHaveAttribute('id', describedBy!);
  });

  it('auto-dismisses after specified time for toast variant', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <ErrorNotice
        title="Info"
        message="Test"
        variant="toast"
        onDismiss={onDismiss}
        autoDismissMs={3000}
      />
    );

    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(onDismiss).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('does not auto-dismiss for inline variant', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <ErrorNotice
        title="Info"
        message="Test"
        variant="inline"
        onDismiss={onDismiss}
        autoDismissMs={3000}
      />
    );

    vi.advanceTimersByTime(3000);

    expect(onDismiss).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('clears timeout on unmount', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    const { unmount } = render(
      <ErrorNotice
        title="Info"
        message="Test"
        variant="toast"
        onDismiss={onDismiss}
        autoDismissMs={3000}
      />
    );

    unmount();
    vi.advanceTimersByTime(3000);

    expect(onDismiss).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
