import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';
import { useContext } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';

const useOrder = (page = 1, limit = 20, isEnabled = true, allItems = false) => {
  const axiosPublic = useAxiosPublic();
  const { user, loading } = useContext(AuthContext);

  // Order history by email requires proving you own that email - a
  // Firebase ID token does that server-side. Guests with no Firebase
  // session have no such proof, so this can no longer serve them; they use
  // the per-order tracking-token link instead (see my-orders/details/[token]).
  const fetchCartData = async () => {
    const idToken = await user.getIdToken();

    const res = await axiosPublic.get(
      `/admin/get-all-buying-history?page=${page}&limit=${limit}&allItems=${allItems}`,
      { headers: { Authorization: `Bearer ${idToken}` } },
    );
    return res.data;
  };

  const { refetch, data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email, page],
    queryFn: fetchCartData,
    enabled: !loading && !!user && isEnabled,
  });

  return [orders, refetch];
};

export default useOrder;
