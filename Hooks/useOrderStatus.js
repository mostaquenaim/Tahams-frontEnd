import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useOrderStatus = (token) => {
    // console.log('token',token);
    const axiosPublic = useAxiosPublic();
    const { user, loading, backendEmail } = useContext(AuthContext);

    const fetchOrderStatusData = async () => {
        const res = await axiosPublic.get(`/admin/get-buying-history-status-by-token/${token}`);
        // console.log(res.data,'res.data');
        return res.data;
    };

    const { refetch, data: orderStatus = [] } = useQuery({
        queryKey: ['orderStatus', user?.email || backendEmail],
        queryFn: fetchOrderStatusData,
        enabled: !loading && !!(user || backendEmail), // Enable the query when the user is not loading and is authenticated
    });

    return [orderStatus, refetch];
};

export default useOrderStatus;
