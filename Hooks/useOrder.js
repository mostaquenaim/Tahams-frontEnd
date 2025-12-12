import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';
import { useContext } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';

const useOrder = (page = 1, limit = 20, isEnabled = true, allItems = false) => {
  // console.log(allItems,'allItems');
  const axiosPublic = useAxiosPublic();
  const { user, loading } = useContext(AuthContext);

  const fetchCartData = async () => {
    const tmpEmail =
      user?.email ||
      (typeof window !== 'undefined' &&
        JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email);

    if (!tmpEmail) {
      throw new Error('No email found for the user or guest');
    }

    const res = await axiosPublic.get(
      `/admin/get-all-buying-history?email=${tmpEmail}&page=${page}&limit=${limit}&allItems=${allItems}`,
    );
    // console.log(res.data, 'res.data');
    return res.data;
  };

  const { refetch, data: orders = [] } = useQuery({
    queryKey: [
      'orders',
      user?.email ||
        (typeof window !== 'undefined' &&
          JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email),
      page,
    ],
    queryFn: fetchCartData,
    enabled:
      !loading &&
      (!!user?.email ||
        (typeof window !== 'undefined' &&
          !!JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email)) &&
      isEnabled,
  });

  return [orders, refetch];
};

export default useOrder;
