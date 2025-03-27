import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useLoadProductName = (id) => {
    const axiosPublic = useAxiosPublic();

    const fetchProductName = async () => {
        const res = await axiosPublic.get(`/admin/get-sub-sub-cat-by-id/${id}`);
        // console.log(res.data,'nameeee');
        return res.data;
    };

    const { refetch, data: productNameByCat = '', isPending } = useQuery({
        queryKey: ['productNameByCat', id], // Ensure different IDs trigger new queries
        queryFn: fetchProductName,
        enabled: !!id, // Only run query when `id` is available
    });

    return [productNameByCat];
};

export default useLoadProductName;