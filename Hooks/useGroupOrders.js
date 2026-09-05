import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosSecure from './useAxiosSecure';

const EMPTY_RESULT = {
  sortedGroupedOrdersArray: [],
  total: 0,
  totalPages: 0,
  totalRevenue: 0,
  avgOrderValue: 0,
};

// filters: { search, status, region, hideCancelled } — forwarded to the
// backend so search/filtering/stats reflect the whole matching dataset,
// not just whatever page happens to be loaded.
const useGroupOrders = (page = 1, limit = 20, isEnabled = true, allItems = false, filters = {}) => {
  const { user, loading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const { search = '', status = 'all', region = 'all', hideCancelled = false } = filters;

  const fetchGroupOrderData = async () => {
    const params = new URLSearchParams({
      email: user?.email || '',
      page: String(page),
      limit: String(limit),
      allItems: String(allItems),
      hideCancelled: String(hideCancelled),
    });
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    if (region && region !== 'all') params.set('region', region);

    const res = await axiosSecure.get(
      `/admin/get-grouped-buying-history?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      },
    );

    const {
      data: orders = [],
      total = 0,
      totalPages = 0,
      totalRevenue = 0,
      avgOrderValue = 0,
    } = res.data;

    // Group cart rows by history ID — one order (history) can have
    // multiple cart rows, one per product.
    const groupedOrders = orders.reduce((acc, order) => {
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

    return { sortedGroupedOrdersArray, total, totalPages, totalRevenue, avgOrderValue };
  };

  const { refetch, data = EMPTY_RESULT, isPending } = useQuery({
    queryKey: [
      'sortedGroupedOrdersArray',
      user?.email,
      page,
      limit,
      allItems,
      search,
      status,
      region,
      hideCancelled,
    ],
    queryFn: fetchGroupOrderData,
    enabled: !loading && !!user && isEnabled,
    keepPreviousData: true, // Smooth pagination
  });

  return {
    sortedGroupedOrdersArray: data.sortedGroupedOrdersArray,
    total: data.total,
    totalPages: data.totalPages,
    totalRevenue: data.totalRevenue,
    avgOrderValue: data.avgOrderValue,
    refetch,
    isPending,
  };
};

export default useGroupOrders;
