import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useCart = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);

    const fetchCartData = async () => {
        const res = await axiosPublic.get(`/admin/get-all-carts?email=${user.email}`);
        console.log(res.data);
        return res.data;
    };

    const { refetch, data: cart = [] } = useQuery({
        queryKey: ['cart', user?.email], // Include user.email in the query key
        queryFn: fetchCartData,
        enabled: !loading && !!user, // Enable the query when the user is not loading and is authenticated
    });

    return [cart, refetch];
};

export default useCart;
