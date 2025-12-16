import React from 'react';

const StaticPage = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <div className="text-gray-700 space-y-4">
            {children || (
              <p>
                Content for this page will be added soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
