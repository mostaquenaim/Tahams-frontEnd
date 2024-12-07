import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useProduct = ( filter ) => {
    console.log(filter,'filter');
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);

    const fetchProductData = async () => {
        const res = await axiosPublic.get(`/admin/view-all-products`,
            filter && {
                params: { filter } 
            }
        );
        // console.log(res.data);
        return res.data;
    };

    const { refetch, data: products = [] } = useQuery({
        queryKey: ['products', user?.email],
        queryFn: fetchProductData,
        enabled: !loading && !!user, // Enable the query when the user is not loading and is authenticated
    });

    return [products, refetch];
};

export default useProduct;
