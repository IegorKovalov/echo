import React from 'react';

const EmptyState = ({ message }) => {
  return (
    <div className="text-center p-4 text-gray-500">
      <p>{message || "No data available."}</p>
    </div>
  );
};

export default EmptyState; 