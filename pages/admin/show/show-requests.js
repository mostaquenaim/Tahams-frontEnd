import React, { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import useRequests from '../../../Hooks/useRequests';
import Loading from '../../../components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faEye, 
  faFilter, 
  faSearch, 
  faSort, 
  faTimesCircle,
  faChevronLeft,
  faChevronRight,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Set app element for accessibility
Modal.setAppElement('#__next');

const ShowRequests = () => {
  const [requests, refetch, isPending] = useRequests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();

  // Filter and sort requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.cart.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.cart.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'approved' && request.isApproved) ||
      (statusFilter === 'pending' && !request.isApproved);
    
    return matchesSearch && matchesStatus;
  });

  // Sort requests
  const sortedRequests = React.useMemo(() => {
    let sortableItems = [...filteredRequests];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Handle nested properties
        const getValue = (obj, key) => {
          if (key.includes('.')) {
            return key.split('.').reduce((o, i) => o[i], obj);
          }
          return obj[key];
        };
        
        const aValue = getValue(a, sortConfig.key);
        const bValue = getValue(b, sortConfig.key);
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRequests, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const confirmApproval = async () => {
    try {
      const response = await axiosSecure.patch(
        '/admin/approve-request',
        { id: parseInt(selectedRequest.id) },
      );

      if (response.data.isApproved) {
        toast.success("Request approved successfully!", { 
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: '#fff',
          }
        });
        refetch();
      } else {
        toast.error("Failed to approve request.", {
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          }
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("An error occurred. Please try again.", {
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        }
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDetails = (req) => {
    router.push(`/admin/show/show-order-details/${req.cart.history.id}`);
  };

  const getHeaderClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? 'sort-asc' : 'sort-desc';
    }
    return '';
  };

  return (
    <>
      <Head>
        <title>Request Management | Admin Dashboard</title>
        <meta name="description" content="Manage cancellation and return requests" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage cancellation and return requests from customers
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-500">Total Requests</h2>
                  <p className="text-2xl font-semibold text-gray-900">{requests.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3">
                  <FontAwesomeIcon icon={faFilter} className="text-yellow-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-500">Pending Requests</h2>
                  <p className="text-2xl font-semibold text-gray-900">
                    {requests.filter(r => !r.isApproved).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-500">Approved Requests</h2>
                  <p className="text-2xl font-semibold text-gray-900">
                    {requests.filter(r => r.isApproved).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
                
                <select
                  className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isPending ? (
              <div className="py-12">
                <Loading />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center">
                            ID
                            <FontAwesomeIcon icon={faSort} className={`ml-1 ${getHeaderClass('id') ? 'text-blue-500' : 'text-gray-300'}`} />
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('cart.customer.name')}
                        >
                          <div className="flex items-center">
                            Customer
                            <FontAwesomeIcon icon={faSort} className={`ml-1 ${getHeaderClass('cart.customer.name') ? 'text-blue-500' : 'text-gray-300'}`} />
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('cart.ProductName')}
                        >
                          <div className="flex items-center">
                            Product
                            <FontAwesomeIcon icon={faSort} className={`ml-1 ${getHeaderClass('cart.ProductName') ? 'text-blue-500' : 'text-gray-300'}`} />
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center">
                            Qty
                            <FontAwesomeIcon icon={faSort} className={`ml-1 ${getHeaderClass('quantity') ? 'text-blue-500' : 'text-gray-300'}`} />
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Reason
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{request.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {request.cart.customer.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="max-w-xs truncate">{request.cart.ProductName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {request.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                request.isApproved 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                              <div className="truncate" title={request.reason}>
                                {request.reason}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {!request.isApproved ? (
                                  <button
                                    onClick={() => handleApproveClick(request)}
                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                                    title="Approve request"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <span className="text-green-600 bg-green-50 px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center">
                                    Approved
                                    <FontAwesomeIcon icon={faCheckCircle} className="ml-1" />
                                  </span>
                                )}
                                <button 
                                  onClick={() => handleDetails(request)}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                                  title="View details"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <FontAwesomeIcon icon={faFilter} className="h-12 w-12 mb-4" />
                              <p className="text-lg font-medium">No requests found</p>
                              <p className="mt-1 text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(indexOfLastItem, sortedRequests.length)}
                          </span> of{' '}
                          <span className="font-medium">{sortedRequests.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">Previous</span>
                            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">Next</span>
                            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Confirm Approval"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 mx-auto shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirm Approval</h3>
                <p className="text-sm text-gray-500">Are you sure you want to approve this request?</p>
              </div>
            </div>
            
            {selectedRequest && (
              <div className="bg-gray-50 p-4 rounded-md mb-4 text-sm">
                <p><span className="font-medium">Request ID:</span> #{selectedRequest.id}</p>
                <p><span className="font-medium">Customer:</span> {selectedRequest.cart.customer.name}</p>
                <p><span className="font-medium">Product:</span> {selectedRequest.cart.ProductName}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmApproval}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </Modal>
      </div>
      
      <style jsx global>{`
        .sort-asc {
          transform: rotate(180deg);
        }
        .sort-desc {
          transform: rotate(0deg);
        }
      `}</style>
    </>
  );
};

export default ShowRequests;