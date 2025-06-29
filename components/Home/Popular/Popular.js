import useLoadPopularItems from '/Hooks/useLoadPopularItems';
import Heading from '/components/Header/Heading';
import React from 'react';
import ShowProductSmall from '/components/Product/ShowProductSmall';

const Popular = () => {
    const popular = useLoadPopularItems()
    return (
        <>
            <div className="pt-20 md:pt-16 lg:pt-10 shadow-md">
                <div className='px-10'>
                    <Heading first='CUSTOMER' second='FAVORITE'></Heading>
                </div>
                <div className="pt-10 container mx-auto pb-10 flex justify-center">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 xl:gap-10">
                        {popular.length > 0 &&
                            popular.map((item) => (
                                <ShowProductSmall key={item.id} item={item} />
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Popular;