import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadPopUps = () => {
    const [popUps, setPopUps] = useState([]);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const loadPopUps = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-all-pop-up');
                setPopUps(result.data);
            } catch (error) {
                console.error('Error loading colors:', error);
            }
        };

        loadPopUps();
    }, [axiosPublic]);

    return popUps;
};

export default useLoadPopUps;
