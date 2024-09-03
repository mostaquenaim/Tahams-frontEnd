import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useLoadProducts = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);

    const fetchProductData = async () => {
        const res = await axiosPublic.get('/admin/view-all-products',
            {
                params: { publishable: false } // or false based on your need
            }
        );
        return res.data;
    };

    const { refetch, data: unpublishedProducts = [] } = useQuery({
        queryKey: ['unpublishedProducts', user?.email], // Include user.email in the query key
        queryFn: fetchProductData,
        enabled: !loading && !!user, // Enable the query when the user is not loading and is authenticated
    });

    return [unpublishedProducts, refetch];
};

export default useLoadProducts;
