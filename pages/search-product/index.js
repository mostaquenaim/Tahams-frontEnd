import Loading from '/components/Loading';
import FetchProducts from '/components/Product/FetchProducts';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const SearchProduct = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const axiosPublic = useAxiosPublic();
    const router = useRouter();

    useEffect(() => {
        const { search } = router.query; // Access the query param `search` from URL
        if (search) {
            setSearchQuery(search);
        }
    }, [router.query]); // Trigger when the URL query changes

    useEffect(() => {
        if (searchQuery) {
            fetchProducts(searchQuery);
        }
    }, [searchQuery]);

    const fetchProducts = async (searchQuery) => {
        setIsLoading(true);
        try {
            const response = await axiosPublic.get(`admin/search-products?q=${searchQuery}`);
            setProducts(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <FetchProducts categories={products} query={searchQuery} isLoading={isLoading}/>
        </div>
    );
};

export default SearchProduct;
