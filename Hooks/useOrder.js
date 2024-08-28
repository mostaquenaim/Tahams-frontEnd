import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useOrder = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);

    const fetchCartData = async () => {
        const res = await axiosPublic.get(`/admin/get-all-buying-history?email=${user?.email}`);
        const result = res.data.filter(item=>item.isBought)
        console.log(res.data);
        return result;
    };

    const { refetch, data: orders = [] } = useQuery({
        queryKey: ['orders', user?.email], 
        queryFn: fetchCartData,
        enabled: !loading && !!user, // Enable the query when the user is not loading and is authenticated
    });

    return [orders, refetch];
};

export default useOrder;
