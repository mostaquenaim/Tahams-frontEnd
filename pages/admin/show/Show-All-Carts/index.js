import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Package,
  ShoppingCart,
} from 'lucide-react';
import useCart from '/Hooks/useCart';

const ShowAllCarts = () => {
  const [isLoading, cart, refetch] = useCart();
//   console.log(cart);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filter and search logic
  const filteredCarts = useMemo(() => {
    let result = cart.filter((item) => {
      const matchesSearch =
        item.ProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'bought' && item.isBought) ||
        (filterStatus === 'pending' && !item.isBought);

      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal;
        let bVal;

        switch (sortConfig.key) {
          case 'price':
            aVal = a.totalPrice || a.product?.sellingPrice * a.Quantity;
            bVal = b.totalPrice || b.product?.sellingPrice * b.Quantity;
            break;

          case 'date':
            aVal = new Date(a.created_at);
            bVal = new Date(b.created_at);
            break;

          case 'quantity':
            aVal = a.Quantity;
            bVal = b.Quantity;
            break;

          default:
            aVal = a[sortConfig.key];
            bVal = b[sortConfig.key];
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [cart, searchTerm, filterStatus, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCarts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCarts = filteredCarts.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace('BDT', '৳');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Cart Management
            </h1>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name, cart ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="bought">Bought</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>
                Total Carts: <strong>{filteredCarts.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>
                Showing:{' '}
                <strong>
                  {startIndex + 1}-{Math.min(endIndex, filteredCarts.length)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cart ID
                  </th>
                  <th
                    onClick={() => handleSort('ProductName')}
                    className="px-4 py-3 cursor-pointer select-none text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Product{' '}
                    {sortConfig.key === 'ProductName' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th
                    onClick={() => handleSort('quantity')}
                    className="px-4 py-3 cursor-pointer select-none text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Qty{' '}
                    {sortConfig.key === 'quantity' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>

                  <th
                    onClick={() => handleSort('price')}
                    className="px-4 py-3 cursor-pointer select-none text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Price{' '}
                    {sortConfig.key === 'price' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-4 py-3 cursor-pointer select-none text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Date{' '}
                    {sortConfig.key === 'date' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCarts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No carts found</p>
                    </td>
                  </tr>
                ) : (
                  currentCarts.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            #{item.id}
                          </div>
                          <div
                            className="text-xs text-gray-500 truncate max-w-[120px]"
                            title={item.uniqueId}
                          >
                            {item.uniqueId?.substring(0, 13)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              `${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.product?.thumbImage}` ||
                              'https://via.placeholder.com/60'
                            }
                            alt={item.product?.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {item.ProductName || item.product?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Serial: {item.product?.serialNo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {item.category?.category?.category?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.category?.category?.name} →{' '}
                          {item.category?.name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.size ||
                            item.maleSize ||
                            item.femaleSize ||
                            'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.Quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            {formatPrice(
                              item.totalPrice ||
                                item.product?.sellingPrice * item.Quantity,
                            )}
                          </div>
                          {item.product?.discountPercentage > 0 && (
                            <div className="text-xs text-green-600">
                              {item.product.discountPercentage}% off
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isBought
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {item.isBought ? '✓ Bought' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(item.customer.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {(item.customer.email)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(endIndex, filteredCarts.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredCarts.length}</span>{' '}
                  results
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowAllCarts;
