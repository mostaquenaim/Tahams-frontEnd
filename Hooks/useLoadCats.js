import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useLoadCats = () => {
    const axiosPublic = useAxiosPublic();

    const loadCategories = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-product-categories');

            const sortedCategories = result.data.sort((a, b) => a.serial - b.serial); 

            // console.log(sortedCategories,'srted');
            return sortedCategories;
        } catch (error) {
            console.error('Error loading categories:', error);
            return []; 
        }
    };

    const { refetch, data: categories = [], isPending } = useQuery({
        queryKey: ['cats'], 
        queryFn: loadCategories,
    });

    return [categories, refetch, isPending];
};

export default useLoadCats;
