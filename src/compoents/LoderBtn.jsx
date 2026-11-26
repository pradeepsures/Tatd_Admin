import * as React from 'react';

// Small inline spinner used inside buttons — inherits the button's text colour
export default function CircularSize() {
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent opacity-90"
      style={{ animation: 'spin-slow 0.7s linear infinite' }}
      role="status"
      aria-label="Loading"
    />
  );
}
