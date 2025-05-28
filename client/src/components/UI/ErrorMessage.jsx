import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="text-center p-4 text-red-500 bg-red-100 border border-red-400 rounded">
      <p>{message || "An error occurred."}</p>
    </div>
  );
};

export default ErrorMessage; 