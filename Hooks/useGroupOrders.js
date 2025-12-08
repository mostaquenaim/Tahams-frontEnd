import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosPublic from './useAxiosPublic';

const useGroupOrders = () => {
  const { user, loading } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

  const fetchGroupOrderData = async () => {
    // console.log('Fetching Group Orders...');
    const res = await axiosPublic.get(
      `/admin/get-all-buying-history?email=${user?.email}`,
    );
    const orders = res.data;

    // Filter to keep only orders where history.isDraft === true
    const filteredOrders = orders.filter((order) => !order.history?.isDraft);

    const groupedOrders = filteredOrders.reduce((acc, order) => {
      const key = order.history?.id;
      if (!acc[key]) {
        acc[key] = {
          history: order.history,
          orders: [],
          totalPrice: 0,
          deliveryFee: order.history?.deliveryFee || 0,
          customer: order.customer,
        };
      }
      acc[key].orders.push(order);
      acc[key].totalPrice += order.totalPrice;
      return acc;
    }, {});

    const groupedOrdersArray = Object.values(groupedOrders);

    const sortedGroupedOrdersArray = groupedOrdersArray.sort((a, b) => {
      if (a.history.isChecked && !b.history.isChecked) {
        return 1;
      } else if (!a.history.isChecked && b.history.isChecked) {
        return -1;
      } else if (a.history.isChecked && b.history.isChecked) {
        return (
          new Date(b.history.checkedDate) - new Date(a.history.checkedDate)
        );
      } else {
        return 0;
      }
    });

    return sortedGroupedOrdersArray;
  };

  const {
    refetch,
    data: sortedGroupedOrdersArray = [],
    isPending,
  } = useQuery({
    queryKey: ['sortedGroupedOrdersArray', user?.email],
    queryFn: fetchGroupOrderData,
    enabled: !loading && !!user,
  });

  return [sortedGroupedOrdersArray, refetch, isPending];
};

export default useGroupOrders;
