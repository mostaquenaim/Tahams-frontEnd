import React from 'react';

const TestNavbar = () => {
    return (
        <div className="relative">
            <div className="absolute top-0 left-0 right-0 z-20 bg-gray-900 text-white p-4">
                Part 1 (Initially visible)
            </div>
            <div className="bg-gray-800 text-white p-4 z-10 fixed w-full top-0">
                Part 2 (Fixed while scrolling)
            </div>
        </div>
    );
};

export default TestNavbar;
