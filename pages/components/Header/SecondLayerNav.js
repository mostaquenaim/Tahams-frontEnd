import React from 'react';

const SecondLayerNav = () => {
    return (
        <div className='flex justify-around'>
            <div className="navbar ">
                
                <div className="flex-none gap-2">
                    <div className="form-control">
                        <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SecondLayerNav;