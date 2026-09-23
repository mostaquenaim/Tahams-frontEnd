import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useLoadProducts = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading, backendEmail } = useContext(AuthContext);

    const fetchProductData = async () => {
        const res = await axiosPublic.get('/admin/view-all-products',
            {
                params: { filter: { publishable: false } } // or false based on your need
            }
        );
        return res.data;
    };

    const { refetch, data: unpublishedProducts = [] } = useQuery({
        queryKey: ['unpublishedProducts', user?.email || backendEmail], // Include user.email in the query key
        queryFn: fetchProductData,
        enabled: !loading && !!(user || backendEmail), // Enable the query when the user is not loading and is authenticated
    });

    return [unpublishedProducts, refetch];
};

export default useLoadProducts;
