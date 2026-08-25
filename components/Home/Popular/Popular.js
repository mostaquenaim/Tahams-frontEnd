import useLoadPopularItems from '/Hooks/useLoadPopularItems';
import Heading from '/components/Header/Heading';
import React from 'react';
import ShowProductSmall from '/components/Product/ShowProductSmall';

const Popular = ({ initialItems = null }) => {
  const popular = useLoadPopularItems(initialItems);
  return (
    <>
      <div className="pt-10 md:pt-16 lg:pt-10 shadow-md space-y-8 py-12 px-2 sm:px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="px-2 md:px-10">
          <Heading first="CUSTOMER" second="FAVORITE"></Heading>
        </div>
        <div className="pt-10 pb-10 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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
