/**
 * ErrorNotice Component
 * 
 * A reusable error/warning/info notification component with support for inline and toast variants.
 * 
 * Usage:
 * - Use `variant="inline"` (default) for contextual errors within forms or sections
 * - Use `variant="toast"` for non-blocking notifications that appear at the top-right
 * - Use `severity="error"` (default) for error messages
 * - Use `severity="warning"` for warning messages
 * - Use `severity="info"` for informational messages
 * - Provide `onRetry` callback to show a retry button
 * - Provide `onDismiss` callback to show a dismiss (×) button
 * 
 * Examples:
 * ```tsx
 * // Inline error with retry
 * <ErrorNotice
 *   title="Failed to load data"
 *   message="Unable to fetch characters from the server."
 *   severity="error"
 *   variant="inline"
 *   onRetry={() => refetch()}
 * />
 * 
 * // Toast warning with dismiss
 * <ErrorNotice
 *   title="Session expiring soon"
 *   message="Your session will expire in 5 minutes."
 *   severity="warning"
 *   variant="toast"
 *   onDismiss={() => setShowWarning(false)}
 * />
 * 
 * // Info message
 * <ErrorNotice
 *   title="Maintenance scheduled"
 *   message="The service will be unavailable tomorrow from 2-4 AM."
 *   severity="info"
 * />
 * ```
 */

import React, { useEffect, useRef, useId } from 'react';

export interface ErrorNoticeProps {
  /** Title/heading of the notice */
  title: string;
  /** Detailed error message or description */
  message: string;
  /** Severity level affecting color scheme */
  severity?: 'error' | 'warning' | 'info';
  /** Display variant: inline within content or toast overlay */
  variant?: 'inline' | 'toast';
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Custom CSS class name */
  className?: string;
  /** Auto-dismiss after milliseconds (only for toast variant) */
  autoDismissMs?: number;
}

const ErrorNotice: React.FC<ErrorNoticeProps> = ({
  title,
  message,
  severity = 'error',
  variant = 'inline',
  onRetry,
  onDismiss,
  className = '',
  autoDismissMs,
}) => {
  const timeoutRef = useRef<number | null>(null);
  const savedOnDismiss = useRef(onDismiss);

  useEffect(() => {
    savedOnDismiss.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (variant === 'toast' && autoDismissMs && savedOnDismiss.current) {
      timeoutRef.current = window.setTimeout(() => {
        savedOnDismiss.current?.();
      }, autoDismissMs);
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [variant, autoDismissMs]);

  const classes = ['error-notice', severity, variant, className].filter(Boolean).join(' ');

  const ariaRole = severity === 'error' ? 'alert' : 'status';
  const ariaLive = severity === 'error' ? 'assertive' : 'polite';

  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const titleId = `error-notice-title-${uniqueId}`;
  const descId = `error-notice-desc-${uniqueId}`;

  return (
    <div
      className={classes}
      role={ariaRole}
      aria-live={ariaLive}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="error-notice-header">
        <div className="error-notice-content">
          <div className="error-notice-title" id={titleId}>
            {title}
          </div>
          <div className="error-notice-message" id={descId}>
            {message}
          </div>
        </div>
        {onDismiss && (
          <button
            className="error-notice-close"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            type="button"
          >
            ×
          </button>
        )}
      </div>
      {onRetry && (
        <div className="error-notice-actions">
          <button className="error-notice-button retry" onClick={onRetry} type="button">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorNotice;
