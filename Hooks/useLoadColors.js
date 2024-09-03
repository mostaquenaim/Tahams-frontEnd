import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadColors = () => {
    const [colors, setColors] = useState([]);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const loadColors = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-colors');
                setColors(result.data);
            } catch (error) {
                console.error('Error loading colors:', error);
            }
        };

        loadColors();
    }, [axiosPublic]);

    return colors;
};

export default useLoadColors;
