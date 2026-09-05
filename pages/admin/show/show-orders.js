import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Loading from '../../../components/Loading';
import Link from 'next/link';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { motion, AnimatePresence } from 'framer-motion';
import useGroupOrders from '../../../Hooks/useGroupOrders';
import Head from 'next/head';
import {
  FiCheck,
  FiEye,
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronDown,
  FiPackage,
  FiTruck,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiFileText,
} from 'react-icons/fi';
import { useOnClickOutside } from 'usehooks-ts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { X } from 'lucide-react';

const ShowOrders = (data) => {
  const { user, loading } = useContext(AuthContext);
  // console.log(sortedGroupedOrdersArray, 'sortedGroupedOrdersArray');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addressFilter, setAddressFilter] = useState('all');
  const [hideCancelled, setHideCancelled] = useState(false);
  const [addressOptions, setAddressOptions] = useState(
    data ? data.data.module : [],
  );
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const [fraudCheck, setFraudCheck] = useState(null);
  const [fraudLoad, setFraudLoad] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  // Debounce the search box so every keystroke doesn't fire a request —
  // search/filter/status now run server-side against the full dataset,
  // not just the rows on the current page.
  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Any filter change should land the admin back on page 1 — staying on
  // page 3 of a now-different result set is confusing.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, addressFilter, hideCancelled]);

  const {
    sortedGroupedOrdersArray,
    total,
    totalPages,
    totalRevenue,
    avgOrderValue,
    refetch,
    isPending,
  } = useGroupOrders(page, limit, true, false, {
    search: searchTerm,
    status: statusFilter,
    region: addressFilter,
    hideCancelled,
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const filteredOrders = sortedGroupedOrdersArray;

  // column configuration
  const [columnConfig, setColumnConfig] = useState({
    id: true,
    customer: true,
    phone: true,
    price: true,
    products: true,
    payment: true,
    date: true,
    status: true,
    actions: true,
  });

  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const columnRef = useRef(null);

  useOnClickOutside(columnRef, () => setColumnDropdownOpen(false));

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to filtered orders
  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...filteredOrders];

    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'id':
            aValue = a.history.id;
            bValue = b.history.id;
            break;
          case 'customer':
            aValue = (
              a.customer?.name ||
              a.history?.fullName ||
              ''
            ).toLowerCase();
            bValue = (
              b.customer?.name ||
              b.history?.fullName ||
              ''
            ).toLowerCase();
            break;
          case 'phone':
            aValue = a.history?.phone_no || '';
            bValue = b.history?.phone_no || '';
            break;
          case 'price':
            aValue =
              a.orders.reduce(
                (acc, order) => acc + (order.totalPrice || 0),
                0,
              ) + (a.history?.deliveryFee || 0);
            bValue =
              b.orders.reduce(
                (acc, order) => acc + (order.totalPrice || 0),
                0,
              ) + (b.history?.deliveryFee || 0);
            break;
          case 'date':
            aValue = new Date(a.history?.BuyingDate).getTime();
            bValue = new Date(b.history?.BuyingDate).getTime();
            break;
          case 'status':
            aValue = a.history?.deliveryStatus.name.toLowerCase();
            bValue = b.history?.deliveryStatus.name.toLowerCase();
            break;
          case 'payment':
            aValue = (a.history?.paymentMethod?.name || '').toLowerCase();
            bValue = (b.history?.paymentMethod?.name || '').toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableOrders;
  }, [filteredOrders, sortConfig]);

  // Sort icon component
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="inline-flex flex-col ml-1 opacity-30">
          <FiArrowUp className="w-3 h-3 -mb-1" />
          <FiArrowDown className="w-3 h-3" />
        </div>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <FiArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" />
    ) : (
      <FiArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />
    );
  };

  const handleCheck = async (history) => {
    await axiosSecure.patch(
      `admin/update-history/${history.trackingToken}`,
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
    const exportData = sortedOrders.map((order) => ({
      'Order ID': order.history.id,

      ...(columnConfig.customer && {
        Customer: order.customer?.name || order.history?.fullName,
      }),

      ...(columnConfig.phone && {
        Phone: String(order.history?.phone_no || ''),
      }),

      ...(columnConfig.products && {
        Products: order.orders.map((o) => o.product.name).join(', '),
      }),

      ...(columnConfig.payment && {
        Payment: order.history?.paymentMethod?.name || 'N/A',
      }),

      ...(columnConfig.date && {
        Date: new Date(order.history?.BuyingDate).toLocaleDateString(),
      }),

      ...(columnConfig.status && {
        Status: order.history?.deliveryStatus.name,
      }),
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
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
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

  const router = useRouter();

  const handlePathaoCourier = (history) => {
    localStorage.setItem('pathaoHistory', JSON.stringify(history));
    router.push('/admin/add/add-pathao-order');
  };

  const showCustomerHistory = async (phone_no) => {
    if (!phone_no) return;
    try {
      setFraudLoad(true);
      const res = await axiosPublic.post('admin/fraud-check', { phone: phone_no });
      setFraudCheck(res.data.overall);
    } catch (error) {
      console.error('❌ Error fetching customer history:', error.message);
    } finally {
      setFraudLoad(false);
    }
  };

  const handleItemClick = (id) => {
    router.push(`show-order-details/${id}`);
  };

  // Courier slugs that mean the order failed/was cancelled — checked
  // case-insensitively so "Cancelled", "cancelled", "Pickup_Cancelled" etc.
  // all resolve the same way instead of only one exact string matching.
  const FAILED_COURIER_SLUGS = ['cancelled', 'pickup_cancelled', 'returned', 'return'];

  const getStatusBadgeColor = (history) => {
    const slug = history?.courierInfo?.order_status_slug?.toLowerCase();

    if (slug) {
      if (FAILED_COURIER_SLUGS.includes(slug))
        return 'bg-red-100 text-red-700 border-red-200';
      if (slug === 'delivered')
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }

    const statusId = history?.deliveryStatus?.id;
    if (statusId > 6) return 'bg-red-100 text-red-700 border-red-200';
    if (statusId === 6) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <>
      <Head>
        <title>Order Management | Admin Panel</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                <FiPackage className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Order Management
              </h1>
            </div>
            <p className="text-gray-600 text-sm ml-14">
              Manage and track all customer orders in one place
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {total.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ৳{Math.round(totalRevenue).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Avg. Order Value
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ৳{Math.round(avgOrderValue).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer, phone, or product..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="relative" ref={columnRef}>
                <button
                  onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 text-sm rounded-xl hover:bg-gray-200 flex items-center gap-2"
                >
                  <FiFilter /> Columns
                </button>

                {/* column configuration  */}
                {columnDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg border border-gray-200 rounded-xl p-3 z-50">
                    {Object.entries(columnConfig).map(([key, value]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between py-1.5 cursor-pointer text-sm"
                      >
                        <span className="capitalize">{key}</span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() =>
                            setColumnConfig((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                          className="w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Hide Cancelled */}
              <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors min-w-fit">
                <input
                  type="checkbox"
                  checked={hideCancelled}
                  onChange={(e) => setHideCancelled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Hide Cancelled
                </span>
              </label>

              {/* Region Filter */}
              <div className="relative min-w-[180px]">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                  value={addressFilter}
                  onChange={(e) => setAddressFilter(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  {addressOptions.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.displayName}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[180px]">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-700 appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Export */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium text-sm min-w-[140px]"
                >
                  <FiDownload className="w-4 h-4" />
                  Export
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      exportDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {exportDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
                    >
                      <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="font-medium">Export as CSV</span>
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="font-medium">Export as Excel</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {loading || isPending ? (
            <Loading />
          ) : sortedOrders.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* table head  */}
                  <thead className="bg-gray-50/80">
                    <tr>
                      {/* order id  */}
                      {columnConfig.id && (
                        <th
                          onClick={() => handleSort('id')}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        >
                          <div className="flex items-center">
                            Order ID
                            <SortIcon columnKey="id" />
                          </div>
                        </th>
                      )}
                      {columnConfig.customer && (
                        <th
                          onClick={() => handleSort('customer')}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        >
                          <div className="flex items-center">
                            Customer
                            <SortIcon columnKey="customer" />
                          </div>
                        </th>
                      )}
                      {columnConfig.phone && (
                        <th
                          onClick={() => handleSort('phone')}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        >
                          <div className="flex items-center">
                            Phone
                            <SortIcon columnKey="phone" />
                          </div>
                        </th>
                      )}
                      {columnConfig.products && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Products
                        </th>
                      )}
                      {columnConfig.price && (
                        <th
                          onClick={() => handleSort('price')}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        >
                          <div className="flex items-center">
                            Price
                            <SortIcon columnKey="price" />
                          </div>
                        </th>
                      )}
                      {columnConfig.payment && (
                        <th
                          onClick={() => handleSort('payment')}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        >
                          <div className="flex items-center">
                            Payment
                            <SortIcon columnKey="payment" />
                          </div>
                        </th>
                      )}
                      {columnConfig.date && (
                        <th
                          onClick={() => handleSort('date')}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        >
                          <div className="flex items-center">
                            Date
                            <SortIcon columnKey="date" />
                          </div>
                        </th>
                      )}
                      {columnConfig.status && (
                        <th
                          onClick={() => handleSort('status')}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        >
                          <div className="flex items-center">
                            Status
                            <SortIcon columnKey="status" />
                          </div>
                        </th>
                      )}
                      {columnConfig.actions && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  {/* table head close */}
                  {/* table body  */}
                  <tbody className="bg-white divide-y divide-gray-100">
                    {sortedOrders.map((group, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        onClick={() => handleItemClick(group.history?.id)}
                        className={`cursor-pointer transition-all duration-200 border-l-4 ${
                          group.history?.courierInfo &&
                          group.history.courierInfo.order_status_slug !==
                            'Pickup_Cancelled' &&
                          group.history.courierInfo.order_status_slug !==
                            'Delivered'
                            ? 'border-l-emerald-400 bg-sky-50 hover:bg-sky-100'
                            : group.history?.courierInfo &&
                              group.history.courierInfo.order_status_slug ===
                                'Pickup_Cancelled'
                            ? 'border-l-red-400 bg-red-50 hover:bg-red-100/50'
                            : group.history.deliveryStatus.id === 6 ||
                              (group.history?.courierInfo &&
                                group.history.courierInfo.order_status_slug ===
                                  'Delivered')
                            ? 'border-l-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                            : group.history.deliveryStatus.id > 6
                            ? 'border-l-red-400 bg-red-50 hover:bg-red-100/50'
                            : group.history.isChecked
                            ? group.history.deliveryStatus.id !== 1
                              ? 'border-l-amber-400 bg-amber-50 hover:bg-amber-100/60'
                              : 'border-l-amber-300 bg-amber-50 hover:bg-amber-100/40'
                            : 'border-l-blue-300 bg-white hover:bg-blue-50/50'
                        }`}
                      >
                        {/* ID */}
                        {columnConfig.id && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900 inline-flex items-center gap-1.5">
                              #{group.history.id}
                              {group.history?.notes && (
                                <FiFileText
                                  className="text-purple-500"
                                  title={`Note: ${group.history.notes}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                            </span>
                          </td>
                        )}

                        {/* Customer Name */}
                        {columnConfig.customer && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              className="px-3 py-2 text-sm text-gray-900 bg-transparent border border-transparent hover:border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              value={
                                group.customer?.name || group.history?.fullName
                              }
                              onClick={(e) => e.stopPropagation()}
                              readOnly
                            />
                          </td>
                        )}

                        {/* Phone */}
                        {columnConfig.phone && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              className="px-3 py-2 text-sm text-gray-700 bg-transparent border border-transparent hover:border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                              value={`${group.history?.phone_no || ''}`}
                              onClick={(e) => e.stopPropagation()}
                              readOnly
                            />
                          </td>
                        )}

                        {/* Products */}
                        {columnConfig.products && (
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                            <div className="flex flex-wrap gap-1.5">
                              {group.orders.map((order, idx) => (
                                <Link
                                  key={idx}
                                  href={`/products/details/${order.product.productId}`}
                                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {order.product.name}
                                </Link>
                              ))}
                            </div>
                          </td>
                        )}

                        {/* Price */}
                        {columnConfig.price && (
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {(() => {
                              const totalPrice =
                                group.orders.reduce(
                                  (acc, order) => acc + (order.totalPrice || 0),
                                  0,
                                ) + (group.history?.deliveryFee || 0);
                              return (
                                <span className="font-medium text-gray-900">
                                  ৳ {totalPrice.toLocaleString('en-BD')}
                                </span>
                              );
                            })()}
                          </td>
                        )}

                        {/* Payment Method */}
                        {columnConfig.payment && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg">
                              {group.history?.paymentMethod?.name || 'N/A'}
                            </span>
                          </td>
                        )}

                        {/* Date */}
                        {columnConfig.date && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                            {new Date(
                              group.history?.BuyingDate,
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                        )}

                        {/* Status */}
                        {columnConfig.status && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusBadgeColor(
                                group.history,
                              )}`}
                            >
                              {group.history?.courierInfo
                                ? group.history.courierInfo.order_status
                                : group.history.deliveryStatus.name}
                            </span>
                          </td>
                        )}

                        {/* Actions */}
                        {columnConfig.actions && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showCustomerHistory(group.history?.phone_no);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-black rounded-lg transition-all shadow-sm hover:shadow"
                              >
                                {fraudLoad ? (
                                  <Loading />
                                ) : (
                                  <>
                                    <FiSearch className="w-3.5 h-3.5" /> History
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePathaoCourier(group);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow"
                              >
                                <FiTruck className="w-3.5 h-3.5" /> Ship
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheck(group.history);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all group ${
                                  group?.history?.isChecked &&
                                  'bg-emerald-300 hover:bg-emerald-200/50'
                                }`}
                              >
                                {group.history.isChecked ? (
                                  <>
                                    <span className="group-hover:hidden inline text-green-700 font-extrabold">
                                      Checked
                                    </span>
                                    <span className="hidden group-hover:inline">
                                      Uncheck
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <FiCheck className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                      Check
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                  {/* table body close */}
                </table>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FiPackage className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or search criteria
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-sm text-gray-700">
          Page {page} of {Math.max(totalPages, 1)} &middot; {total.toLocaleString()} orders
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {fraudCheck && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className=" bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl overflow-hidden transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Customer Order History
              </h2>
              <button
                onClick={() => setFraudCheck(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">
                  Total Orders
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {fraudCheck.total}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Delivered</p>
                <p className="text-xl font-bold text-green-700">
                  {fraudCheck.delivered}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Returned</p>
                <p className="text-xl font-bold text-red-600">
                  {fraudCheck.returned}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">
                  Success Ratio
                </p>
                <p className="text-xl font-bold text-blue-700">
                  {fraudCheck.success_ratio}%
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setFraudCheck(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowOrders;

export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_LOCATION}?countryCode=BD`);
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}
