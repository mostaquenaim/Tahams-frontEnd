import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

const useOrderGroup = (historyId) => {
  console.log('object-lok');
  const axiosPublic = useAxiosPublic();

  const fetchOrderData = async () => {
    const res = await axiosPublic.get(`/admin/order-group/${historyId}`);
    console.log(res.data, 'res.data');
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
