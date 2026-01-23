/**
 * Component Demo Page
 * 
 * A demonstration page showcasing the common components.
 * This page is for development/documentation purposes only.
 */

import { useState } from 'react';
import { LoadingSpinner, Skeleton, ErrorNotice } from '@/components';

export default function ComponentDemoPage() {
  const [showToast, setShowToast] = useState(false);
  const [showInlineError, setShowInlineError] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Common Components Demo</h1>
      <p>This page demonstrates the reusable UI components available in the application.</p>

      {/* Loading Spinner Section */}
      <section style={{ marginTop: '3rem' }}>
        <h2>LoadingSpinner</h2>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div>
            <h3>Small</h3>
            <LoadingSpinner size="small" label="Loading..." />
          </div>
          <div>
            <h3>Medium (default)</h3>
            <LoadingSpinner />
          </div>
          <div>
            <h3>Large</h3>
            <LoadingSpinner size="large" label="Loading application..." />
          </div>
        </div>
      </section>

      {/* Skeleton Section */}
      <section style={{ marginTop: '3rem' }}>
        <h2>Skeleton</h2>
        <div style={{ marginTop: '1rem' }}>
          <h3>Text Lines</h3>
          <div style={{ maxWidth: '600px' }}>
            <Skeleton variant="title" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h3>Avatar</h3>
            <Skeleton variant="avatar" width={60} height={60} />
          </div>
          <div>
            <h3>Rectangle Card</h3>
            <Skeleton variant="rounded" width={300} height={200} />
          </div>
        </div>
      </section>

      {/* ErrorNotice Section */}
      <section style={{ marginTop: '3rem' }}>
        <h2>ErrorNotice</h2>

        <div style={{ marginTop: '1rem' }}>
          <h3>Inline Variants</h3>
          {showInlineError && (
            <ErrorNotice
              title="Connection Error"
              message="Unable to connect to the server. Please check your internet connection and try again."
              severity="error"
              variant="inline"
              onRetry={handleRetry}
              onDismiss={() => setShowInlineError(false)}
            />
          )}
          {!showInlineError && (
            <button
              onClick={() => setShowInlineError(true)}
              style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}
            >
              Show Error
            </button>
          )}
          {retryCount > 0 && <p>Retry count: {retryCount}</p>}

          <ErrorNotice
            title="Session Warning"
            message="Your session will expire in 10 minutes. Please save your work."
            severity="warning"
            variant="inline"
          />

          <ErrorNotice
            title="New Feature Available"
            message="We've added new character customization options. Check them out!"
            severity="info"
            variant="inline"
          />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Toast Notification</h3>
          <button
            onClick={() => setShowToast(true)}
            style={{ padding: '0.5rem 1rem' }}
          >
            Show Toast
          </button>
          {showToast && (
            <ErrorNotice
              title="Success!"
              message="Your changes have been saved successfully."
              severity="info"
              variant="toast"
              onDismiss={() => setShowToast(false)}
              autoDismissMs={5000}
            />
          )}
        </div>
      </section>

      {/* Usage Example */}
      <section style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Usage Example</h2>
        <pre style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`import { LoadingSpinner, Skeleton, ErrorNotice } from '@/components';

// Show loading spinner while fetching
{isLoading && <LoadingSpinner size="large" label="Loading characters..." />}

// Show skeleton placeholder
{isLoading && (
  <div>
    <Skeleton variant="title" />
    <Skeleton variant="text" />
    <Skeleton variant="text" width="80%" />
  </div>
)}

// Show error notice
{error && (
  <ErrorNotice
    title="Failed to load"
    message={error.message}
    severity="error"
    onRetry={refetch}
  />
)}`}
        </pre>
      </section>
    </div>
  );
}
