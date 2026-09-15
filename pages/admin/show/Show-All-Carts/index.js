import { useState, useMemo } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiImage,
  FiShoppingCart,
} from 'react-icons/fi';
import useCart from '/Hooks/useCart';
import {
  AdminPage,
  Badge,
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
} from '/components/Admin';

const COLUMN_COUNT = 9;

const ShowAllCarts = () => {
  const [isLoading, cart, refetch] = useCart();
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

  const boughtCount = useMemo(
    () => cart.filter((item) => item.isBought).length,
    [cart],
  );

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

  const formatShortDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace('BDT', '৳');
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
    <AdminPage title="Carts">
      <PageHeader
        title="Carts"
        description="Items customers have added to their carts."
      />

      <StatGrid cols={3}>
        <StatCard
          label="Cart items"
          value={cart.length.toLocaleString()}
          icon={<FiShoppingCart />}
        />
        <StatCard
          label="Bought"
          value={boughtCount.toLocaleString()}
          icon={<FiCheckCircle />}
          tone="success"
        />
        <StatCard
          label="Still in cart"
          value={(cart.length - boughtCount).toLocaleString()}
          icon={<FiClock />}
          tone="warning"
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
              placeholder="Search by product, email or cart ID..."
            />
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
              width="w-full sm:w-40"
              aria-label="Status"
            >
              <option value="all">All statuses</option>
              <option value="bought">Bought</option>
              <option value="pending">Pending</option>
            </Select>
          </>
        }
        footer={
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredCarts.length}
            pageSize={itemsPerPage}
            onPageChange={goToPage}
            pageSizeOptions={[5, 10, 25, 50]}
            onPageSizeChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
            itemLabel="cart items"
          />
        }
      >
        <Table>
          <THead>
            <Th>Cart</Th>
            {sortableTh('ProductName', 'Product')}
            <Th>Category</Th>
            <Th>Size</Th>
            {sortableTh('quantity', 'Qty', 'right')}
            {sortableTh('price', 'Price', 'right')}
            <Th>Status</Th>
            {sortableTh('date', 'Added')}
            <Th>Customer</Th>
          </THead>
          <TBody>
            {isLoading ? (
              <SkeletonRows rows={8} cols={COLUMN_COUNT} />
            ) : currentCarts.length === 0 ? (
              <TableEmpty
                colSpan={COLUMN_COUNT}
                icon={<FiShoppingCart />}
                title="No carts found"
                description="Try a different search or status."
              />
            ) : (
              currentCarts.map((item) => (
                <Tr key={item.id}>
                  <Td nowrap>
                    <p className="font-medium text-gray-900">#{item.id}</p>
                    <p
                      className="max-w-[7.5rem] truncate text-xs text-gray-500"
                      title={item.uniqueId}
                    >
                      {item.uniqueId}
                    </p>
                  </Td>
                  <Td>
                    <div className="flex min-w-[14rem] items-center gap-3">
                      {item.product?.thumbImage ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.product.thumbImage}`}
                          alt={item.product?.name}
                          className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <FiImage className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="max-w-[14rem] truncate font-medium text-gray-900">
                          {item.ProductName || item.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Serial: {item.product?.serialNo || '—'}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td nowrap>
                    <p className="text-gray-900">
                      {item.category?.category?.category?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.category?.category?.name} → {item.category?.name}
                    </p>
                  </Td>
                  <Td nowrap>
                    <Badge>
                      {item.size || item.maleSize || item.femaleSize || 'N/A'}
                    </Badge>
                  </Td>
                  <Td
                    nowrap
                    align="right"
                    className="font-medium tabular-nums text-gray-900"
                  >
                    {item.Quantity}
                  </Td>
                  <Td nowrap align="right">
                    <p className="font-medium tabular-nums text-gray-900">
                      {formatPrice(
                        item.totalPrice ||
                          item.product?.sellingPrice * item.Quantity,
                      )}
                    </p>
                    {item.product?.discountPercentage > 0 && (
                      <p className="text-xs text-emerald-600">
                        {item.product.discountPercentage}% off
                      </p>
                    )}
                  </Td>
                  <Td nowrap>
                    <Badge tone={item.isBought ? 'success' : 'warning'} dot>
                      {item.isBought ? 'Bought' : 'Pending'}
                    </Badge>
                  </Td>
                  <Td nowrap className="text-gray-600">
                    {formatDate(item.created_at)}
                  </Td>
                  <Td nowrap>
                    <p className="max-w-[14rem] truncate text-gray-700">
                      {item.customer?.email || '—'}
                    </p>
                    {item.customer?.created_at && (
                      <p className="text-xs text-gray-500">
                        Joined {formatShortDate(item.customer.created_at)}
                      </p>
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </TableCard>
    </AdminPage>
  );
};

export default ShowAllCarts;
