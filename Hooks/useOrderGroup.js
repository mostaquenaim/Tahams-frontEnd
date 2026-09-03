import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure';

const useOrderGroup = (historyId) => {
  const axiosSecure = useAxiosSecure();

  const fetchOrderData = async () => {
    const res = await axiosSecure.get(`/admin/order-group/${historyId}`);
    return res.data;
  };

  const { refetch, isPending, data: specificOrders = [] } = useQuery({
    queryKey: ['specificOrders', historyId],
    queryFn: fetchOrderData,
    enabled: !!historyId,
  });

  return {specificOrders, refetch, isPending};
};

export default useOrderGroup;
