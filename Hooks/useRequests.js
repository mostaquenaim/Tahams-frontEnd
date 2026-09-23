import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import { useContext } from "react";
import { AuthContext } from "/Contexts/Auth/AuthProvider";

const useRequests = () => {
    const axiosPublic = useAxiosPublic();
    const { user, loading, backendEmail } = useContext(AuthContext);

    const fetchReqData = async () => {
        const res = await axiosPublic.get(`/admin/view-cancellation-or-return-requests?email=${user?.email || backendEmail}`);
        // console.log(res.data);
        return res.data;
    };

    const { refetch, data: requests = [], isPending } = useQuery({
        queryKey: ['requests', user?.email || backendEmail], // Include user.email in the query key
        queryFn: fetchReqData,
        enabled: !loading && !!(user || backendEmail), // Enable the query when the user is not loading and is authenticated
    });

    return [requests, refetch, isPending];
};

export default useRequests;
