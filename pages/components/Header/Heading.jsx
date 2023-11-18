import React from 'react';

const Heading = ({first='', second=''}) => {
    return (
        <div className="text-center font-semibold pb-5 bg-black text-white text-opacity-80">
            {/* SHOP BY */}
            <br></br>
            <span className="text-2xl md:text-4xl lg:text-6xl font-extrabold">
                <span className='text-lg md:text-2xl lg:text-4xl'>{first}</span> <br></br>
                <span className='border-b-2 border-white'> {second}</span>
            </span>
        </div>
    );
};

export default Heading;