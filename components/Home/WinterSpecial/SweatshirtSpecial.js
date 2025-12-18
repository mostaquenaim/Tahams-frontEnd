import ShowProductSmall from '/components/Product/ShowProductSmall';
import Heading from '/components/Header/Heading';
import useSearch from '/Hooks/useSearch';
import React from 'react';
import { useRouter } from 'next/router';

const SweatshirtSpecial = () => {
  const { searchedItems, isPending } = useSearch('sweatshirt');
  const router = useRouter();

  const DISPLAY_LIMIT = 16;
  const visibleItems = searchedItems.slice(0, DISPLAY_LIMIT);

  return (
    <div className="pt-10 md:pt-16 lg:pt-10 shadow-md space-y-8 py-12 px-2 sm:px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="px-2 md:px-10">
        <Heading second="SWEATSHIRT" />
      </div>

      <div className="lg:hidden pt-10 pb-6 flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {visibleItems.map((item) => (
            <ShowProductSmall key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="hidden lg:flex pt-10 pb-6 justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {searchedItems.map((item) => (
            <ShowProductSmall key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Explore More Button */}
      {searchedItems.length > DISPLAY_LIMIT && (
        <div className="flex justify-center lg:hidden">
          <button
            onClick={() => router.push(`/search-product?search=sweatshirt`)}
            className="px-6 py-2 border border-black text-black hover:bg-black hover:text-white transition"
          >
            Explore More
          </button>
        </div>
      )}
    </div>
  );
};

export default SweatshirtSpecial;
