import React from 'react';

const Loader = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center" role="status" aria-label="Loading">
    <span
      className="h-7 w-7 rounded-full border-2 border-gray-200 border-t-gray-800"
      style={{ animation: 'spin-slow 0.75s linear infinite' }}
    />
  </div>
);

export default Loader;
