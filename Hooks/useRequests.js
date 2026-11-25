import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

// Admin-only: every cancellation/return request. Authorised by the admin
// JWT (useAxiosSecure), not by an email - the old ?email= version let anyone
// who knew an admin's email read every request.
const useRequests = () => {
    const axiosSecure = useAxiosSecure();

    const fetchReqData = async () => {
        const res = await axiosSecure.get('/admin/view-cancellation-or-return-requests');
        return res.data;
    };

    const { refetch, data: requests = [], isPending } = useQuery({
        queryKey: ['requests'],
        queryFn: fetchReqData,
    });

    return [requests, refetch, isPending];
};

export default useRequests;
