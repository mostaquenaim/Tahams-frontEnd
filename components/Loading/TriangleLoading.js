import React from 'react';

const TriangleLoader = () => {
  return (
    <div className="relative w-24 h-24 bg-black">
      {/* Black Triangle */}
      <div
        className="absolute inset-0 w-full h-full bg-black"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        }}
      ></div>

      {/* Animated White Line */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute w-full h-full border-2 border-transparent border-t-white"
          style={{
            animation: 'triangle-loader 1.5s linear infinite',
          }}
        ></div>
      </div>

      {/* Inline Keyframes for Animation */}
      <style>
        {`
          @keyframes triangle-loader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default TriangleLoader;