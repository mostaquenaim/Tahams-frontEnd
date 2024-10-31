import { useState, useEffect } from 'react';
import useAxiosPublic from '../Hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useLoadSubSubCategories = () => {
    const axiosPublic = useAxiosPublic();

    const loadSubSubCategories = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-product-sub-sub-categories');

            // Sort the subSubCategories array based on categoryName
            const sortedSubSubCategories = result.data.sort((a, b) => {
                const categoryA = a.name.toLowerCase();
                const categoryB = b.name.toLowerCase();

                return categoryA < categoryB ? -1 : categoryA > categoryB ? 1 : 0;
            });

            return sortedSubSubCategories;
        } catch (error) {
            console.error('Error loading sub-sub-categories:', error);
        }
    };

    const { refetch, data: subSubCategories = [], isPending } = useQuery({
        queryKey: ['subSubCategories'], // Include user.email in the query key
        queryFn: loadSubSubCategories,
        // enabled: !loading ,
    });

    return [subSubCategories, refetch, isPending];
};

export default useLoadSubSubCategories;



