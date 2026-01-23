/**
 * Skeleton Component
 * 
 * A reusable skeleton loading component for creating placeholder UI while content loads.
 * Provides a better UX than spinners when the layout structure is known.
 * 
 * Usage:
 * - Use `variant="text"` for single line text placeholders
 * - Use `variant="title"` for heading placeholders (larger height)
 * - Use `variant="avatar"` for circular profile picture placeholders
 * - Use `variant="rectangle"` for image or card placeholders
 * - Use `variant="rounded"` for rounded card placeholders
 * 
 * Examples:
 * ```tsx
 * // Text line skeleton
 * <Skeleton variant="text" width="80%" />
 * 
 * // Avatar skeleton
 * <Skeleton variant="avatar" width={40} height={40} />
 * 
 * // Card placeholder
 * <Skeleton variant="rounded" width="100%" height={200} />
 * 
 * // Multiple lines
 * <div>
 *   <Skeleton variant="title" />
 *   <Skeleton variant="text" />
 *   <Skeleton variant="text" width="60%" />
 * </div>
 * ```
 */

import React from 'react';

export interface SkeletonProps {
  /** Visual variant of the skeleton */
  variant?: 'text' | 'title' | 'avatar' | 'rectangle' | 'rounded';
  /** Width of the skeleton (number in px or string with unit) */
  width?: number | string;
  /** Height of the skeleton (number in px or string with unit) */
  height?: number | string;
  /** Custom CSS class name */
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const classes = ['skeleton', variant, className].filter(Boolean).join(' ');

  const formatDimension = (value: number | string | undefined) => {
    if (value === undefined) return undefined;
    return typeof value === 'number' ? `${value}px` : value;
  };

  const style: React.CSSProperties = {
    width: formatDimension(width),
    height: formatDimension(height),
  };

  return (
    <div
      className={classes}
      style={style}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Skeleton;
