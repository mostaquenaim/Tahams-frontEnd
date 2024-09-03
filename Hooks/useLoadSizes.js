import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadSizes = () => {
    const [sizes, setSizes] = useState([]);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const loadSizes = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-product-sizes');
                setSizes(result.data);
            } catch (error) {
                console.error('Error loading sizes:', error);
            }
        };

        loadSizes();
    }, [axiosPublic]);

    return sizes;
};

export default useLoadSizes;
