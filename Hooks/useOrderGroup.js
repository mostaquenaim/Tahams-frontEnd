import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import useAxiosSecure from './useAxiosSecure';
import { AuthContext } from '/Contexts/Auth/AuthProvider';

const useOrderGroup = (historyId) => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useContext(AuthContext);

  const fetchOrderData = async () => {
    const res = await axiosSecure.get(`/admin/order-group/${historyId}`);
    return res.data;
  };

  const { refetch, isPending, data: specificOrders = [] } = useQuery({
    queryKey: ['specificOrders', historyId],
    queryFn: fetchOrderData,
    enabled: !loading && !!user && !!historyId,
  });

  return {specificOrders, refetch, isPending};
};

export default useOrderGroup;
