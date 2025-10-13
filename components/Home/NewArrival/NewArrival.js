import React, { useEffect, useState } from 'react';
import ShowNewArrival from './ShowNewArrival';
import Heading from '../../Header/Heading';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';

const NewArrival = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const res = await axiosPublic.get(`/admin/view-new-arrivals`);
      const sortedProducts = res.data.sort((a, b) => a.serial - b.serial);
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching new arrivals', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-10 md:pt-16 lg:pt-10 shadow-md px-2 md:px-10 space-y-8 py-12 sm:px-4 lg:px-8 max-w-7xl mx-auto">
      <Heading first="NEW" second="ARRIVALS" />
      <div className=" pt-10 pb-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
        {loading
          ? [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="w-4/5 h-72 mx-auto rounded-xl bg-gray-200 animate-pulse"
              ></div>
            ))
          : products.map((product, index) => (
              <>
                {product.serial != 'discontinued' && (
                  <ShowNewArrival key={index} ind={index} prop={product} />
                )}
              </>
            ))}
      </div>
    </div>
  );
};

export default NewArrival;
