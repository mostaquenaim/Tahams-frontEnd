import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadPopularItems = (initialData = null) => {
    const [popular, setPopular] = useState(initialData || []);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        if (initialData) return;

        const loadPopular = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-popular-items');
                // console.log(result.data,'popularss');
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
