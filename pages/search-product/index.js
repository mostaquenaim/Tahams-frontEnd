import FetchProducts from '/components/Product/FetchProducts';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Loading from '/components/Loading';

const SearchProduct = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const { search } = router.query; // Get search directly

  useEffect(() => {
    if (search) {
      setIsLoading(true);
      axiosPublic
        .get(`admin/search-products?q=${search}`)
        .then((response) => {
          setProducts(response.data);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [search]); 

  if (isLoading){
    return <div className='h-screen flex justify-center items-center'>
      <Loading></Loading>
    </div>
  }

  return (
    <div>
      <Head>
        <title>{search || 'Search'} - search results</title>
      </Head>
      <FetchProducts
        categories={products}
        query={search}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SearchProduct;
