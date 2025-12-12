import { useQuery } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosPublic from './useAxiosPublic';

const useGroupOrders = (page = 1, limit = 20, isEnabled = true, allItems=false) => {
  const { user, loading } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

  const fetchGroupOrderData = async () => {
    const res = await axiosPublic.get(
      `/admin/get-all-buying-history?email=${user?.email}&page=${page}&limit=${limit}`
    );

    const orders = res.data;
    console.log(orders,'ordersorders');

    // Filter to keep only non-draft orders
    const filteredOrders = orders.filter((order) => !order.history?.isDraft);

    // Group by history ID
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
      if (a.history.isChecked && !b.history.isChecked) return 1;
      if (!a.history.isChecked && b.history.isChecked) return -1;
      if (a.history.isChecked && b.history.isChecked) {
        return new Date(b.history.checkedDate) - new Date(a.history.checkedDate);
      }
      return 0;
    });

    return sortedGroupedOrdersArray;
  };

  const {
    refetch,
    data: sortedGroupedOrdersArray = [],
    isPending,
  } = useQuery({
    queryKey: ['sortedGroupedOrdersArray', user?.email, page],
    queryFn: fetchGroupOrderData,
    enabled: !loading && !!user && isEnabled,
    keepPreviousData: true, // Smooth pagination
  });

  return {
    sortedGroupedOrdersArray,
    refetch,
    isPending,
  };
};

export default useGroupOrders;
