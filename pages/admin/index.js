import Head from 'next/head';
import React, { useContext, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  BellIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import useGroupOrders from '/Hooks/useGroupOrders';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import Loading from '/components/Loading';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminDashboard = () => {
  const [sortedGroupedOrdersArray, isPending] = useGroupOrders();
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [loading, setLoading] = useState(false);
  const { logOut } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!sortedGroupedOrdersArray) return [];

    return sortedGroupedOrdersArray.filter((order) => {
      const orderDate = new Date(order.history.BuyingDate);
      return (
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate)
      );
    });
  }, [sortedGroupedOrdersArray, startDate, endDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const validOrders = filteredData.filter(
      (order) =>
        order.history.deliveryStatus.id !== 7 &&
        order.history.deliveryStatus.id !== 8,
    );

    const totalSales = validOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );
    const totalOrders = validOrders.length;

    const uniqueUsers = new Set(
      validOrders.map((order) => order.customer?.email),
    ).size;

    const repeatCustomers = [
      ...new Set(
        validOrders
          .filter(
            (order, _, self) =>
              self.filter((o) => o.customer?.email === order.customer?.email)
                .length > 1,
          )
          .map((order) => order.customer?.email),
      ),
    ].length;

    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      uniqueUsers,
      repeatCustomers,
      avgOrderValue,
      conversionRate: 0, // Would need visitor data to calculate
    };
  }, [filteredData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const monthlyData = {};

    filteredData
      .filter(
        (order) =>
          order.history.deliveryStatus.id !== 7 &&
          order.history.deliveryStatus.id !== 8,
      )
      .forEach((order) => {
        const date = new Date(order.history.BuyingDate);
        const monthYear = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, '0')}`;

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            name: date.toLocaleString('default', {
              month: 'short',
              year: 'numeric',
            }),
            sales: 0,
            orders: 0,
          };
        }

        monthlyData[monthYear].sales += order.totalPrice;
        monthlyData[monthYear].orders += 1;
      });

    return Object.values(monthlyData).sort(
      (a, b) => new Date(a.name) - new Date(b.name),
    );
  }, [filteredData]);

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

  // const handleProductPictureCompress = async () => {
  //   try {
  //     setLoading(true);
  //     await axiosPublic.get('/admin/get-all-images-compressed');
  //     toast.success('Images optimized successfully!');
  //   } catch (error) {
  //     toast.error('Failed to optimize images');
  //     console.error('Compression error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard | Tahams</title>
        <meta name="description" content="Tahams Admin Dashboard" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
              <BellIcon className="h-6 w-6" />
              <span className="sr-only">Notifications</span>
            </button>

            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserGroupIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </Menu.Button>

              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <FiSettings className="mr-2" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          <FiLogOut className="mr-2" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Date Range Picker */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-semibold text-gray-800">
              Performance Overview
            </h2>
            <p className="text-sm text-gray-500">Key metrics and analytics</p>
          </div>

          <div className="flex items-center space-x-2">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              placeholderText="Select date range"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setDateRange([null, null])}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mb-6">
          {/* <button
            onClick={handleProductPictureCompress}
            disabled={loading}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white transition-colors`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Optimize Product Images
              </>
            )}
          </button> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Sales */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <ShoppingBagIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Sales
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ৳{metrics.totalSales.toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Orders
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metrics.totalOrders}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Unique Customers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Unique Customers
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metrics.uniqueUsers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Repeat Customers */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Repeat Customers
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metrics.repeatCustomers}
                      </div>
                      {metrics.uniqueUsers > 0 && (
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {Math.round(
                            (metrics.repeatCustomers / metrics.uniqueUsers) *
                              100,
                          )}
                          %
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Sales Trend
              </h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md">
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      boxShadow:
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: '#4338CA', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Orders Trend
              </h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md">
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      boxShadow:
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                  <Bar dataKey="orders" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
