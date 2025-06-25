import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";
import { getGuestCustomerInfo } from "/utils/guestCustomer";

const useWish = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);
    const [userData, setUserData] = useState(null)

    useEffect(()=>{
        if(!loading){
            if(user){
                setUserData(user)
            }
            else{
                setUserData(getGuestCustomerInfo)
            }
        }
    },[loading, user])

    const fetchWishData = async () => {
        const res = await axiosPublic.get(`/admin/get-wish-by-user/${userData?.email}`);
        // console.log(res.data,'wish');
        return res.data;
    };

    const { isPending ,refetch, data: wish = [] } = useQuery({
        queryKey: ['wish', userData?.email], // Include user.email in the query key
        queryFn: fetchWishData,
        enabled: !loading && !!userData, // Enable the query when the user is not loading and is authenticated
    });

    return [isPending, wish, refetch];
};

export default useWish;
