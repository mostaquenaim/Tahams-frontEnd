import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Loading from '../../../components/Loading';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useProduct from '../../../Hooks/useProduct';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Modal from 'react-modal';
import {
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiSave,
  FiX,
  FiSearch,
  FiPlus,
} from 'react-icons/fi';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaSync } from 'react-icons/fa';

Modal.setAppElement('#__next');

const ShowProducts = () => {
  const { user, loading } = useContext(AuthContext);
  const [products, refetch] = useProduct({ publishable: true });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editedProducts, setEditedProducts] = useState({});
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [token, setToken] = useState('');

  useEffect(() => {
    const at = localStorage.getItem('access_token');
    setToken(at);
  }, []);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending',
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        // Handle different data types
        if (sortConfig.key === 'price') {
          if (a.sellingPrice < b.sellingPrice) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a.sellingPrice > b.sellingPrice) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else if (sortConfig.key === 'stock') {
          const aStock = a.pscs.reduce((acc, psc) => acc + psc.quantity, 0);
          const bStock = b.pscs.reduce((acc, psc) => acc + psc.quantity, 0);
          if (aStock < bStock) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aStock > bStock) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else if (sortConfig.key === 'views') {
          if ((a.totalViews || 0) < (b.totalViews || 0)) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if ((a.totalViews || 0) > (b.totalViews || 0)) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else {
          // Default string comparison
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }

    return sortableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDuplicate = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      console.error('Product not found for duplication');
      return;
    }

    const duplicatedProduct = {
      buyingPrice: product.buyingPrice,
      color: product.color,
      description: product.description,
      discountPercentage: product.discountPercentage,
      fabric: product.fabric,
      filename: product.filename,
      ifStock: product.ifStock,
      longDescription: product.longDescription,
      name: product.name + ' Copy',
      note: product.note,
      pscs: product.pscs,
      sellingPrice: product.sellingPrice,
      serialNo: product.serialNo,
      tags: product.tags,
      vatPercentage: product.vatPercentage,
    };

    localStorage.removeItem('duplicate_product_data');
    localStorage.setItem(
      'duplicate_product_data',
      JSON.stringify(duplicatedProduct),
    );
    router.push('/admin/add/add-product');
  };

  const openDeleteModal = (id) => {
    setSelectedProduct(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        await axiosPublic.delete(
          `/admin/delete-product/${selectedProduct}?email=${user?.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        refetch();
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleQuantityChange = (productId, pscId, change) => {
    setEditedProducts((prev) => {
      const product = prev[productId] || {};
      const updatedSizes = {
        ...product,
        [pscId]: (product[pscId] || 0) + change,
      };
      return {
        ...prev,
        [productId]: updatedSizes,
      };
    });
  };

  const handleCancel = (productId) => {
    setEditedProducts((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const handleSave = async (productId) => {
    const updates = editedProducts[productId];
    try {
      await axiosPublic.put(`/admin/update-product-stock/${productId}`, {
        stockChanges: updates,
        email: user?.email,
      });
      refetch();
      setEditedProducts((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  };

  const handleSyncViews = async () => {
    try {
      setSyncing(true);
      const response = await axiosSecure.get('/admin/sync-view-count');
    // console.log('Sync view count response:', response.data);
    } catch (error) {
      console.error('Error fetching sync view count:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Head>
        <title>Product Management | Admin Panel</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Product Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage your product inventory and details
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link
              href="/admin/add/add-product"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={16} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Sync Button */}
        <div className="mb-4 flex justify-end">
          {/* <button
            onClick={handleSyncViews}
            disabled={syncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${syncing ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors`}
          >
            {syncing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <FaSync size={14} />
                Sync Views
              </>
            )}
          </button> */}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loading />
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('id')}
                      >
                        <div className="flex items-center">
                          ID
                          {sortConfig.key === 'id' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          Product
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('views')}
                      >
                        <div className="flex items-center">
                          Views
                          {sortConfig.key === 'views' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('price')}
                      >
                        <div className="flex items-center">
                          Price
                          {sortConfig.key === 'price' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('stock')}
                      >
                        <div className="flex items-center">
                          Stock
                          {sortConfig.key === 'stock' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentProducts.map((product, index) => {
                      const totalStock = product.pscs.reduce(
                        (acc, psc) => acc + psc.quantity,
                        0,
                      );
                      const productChanges = editedProducts[product.id] || {};

                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={
                            totalStock > 0
                              ? 'hover:bg-gray-50'
                              : 'bg-red-50 hover:bg-red-100'
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{product.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {product.filename ? (
                                  <img
                                    className="h-10 w-10 rounded"
                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.filename}`}
                                    alt={product.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                      No Image
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <Link
                                  href={`/products/details/${product.productId}`}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {product.name}
                                </Link>
                                <div className="text-sm text-gray-500">
                                  {product.color?.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product?.totalViews || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {product.pscs[0]?.category?.name},{' '}
                              {product.pscs[0]?.size?.name}
                              {product.pscs.length > 1 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  +{product.pscs.length - 1} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ৳{product.sellingPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {totalStock > 0 ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {totalStock} in stock
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Out of stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/admin/edit/product/${product.productId}`}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                              >
                                <FiEdit2 size={14} />
                                Edit
                              </Link>
                              <button
                                onClick={() => openDeleteModal(product.id)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <FiTrash2 size={14} />
                                Delete
                              </button>
                              <button
                                onClick={() => handleDuplicate(product.id)}
                                className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                              >
                                <FiCopy size={14} />
                                Duplicate
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredProducts.length,
                        )}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">
                        {filteredProducts.length}
                      </span>{' '}
                      products
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        Previous
                      </button>
                      <div className="flex items-center px-4">
                        <span className="text-sm text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No products found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Confirm Delete"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: transparent;
          border: none;
          outline: none;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default ShowProducts;
