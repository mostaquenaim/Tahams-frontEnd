import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosPublic from './useAxiosPublic';

const useOrderGroup = (historyId) => {
  console.log('object-lok');
  const axiosPublic = useAxiosPublic();
  const { user, loading } = useContext(AuthContext);

  const fetchOrderData = async () => {
    const res = await axiosPublic.get(`/admin/order-group/${historyId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    console.log(res.data, 'res.data');
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
