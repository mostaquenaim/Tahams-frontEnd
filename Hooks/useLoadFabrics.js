import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadFabrics = () => {
    const [fabrics, setFabrics] = useState([]);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const loadFabrics = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-fabrics');
                setFabrics(result.data);
            } catch (error) {
                console.error('Error loading fabrics:', error);
            }
        };

        loadFabrics();
    }, [axiosPublic]);

    return fabrics;
};

export default useLoadFabrics;
