import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useWish = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);

    const fetchWishData = async () => {
        const res = await axiosPublic.get(`/admin/get-wish-by-user/${user?.email}`);
        // console.log(res.data,'wish');
        return res.data;
    };

    const { refetch, data: wish = [] } = useQuery({
        queryKey: ['wish', user?.email], // Include user.email in the query key
        queryFn: fetchWishData,
        enabled: !loading && !!user, // Enable the query when the user is not loading and is authenticated
    });

    return [loading, wish, refetch];
};

export default useWish;
