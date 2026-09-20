import React, { useContext, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import {
  FiBarChart2,
  FiDollarSign,
  FiLogOut,
  FiPackage,
  FiRefreshCw,
  FiRepeat,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import useDashboardStats from '/Hooks/useDashboardStats';
import {
  AdminPage,
  Dropdown,
  DropdownItem,
  EmptyState,
  IconButton,
  PageHeader,
  Section,
  Spinner,
  StatCard,
  StatGrid,
} from '../../components/Admin';

const DATE_INPUT_CLASS =
  'h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10';

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  boxShadow:
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  fontSize: '0.75rem',
};

const toDateParam = (date, endOfDay = false) => {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} ${endOfDay ? '23:59:59' : '00:00:00'}`;
};

const formatMonthLabel = (month) =>
  new Date(`${month}-01T00:00:00`).toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });

const getInitials = (name) => {
  if (!name?.trim()) return 'AD';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminDashboard = () => {
  const { user, logOut } = useContext(AuthContext);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const {
    totalSales,
    totalOrders,
    uniqueCustomers,
    repeatCustomers,
    monthlyTrend,
    isPending,
    refetch,
  } = useDashboardStats(toDateParam(startDate), toDateParam(endDate, true));

  const chartData = useMemo(
    () =>
      monthlyTrend.map((row) => ({
        name: formatMonthLabel(row.month),
        sales: row.sales,
        orders: row.orders,
      })),
    [monthlyTrend],
  );

  const repeatRatio =
    uniqueCustomers > 0
      ? Math.round((repeatCustomers / uniqueCustomers) * 100)
      : 0;

  const handleLogout = async () => {
    try {
      await logOut();
      localStorage.removeItem('userInfo');
      localStorage.removeItem('access_token');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
      console.error('Logout error:', error);
    }
  };

  return (
    <AdminPage title="Dashboard">
      <PageHeader
        title="Dashboard"
        description="Key metrics and store performance at a glance."
        actions={
          <>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={setDateRange}
              isClearable
              placeholderText="Select date range"
              className={DATE_INPUT_CLASS}
            />
            <IconButton
              label="Refresh"
              icon={<FiRefreshCw />}
              onClick={() => refetch()}
            />
            <Dropdown
              label={user?.displayName?.trim() || 'Admin'}
              icon={
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
                  {getInitials(user?.displayName)}
                </span>
              }
            >
              <DropdownItem
                icon={<FiLogOut />}
                tone="danger"
                onClick={handleLogout}
              >
                Log out
              </DropdownItem>
            </Dropdown>
          </>
        }
      />

      <StatGrid cols={4}>
        <StatCard
          label="Total sales"
          value={`৳${Math.round(totalSales || 0).toLocaleString()}`}
          icon={<FiDollarSign />}
          tone="success"
        />
        <StatCard
          label="Total orders"
          value={(totalOrders || 0).toLocaleString()}
          icon={<FiPackage />}
          tone="info"
        />
        <StatCard
          label="Unique customers"
          value={(uniqueCustomers || 0).toLocaleString()}
          icon={<FiUsers />}
        />
        <StatCard
          label="Repeat customers"
          value={(repeatCustomers || 0).toLocaleString()}
          hint={uniqueCustomers > 0 ? `${repeatRatio}% of customers` : undefined}
          icon={<FiRepeat />}
          tone="warning"
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Sales trend" icon={<FiTrendingUp />}>
          {isPending ? (
            <div className="flex h-72 items-center justify-center">
              <Spinner className="h-6 w-6 text-gray-300" />
            </div>
          ) : chartData.length === 0 ? (
            <EmptyState
              icon={<FiTrendingUp />}
              title="No sales yet"
              description="Orders will appear here once customers start buying."
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [
                      `৳${Number(value).toLocaleString()}`,
                      'Sales',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, stroke: '#111827', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>

        <Section title="Orders trend" icon={<FiBarChart2 />}>
          {isPending ? (
            <div className="flex h-72 items-center justify-center">
              <Spinner className="h-6 w-6 text-gray-300" />
            </div>
          ) : chartData.length === 0 ? (
            <EmptyState
              icon={<FiBarChart2 />}
              title="No orders yet"
              description="Orders will appear here once customers start buying."
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [value, 'Orders']}
                  />
                  <Bar dataKey="orders" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>
    </AdminPage>
  );
};

export default AdminDashboard;
