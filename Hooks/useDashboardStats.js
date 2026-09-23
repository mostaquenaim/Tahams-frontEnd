import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosSecure from './useAxiosSecure';

const EMPTY_RESULT = {
  totalSales: 0,
  totalOrders: 0,
  uniqueCustomers: 0,
  repeatCustomers: 0,
  avgOrderValue: 0,
  monthlyTrend: [],
};

// startDate/endDate: ISO date strings (yyyy-mm-dd), optional - all-time when
// both are omitted. Aggregates are computed server-side over the whole
// matching set, not just a page of orders.
const useDashboardStats = (startDate, endDate) => {
  const { user, loading, backendEmail } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  const fetchStats = async () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const res = await axiosSecure.get(
      `/admin/dashboard-stats?${params.toString()}`,
    );
    return res.data;
  };

  const {
    data = EMPTY_RESULT,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['dashboardStats', user?.email || backendEmail, startDate, endDate],
    queryFn: fetchStats,
    enabled: !loading && !!(user || backendEmail),
    keepPreviousData: true,
  });

  return { ...data, isPending, refetch };
};

export default useDashboardStats;
