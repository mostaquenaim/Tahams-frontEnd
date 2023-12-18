import React from 'react';

const ShowCat = ({ prop }) => {
    return (
        <>
            <div
                className='relative'>
                <figure className='relative'>
                    <img src={`http://localhost:3000/admin/getimage/${prop.filename}`} className='rounded-lg shadow-md' alt={prop.categoryName} />
                    <div className='absolute inset-0 flex justify-center items-end '>
                        <div className='font-semibold text-white text-xl rounded-lg bg-black p-5 w-2/3 text-center bg-opacity-80'>
                            {prop.categoryName}
                        </div>
                    </div>
                </figure>
            </div>
        </>
    );
};

export default ShowCat;
