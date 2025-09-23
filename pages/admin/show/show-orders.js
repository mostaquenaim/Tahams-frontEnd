import React, { useContext, useEffect, useRef, useState } from 'react';
import useOrder from '../../../Hooks/useOrder';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Loading from '../../../components/Loading';
import Link from 'next/link';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { motion } from 'framer-motion';
import useGroupOrders from '../../../Hooks/useGroupOrders';
import Head from 'next/head';
import {
  FiCheck,
  FiEye,
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronDown,
} from 'react-icons/fi';
import { useOnClickOutside } from 'usehooks-ts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ShowOrders = () => {
  const { user, loading } = useContext(AuthContext);
  const [sortedGroupedOrdersArray, refetch, isPending] = useGroupOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const axiosPublic = useAxiosPublic();

  const filteredOrders = sortedGroupedOrdersArray.filter((order) => {
    const matchesSearch =
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.history?.phone_no?.includes(searchTerm) ||
      order.orders.some((o) =>
        o.product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === 'all' ||
      order.history?.deliveryStatus.name.toLowerCase() ===
        statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleCheck = async (history) => {
    await axiosPublic.patch(
      `admin/update-history/${history.trackingToken}?email=${user?.email}`,
      {
        isChecked: !history.isChecked,
        checkedDate: new Date().toISOString(),
      },
    );
    refetch();
  };

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportRef = useRef(null);

  useOnClickOutside(exportRef, () => setExportDropdownOpen(false));

  const handleExport = (type) => {
    // Prepare data for export
    const exportData = filteredOrders.map((order) => ({
      'Order ID': order.history.id,
      Customer: order.customer?.name || order.history?.fullName,
      Phone: order.history?.phone_no,
      Products: order.orders.map((o) => o.product.name).join(', '),
      Payment: order.history?.paymentMethod?.name || 'N/A',
      Date: new Date(order.history?.BuyingDate).toLocaleDateString(),
      Status: order.history?.deliveryStatus.name,
    }));

    if (type === 'csv') {
      exportToCSV(exportData);
    } else {
      exportToExcel(exportData);
    }
    setExportDropdownOpen(false);
  };

  const exportToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((v) => `"${v}"`)
        .join(','),
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportToExcel = (data, filename = 'orders.xlsx') => {
    // Convert JSON data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Write the workbook to a binary Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Save the file using file-saver
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Order Placed', label: 'Order Placed' },
    { value: 'Order Received', label: 'Order Received' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <>
      <Head>
        <title>Order Management | Admin Panel</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Order Management
            </h1>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiDownload size={16} />
                  Export
                  <FiChevronDown
                    size={16}
                    className={`transition-transform ${
                      exportDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {exportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('csv')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export as Excel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading || isPending ? (
            <Loading />
          ) : filteredOrders.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((group, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={
                          group.history.deliveryStatus.id > 6
                            ? 'bg-red-200 '
                            : group.history.deliveryStatus.id == 6
                            ? 'bg-green-200 '
                            : group.history.isChecked
                            ? 'bg-green-50'
                            : 'bg-yellow-200'
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{group.history.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.customer?.name || group.history?.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.history?.phone_no}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {group.orders.map((order, idx) => (
                              <Link
                                key={idx}
                                href={`/products/details/${order.product.productId}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {order.product.name}
                                {idx !== group.orders.length - 1 ? ',' : ''}
                              </Link>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.history?.paymentMethod?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            group.history?.BuyingDate,
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              group.history.deliveryStatus.id > 6
                                ? 'bg-red-100 text-red-800'
                                : group.history.deliveryStatus.id == 6
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {group.history?.deliveryStatus.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`show-order-details/${group.history?.id}`}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <FiEye size={14} /> View
                            </Link>
                            |
                            <button
                              onClick={() => handleCheck(group.history)}
                              className={`flex items-center gap-1 ${
                                group.history.isChecked
                                  ? 'text-green-600 cursor-default'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                              disabled={group.history.isChecked}
                            >
                              {group.history.isChecked ? (
                                <>
                                  <FiCheck size={14} /> Checked
                                </>
                              ) : (
                                'Check'
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">
                No orders found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShowOrders;
