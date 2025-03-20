import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useLoadProductsByCat = (id) => {
    const axiosPublic = useAxiosPublic();

    const fetchProductData = async () => {
        const res = await axiosPublic.get(`/admin/get-product-by-sub-sub-cat/${id}`);
        console.log('products bny cat',res.data);
        return res.data;
    };

    const { refetch, data: productsByCat = [], isPending } = useQuery({
        queryKey: ['productsByCat', id], // Ensure different IDs trigger new queries
        queryFn: fetchProductData,
        enabled: !!id, // Only run query when `id` is available
    });

    return [productsByCat, isPending];
};

export default useLoadProductsByCat;
