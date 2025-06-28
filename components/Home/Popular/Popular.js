import useLoadPopularItems from '/Hooks/useLoadPopularItems';
import Heading from '/components/Header/Heading';
import React from 'react';

const Popular = () => {
    const popular = useLoadPopularItems()
    return (
        <>
            <div className="pt-20 md:pt-16 lg:pt-10 shadow-md px-10">
                <Heading first='CUSTOMER' second='FAVORITE'></Heading>
                <div className="pt-10 pb-10 grid grid-cols-2 md:grid-cols-4 gap-5">
                    
                </div>
            </div>
        </>
    );
};

export default Popular;