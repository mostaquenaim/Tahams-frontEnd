import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useLoadSeries = () => {
    const axiosPublic = useAxiosPublic();

    const loadSeries = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-product-categories');

            // console.log('result=',result);
            const sortedCategories = result.data

            return sortedCategories;
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const { refetch, data: series = [], isPending } = useQuery({
        queryKey: ['series'], // Include user.email in the query key
        queryFn: loadSeries,
        // enabled: !loading ,
    });

    return [series, refetch, isPending];
};

export default useLoadSeries;



