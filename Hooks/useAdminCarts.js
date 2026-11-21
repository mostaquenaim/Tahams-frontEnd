import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

// Admin-only: every customer's open (not yet ordered) cart items, for the
// admin All Carts page. Customers use useCart, which only ever returns their
// own cart.
const useAdminCarts = () => {
    const axiosSecure = useAxiosSecure();

    const { isPending: isLoading, refetch, data: cart = [] } = useQuery({
        queryKey: ['admin-carts'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/admin-all-carts');
            return res.data.filter((item) => !item.isBought);
        },
    });

    return [isLoading, cart, refetch];
};

export default useAdminCarts;
