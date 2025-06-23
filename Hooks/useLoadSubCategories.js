import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useLoadSubCategories = () => {
    const axiosPublic = useAxiosPublic();

    const loadSubCategories = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-product-sub-categories');

            // console.log('result=',result);
            const sortedCategories = result.data

            return sortedCategories;
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const { refetch, data: categories = [], isPending } = useQuery({
        queryKey: ['categories'], // Include user.email in the query key
        queryFn: loadSubCategories,
        // enabled: !loading ,
    });

    return [categories, refetch, isPending];
};

export default useLoadSubCategories;



