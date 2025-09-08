import React from 'react';

const Notfound = () => {
  return (
    <div className="min-h-screen flex flex-col gap-4 justify-center items-center">
      <h1 className="text-4xl font-extrabold">404 - Page Not Found</h1>
      <p className="text-gray-500">
        The page you are looking for doesn't exist.
      </p>
    </div>
  );
};

export default Notfound;
