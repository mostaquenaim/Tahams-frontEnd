import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadActivePop = () => {
    const [activePop, setActivePop] = useState(null);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const loadActivePop = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-active-pop-up');
                // console.log(result.data,'dataaa');
                setActivePop(result.data);
            } catch (error) {
                console.error('Error loading active pop:', error);
            }
        };

        loadActivePop();
    }, [axiosPublic]);

    return activePop;
};

export default useLoadActivePop;
