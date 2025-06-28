import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadPopularItems = () => {
    const [popular, setPopular] = useState([]);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const loadPopular = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-popular-items');
                console.log(result.data,'popularss');
                setPopular(result.data);
            } catch (error) {
                console.error('Error loading popular items:', error);
            }
        };

        loadPopular();
    }, [axiosPublic]);

    return popular;
};

export default useLoadPopularItems;
