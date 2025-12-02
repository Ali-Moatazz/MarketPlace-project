import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full p-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default LoadingSpinner;