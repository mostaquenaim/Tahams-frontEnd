import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";
import { getGuestCustomerInfo } from "../utils/guestCustomer";

const useCart = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);
    const [guestUser, setGuestUser] = useState(null);

    // Check localStorage only on the client side
    useEffect(() => {
        if (typeof window !== "undefined") {
            const guestCustomerInfo = getGuestCustomerInfo();
            setGuestUser(guestCustomerInfo); 
        }
    }, []);

    const fetchCartData = async () => {
        const currentUser = user || guestUser;
        if (!currentUser || !currentUser.email) {
            return []; // Return an empty array if no user or email is found
        }

        // Fetch cart data for the current user
        const res = await axiosPublic.get(`/admin/get-all-carts?email=${currentUser.email}`);
        // console.log(res.data);
        const result = res.data.filter((item) => !item.isBought);
        // console.log(result);
        return result;
    };

    const { isPending: isLoading ,refetch, data: cart = [] } = useQuery({
        queryKey: ['cart', user?.email || guestUser?.email], // Include user or guest email in the query key
        queryFn: fetchCartData,
        enabled: !loading && (!!user || !!guestUser), // Enable only if user or guestUser is available
    });

    return [isLoading, cart, refetch];
};

export default useCart;
