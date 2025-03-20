import Loading from '/components/Loading';
import FetchProducts from '/components/Product/FetchProducts';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import React, { useState, useEffect } from 'react';

const SearchProduct = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

    const axiosPublic = useAxiosPublic()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        // console.log(searchQuery);
        setSearchQuery(searchQuery);
    }, [window.location.search]);

    useEffect(() => {
        if (searchQuery) {
            fetchProducts(searchQuery);
        }
    }, [searchQuery]);

    const fetchProducts = async (searchQuery) => {
        setIsLoading(true)
        try {
            const response = await axiosPublic.get(`admin/search-products?q=${searchQuery}`);
            console.log(response.data);
            setProducts(response.data);
        } catch (error) {
            console.error(error);
        }
        finally{
            setIsLoading(false)
        }
    };

    return (
        <div>
            {
                <FetchProducts categories={products} query={searchQuery} isLoading={isLoading} />
            }
        </div>
    );
};

export default SearchProduct;