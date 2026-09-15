import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiInbox,
  FiRotateCcw,
} from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useRequests from '../../../Hooks/useRequests';
import {
  AdminPage,
  Badge,
  Button,
  IconButton,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  SkeletonRows,
  StatCard,
  StatGrid,
  TBody,
  THead,
  Table,
  TableCard,
  TableEmpty,
  Td,
  Th,
  Tr,
} from '../../../components/Admin';

const ShowRequests = () => {
  const [requests, refetch, isPending] = useRequests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approving, setApproving] = useState(false);
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

  const pendingCount = requests.filter(r => !r.isApproved).length;

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
    setApproving(true);
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
      setApproving(false);
      setIsModalOpen(false);
    }
  };

  const handleDetails = (req) => {
    router.push(`/admin/show/show-order-details/${req.cart.history.id}`);
  };

  const sortableTh = (key, label, align) => (
    <Th
      sortable
      align={align}
      active={sortConfig.key === key}
      direction={sortConfig.direction}
      onSort={() => handleSort(key)}
    >
      {label}
    </Th>
  );

  return (
    <AdminPage title="Cancel & return requests">
      <PageHeader
        title="Cancel & return requests"
        description="Review and approve cancellation and return requests from customers."
      />

      <StatGrid cols={3}>
        <StatCard
          label="Total requests"
          value={requests.length.toLocaleString()}
          icon={<FiRotateCcw />}
        />
        <StatCard
          label="Pending"
          value={pendingCount.toLocaleString()}
          icon={<FiClock />}
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={(requests.length - pendingCount).toLocaleString()}
          icon={<FiCheckCircle />}
          tone="success"
        />
      </StatGrid>

      <TableCard
        toolbar={
          <>
            <SearchInput
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer, product, reason or ID..."
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              width="w-full sm:w-40"
              aria-label="Status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </Select>
          </>
        }
        footer={
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={sortedRequests.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            pageSizeOptions={[5, 10, 25, 50]}
            onPageSizeChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
            itemLabel="requests"
          />
        }
      >
        <Table>
          <THead>
            {sortableTh('id', 'ID')}
            {sortableTh('cart.customer.name', 'Customer')}
            {sortableTh('cart.ProductName', 'Product')}
            {sortableTh('quantity', 'Qty', 'right')}
            <Th>Status</Th>
            <Th>Reason</Th>
            <Th align="right">Actions</Th>
          </THead>
          <TBody>
            {isPending ? (
              <SkeletonRows rows={6} cols={7} />
            ) : currentItems.length === 0 ? (
              <TableEmpty
                colSpan={7}
                icon={<FiInbox />}
                title="No requests found"
                description="Try adjusting your search or filter criteria."
              />
            ) : (
              currentItems.map((request) => (
                <Tr key={request.id}>
                  <Td nowrap className="font-semibold text-gray-900">
                    #{request.id}
                  </Td>
                  <Td nowrap className="font-medium text-gray-900">
                    {request.cart.customer.name || '—'}
                  </Td>
                  <Td>
                    <p className="max-w-xs truncate" title={request.cart.ProductName}>
                      {request.cart.ProductName}
                    </p>
                  </Td>
                  <Td nowrap align="right" className="tabular-nums">
                    {request.quantity}
                  </Td>
                  <Td nowrap>
                    <Badge tone={request.isApproved ? 'success' : 'warning'} dot>
                      {request.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </Td>
                  <Td>
                    <p className="max-w-xs truncate text-gray-600" title={request.reason}>
                      {request.reason}
                    </p>
                  </Td>
                  <Td nowrap align="right">
                    <div className="flex items-center justify-end gap-1">
                      {!request.isApproved && (
                        <Button
                          size="sm"
                          icon={<FiCheck />}
                          onClick={() => handleApproveClick(request)}
                        >
                          Approve
                        </Button>
                      )}
                      <IconButton
                        label="View order"
                        icon={<FiEye />}
                        onClick={() => handleDetails(request)}
                      />
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </TableCard>

      {/* Confirmation Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={<FiCheckCircle />}
        tone="success"
        title="Approve this request?"
        description="The request will be marked as approved."
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="success" loading={approving} onClick={confirmApproval}>
              Approve request
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 rounded-lg bg-gray-50 p-4 text-sm">
            <dt className="text-gray-500">Request</dt>
            <dd className="font-medium text-gray-900">#{selectedRequest.id}</dd>
            <dt className="text-gray-500">Customer</dt>
            <dd className="font-medium text-gray-900">
              {selectedRequest.cart.customer.name}
            </dd>
            <dt className="text-gray-500">Product</dt>
            <dd className="font-medium text-gray-900">
              {selectedRequest.cart.ProductName}
            </dd>
          </dl>
        )}
      </Modal>
    </AdminPage>
  );
};

export default ShowRequests;
