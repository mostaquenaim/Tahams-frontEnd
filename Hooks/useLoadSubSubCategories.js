import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';

const useLoadSubSubCategories = () => {
    const [subSubCategories, setSubSubCategories] = useState([]);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const loadSubSubCategories = async () => {
            try {
                const result = await axiosPublic.get('/admin/view-product-sub-sub-categories');

                // Sort the subSubCategories array based on categoryName
                const sortedSubSubCategories = result.data.sort((a, b) => {
                    const categoryA = a.name.toLowerCase();
                    const categoryB = b.name.toLowerCase();
 
                    return categoryA < categoryB ? -1 : categoryA > categoryB ? 1 : 0;
                });

                setSubSubCategories(sortedSubSubCategories);
            } catch (error) {
                console.error('Error loading sub-sub-categories:', error);
            }
        };

        loadSubSubCategories();
    }, [axiosPublic]);

    return subSubCategories;
};

export default useLoadSubSubCategories;
