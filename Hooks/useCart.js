import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useCart = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading } = useContext(AuthContext);
    const [guestUser, setGuestUser] = useState(null);

    // Check localStorage only on the client side
    useEffect(() => {
        if (typeof window !== "undefined") {
            let storedGuestInfo = localStorage.getItem("guestCustomerInfo");
            if (!storedGuestInfo) {
                // Create guest user if it doesn't exist in localStorage
                const guestCustomerInfo = {
                    username: `guest${Date.now()}${Math.floor(Math.random() * 1000)}`,
                    email: `guest${Date.now()}${Math.floor(Math.random() * 1000)}@tahamsbd.com`,
                };
                localStorage.setItem("guestCustomerInfo", JSON.stringify(guestCustomerInfo));
                storedGuestInfo = JSON.stringify(guestCustomerInfo);
            }
            setGuestUser(JSON.parse(storedGuestInfo)); // Parse and set the guest user
        }
    }, []);

    const fetchCartData = async () => {
        const currentUser = user || guestUser;
        if (!currentUser || !currentUser.email) {
            return []; // Return an empty array if no user or email is found
        }

        // Fetch cart data for the current user
        const res = await axiosPublic.get(`/admin/get-all-carts?email=${currentUser.email}`);
        const result = res.data.filter((item) => !item.isBought);
        return result;
    };

    const { refetch, data: cart = [] } = useQuery({
        queryKey: ['cart', user?.email || guestUser?.email], // Include user or guest email in the query key
        queryFn: fetchCartData,
        enabled: !loading && (!!user || !!guestUser), // Enable only if user or guestUser is available
    });

    return [cart, refetch];
};

export default useCart;
