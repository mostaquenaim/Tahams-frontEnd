import FetchProducts from '/components/Product/FetchProducts';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

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
