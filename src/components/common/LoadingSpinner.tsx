/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with configurable sizes and accessibility support.
 * 
 * Usage:
 * - Use `size="small"` for inline/button-level loading states
 * - Use `size="medium"` (default) for section/card loading states
 * - Use `size="large"` for full-page loading states
 * - Use `fullscreen={true}` to overlay the entire viewport
 * 
 * Examples:
 * ```tsx
 * // Inline spinner with label
 * <LoadingSpinner size="small" label="Loading..." />
 * 
 * // Medium spinner (default)
 * <LoadingSpinner />
 * 
 * // Full-screen overlay
 * <LoadingSpinner size="large" fullscreen={true} label="Loading application..." />
 * ```
 */

import React from 'react';

export interface LoadingSpinnerProps {
  /** Size variant of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Optional label to display next to spinner */
  label?: string;
  /** Whether to display as full-screen overlay */
  fullscreen?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Accessible label for screen readers (defaults to "Loading") */
  ariaLabel?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  label,
  fullscreen = false,
  className = '',
  ariaLabel = 'Loading',
}) => {
  const wrapperClasses = [
    'loading-spinner-wrapper',
    fullscreen && 'fullscreen',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerClasses = ['loading-spinner-ring', size].join(' ');

  return (
    <div className={wrapperClasses} role="status" aria-live="polite" aria-label={ariaLabel}>
      <div className={spinnerClasses} aria-hidden="true" />
      {label && <span className="loading-spinner-label">{label}</span>}
      {!label && <span className="sr-only">{ariaLabel}</span>}
    </div>
  );
};

export default LoadingSpinner;
