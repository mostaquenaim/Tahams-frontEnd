import FetchProducts from '/components/Product/FetchProducts';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const SearchProduct = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const { search } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    if (!search) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    axiosPublic
      .get(`admin/search-products?q=${encodeURIComponent(search)}`)
      .then((response) => {
        if (!cancelled) setProducts(response.data);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // A newer search shouldn't be overwritten by a slower earlier one.
    return () => {
      cancelled = true;
    };
  }, [router.isReady, search]);

  return (
    <div>
      <Head>
        <title>{search ? `${search} - Search results` : 'Search'} - Tahams</title>
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
