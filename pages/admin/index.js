import Head from 'next/head';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, BellIcon } from '@heroicons/react/24/solid';
import { Person, Settings, ExitToApp } from '@mui/icons-material';
import useGroupOrders from '/Hooks/useGroupOrders';

const Admin = () => {
  const [sortedGroupedOrdersArray, isPending] = useGroupOrders();
  console.log(sortedGroupedOrdersArray);

  // Calculate total sales, total orders, and total users
  const totalSales = sortedGroupedOrdersArray?.filter(order => order.history.deliveryStatus.id !== 7 && order.history.deliveryStatus.id !== 8).reduce((sum, order) => sum + order.totalPrice, 0) || 0;
  const totalOrders = sortedGroupedOrdersArray?.length || 0;
  const totalUsers = sortedGroupedOrdersArray?.filter((order, index, self) =>
    index === self.findIndex((o) => o.customer.email === order.customer.email)
  ).length || 0;

  // Prepare sales data for the bar chart
  const salesData = sortedGroupedOrdersArray?.filter(order => order.history.deliveryStatus.id !== 7 && order.history.deliveryStatus.id !== 8)
    .map((order) => ({
      name: new Date(order.history.BuyingDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
      sales: order.totalPrice,
    }))
    .reduce((acc, current) => {
      const existingDate = acc.find(item => item.name === current.name);
      if (existingDate) {
        existingDate.sales += current.sales;
      } else {
        acc.push(current);
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.name) - new Date(b.name)) || [];

  // const [filter, setFilter] = useState(30);

  // const filteredSalesData = salesData.slice(-filter);

  const repeatCustomerCount = [...new Set(sortedGroupedOrdersArray?.filter((order, index, self) =>
    self.filter(o => o.customer.email === order.customer.email && o.history.deliveryStatus.id !== 7 && o.history.deliveryStatus.id !== 8).length > 1
  ).map(order => order.customer.email))].length || 0;

  // console.log(repeatCustomerCount);

  // Prepare user activity data for the pie chart
  const userActivityData = [
    { name: 'Active Users', value: totalUsers },
    { name: 'Inactive Users', value: 0 }, // Replace with actual inactive user count if available
  ];

  const COLORS = ['#6366F1', '#EF4444']; // Colors for the pie chart

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin - Tahams</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <BellIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2">
                <Person className="h-8 w-8 text-gray-500" />
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </Menu.Button>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                        >
                          <Settings className="inline h-4 w-4 mr-2" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={`${active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                        >
                          <ExitToApp className="inline h-4 w-4 mr-2" />
                          Logout
                        </a>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Statistic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* total sales  */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
              <p className="text-3xl font-bold text-indigo-600">${totalSales.toLocaleString()}</p>
            </div>
            {/* total users  */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
              <p className="text-3xl font-bold text-indigo-600">{totalUsers}</p>
            </div>
            {/* total orders  */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
              <p className="text-3xl font-bold text-indigo-600">{totalOrders}</p>
            </div>
            {/* repeated customers  */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Repeat Customers</h2>
              <p className="text-3xl font-bold text-indigo-600">{repeatCustomerCount}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Sales Overview</h2>
              <LineChart width={800} height={300} data={salesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#6366F1" strokeWidth={2} />
              </LineChart>
            </div>


            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">User Activity</h2>
              <PieChart width={500} height={300}>
                <Pie
                  data={userActivityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {userActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;