import React from 'react';

const SpinnerComp = () => {
    return (
        <div className='h-screen flex items-center text-center justify-center w-full'>
            <span class="loading loading-spinner loading-xs"></span>
            <span class="loading loading-spinner loading-sm"></span>
            <span class="loading loading-spinner loading-md"></span>
            <span class="loading loading-spinner loading-lg"></span>
        </div>
    );
};

export default SpinnerComp;