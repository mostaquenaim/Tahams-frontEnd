import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  FiBarChart2,
  FiCheck,
  FiClock,
  FiColumns,
  FiCopy,
  FiDownload,
  FiFileText,
  FiGrid,
  FiMessageSquare,
  FiPackage,
  FiTrendingUp,
  FiTruck,
  FiX,
} from 'react-icons/fi';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useGroupOrders from '../../../Hooks/useGroupOrders';
import { getOrderStatus } from '../../../utils/orderStatus';
import {
  AdminPage,
  Badge,
  Button,
  CheckToggle,
  CheckboxField,
  Dropdown,
  DropdownCheckbox,
  DropdownItem,
  DropdownLabel,
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
  ToolbarSpacer,
  Tr,
  cx,
} from '../../../components/Admin';

const PAGE_SIZE = 50;

// Display order of the table columns; also drives the "Columns" menu.
const COLUMNS = [
  { key: 'id', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'products', label: 'Products' },
  { key: 'price', label: 'Total' },
  { key: 'payment', label: 'Payment' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
];

const SORTABLE_COLUMNS = new Set([
  'id',
  'customer',
  'phone',
  'price',
  'payment',
  'date',
  'status',
]);

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Order Placed', label: 'Order Placed' },
  { value: 'Order Received', label: 'Order Received' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const getOrderTotal = (group) =>
  group.orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0) +
  (group.history?.deliveryFee || 0);

const getCustomerName = (group) =>
  group.customer?.name || group.history?.fullName;

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const NOTE_POPOVER_WIDTH = 288;

const getNotePosition = (button) => {
  const rect = button.getBoundingClientRect();
  const left = Math.max(
    16,
    Math.min(rect.left, window.innerWidth - NOTE_POPOVER_WIDTH - 16),
  );
  // Open upwards when there isn't room below the button.
  return rect.bottom + 240 > window.innerHeight
    ? { bottom: window.innerHeight - rect.top + 8, left }
    : { top: rect.bottom + 8, left };
};

const ShowOrders = ({ data }) => {
  const { loading } = useContext(AuthContext);
  const router = useRouter();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const addressOptions = data?.module || [];

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addressFilter, setAddressFilter] = useState('all');
  const [hideCancelled, setHideCancelled] = useState(false);
  const [page, setPage] = useState(1);

  const [fraudCheck, setFraudCheck] = useState(null);
  const [fraudLoadId, setFraudLoadId] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnConfig, setColumnConfig] = useState({
    id: true,
    customer: true,
    phone: true,
    price: true,
    products: true,
    payment: true,
    date: true,
    status: true,
    notes: true,
    actions: true,
  });

  // Admin notes are written on the order details page; this list only shows
  // them. Only one note popover is open at a time, tracked by order id.
  const [openNoteId, setOpenNoteId] = useState(null);
  const [notePosition, setNotePosition] = useState({ top: 0, left: 0 });
  const noteButtonRefs = useRef({});
  const notePopoverRef = useRef(null);
  const tableScrollRef = useRef(null);

  useEffect(() => {
    if (openNoteId === null) return;

    const scrollContainer = tableScrollRef.current;

    const updatePosition = () => {
      const button = noteButtonRefs.current[openNoteId];
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const containerRect = scrollContainer?.getBoundingClientRect();

      // button ta table-er visible area-r baire chole gele, popup bondho kore dao
      if (
        containerRect &&
        (rect.left < containerRect.left || rect.right > containerRect.right)
      ) {
        setOpenNoteId(null);
        return;
      }

      setNotePosition(getNotePosition(button));
    };

    const handlePointerDown = (event) => {
      const button = noteButtonRefs.current[openNoteId];
      if (
        notePopoverRef.current?.contains(event.target) ||
        button?.contains(event.target)
      ) {
        return;
      }
      setOpenNoteId(null);
    };

    const handleKey = (event) => event.key === 'Escape' && setOpenNoteId(null);

    scrollContainer?.addEventListener('scroll', updatePosition);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKey);

    return () => {
      scrollContainer?.removeEventListener('scroll', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [openNoteId]);

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
  } = useGroupOrders(page, PAGE_SIZE, true, false, {
    search: searchTerm,
    status: statusFilter,
    region: addressFilter,
    hideCancelled,
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorting only reorders the rows on the current page.
  const sortedOrders = useMemo(() => {
    const sortableOrders = [...(sortedGroupedOrdersArray || [])];

    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        let aValue;
        let bValue;

        switch (sortConfig.key) {
          case 'id':
            aValue = a.history.id;
            bValue = b.history.id;
            break;
          case 'customer':
            aValue = (getCustomerName(a) || '').toLowerCase();
            bValue = (getCustomerName(b) || '').toLowerCase();
            break;
          case 'phone':
            aValue = a.history?.phone_no || '';
            bValue = b.history?.phone_no || '';
            break;
          case 'price':
            aValue = getOrderTotal(a);
            bValue = getOrderTotal(b);
            break;
          case 'date':
            aValue = new Date(a.history?.BuyingDate).getTime();
            bValue = new Date(b.history?.BuyingDate).getTime();
            break;
          case 'status':
            aValue = (a.history?.deliveryStatus?.name || '').toLowerCase();
            bValue = (b.history?.deliveryStatus?.name || '').toLowerCase();
            break;
          case 'payment':
            aValue = (a.history?.paymentMethod?.name || '').toLowerCase();
            bValue = (b.history?.paymentMethod?.name || '').toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortableOrders;
  }, [sortedGroupedOrdersArray, sortConfig]);

  const visibleColumns = COLUMNS.filter((column) => columnConfig[column.key]);

  const toggleColumn = (key) =>
    setColumnConfig((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleCheck = async (history) => {
    setCheckingId(history.id);
    try {
      await axiosSecure.patch(
        `admin/update-history/${history.trackingToken}`,
        {
          isChecked: !history.isChecked,
          checkedDate: new Date().toISOString(),
        },
      );
      await refetch();
    } catch (error) {
      console.error('Error updating checked state:', error);
    } finally {
      setCheckingId(null);
    }
  };

  const handleExport = (type) => {
    if (!sortedOrders.length) return;

    const exportData = sortedOrders.map((order) => ({
      'Order ID': order.history.id,

      ...(columnConfig.customer && {
        Customer: getCustomerName(order),
      }),

      ...(columnConfig.phone && {
        Phone: String(order.history?.phone_no || ''),
      }),

      ...(columnConfig.products && {
        Products: order.orders
          .map((o) => o.product?.name || 'Unavailable product')
          .join(', '),
      }),

      ...(columnConfig.price && {
        Total: getOrderTotal(order),
      }),

      ...(columnConfig.payment && {
        Payment: order.history?.paymentMethod?.name || 'N/A',
      }),

      ...(columnConfig.date && {
        Date: new Date(order.history?.BuyingDate).toLocaleDateString(),
      }),

      ...(columnConfig.status && {
        Status: getOrderStatus(order.history).label,
      }),

      ...(columnConfig.notes && {
        Notes: order.history?.adminNote || '',
      }),
    }));

    if (type === 'csv') {
      exportToCSV(exportData);
    } else {
      exportToExcel(exportData);
    }
  };

  const exportToCSV = (rows) => {
    const headers = Object.keys(rows[0]).join(',');
    const lines = rows.map((obj) =>
      Object.values(obj)
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [headers, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportToExcel = (rows, filename = 'orders.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const handlePathaoCourier = (group) => {
    localStorage.setItem('pathaoHistory', JSON.stringify(group));
    router.push('/admin/add/add-pathao-order');
  };

  const showCustomerHistory = async (group) => {
    const phone = group.history?.phone_no;
    if (!phone) return;
    try {
      setFraudLoadId(group.history.id);
      const res = await axiosPublic.post('admin/fraud-check', { phone });
      setFraudCheck({
        ...res.data.overall,
        phone,
        name: getCustomerName(group),
      });
    } catch (error) {
      console.error('❌ Error fetching customer history:', error.message);
    } finally {
      setFraudLoadId(null);
    }
  };

  const copyPhone = async (orderId, phone) => {
    try {
      await navigator.clipboard.writeText(String(phone));
      setCopiedId(orderId);
      setTimeout(
        () => setCopiedId((current) => (current === orderId ? null : current)),
        1500,
      );
    } catch (error) {
      console.error('Could not copy phone number:', error);
    }
  };

  const handleItemClick = (id) => {
    router.push(`show-order-details/${id}`);
  };

  const renderCell = (key, group, status) => {
    const { history } = group;

    switch (key) {
      case 'id':
        return (
          <Td key={key} nowrap>
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  'h-2 w-2 shrink-0 rounded-full',
                  history.isChecked ? 'bg-transparent' : 'bg-sky-500',
                )}
                title={history.isChecked ? undefined : 'Not checked yet'}
              />
              <span className="font-semibold text-gray-900">
                #{history.id}
              </span>
              {history?.notes && (
                <FiFileText
                  className="h-3.5 w-3.5 text-gray-400"
                  title={`Customer note: ${history.notes}`}
                />
              )}
            </div>
          </Td>
        );

      case 'customer':
        return (
          <Td key={key} nowrap>
            <span className="font-medium text-gray-900">
              {getCustomerName(group) || '—'}
            </span>
          </Td>
        );

      case 'phone':
        return (
          <Td key={key} nowrap onClick={(e) => e.stopPropagation()}>
            {history?.phone_no ? (
              <div className="flex items-center gap-1">
                <span className="select-all tabular-nums text-gray-700">
                  {history.phone_no}
                </span>
                <IconButton
                  size="sm"
                  label={copiedId === history.id ? 'Copied' : 'Copy phone'}
                  icon={
                    copiedId === history.id ? (
                      <FiCheck className="text-emerald-600" />
                    ) : (
                      <FiCopy />
                    )
                  }
                  onClick={() => copyPhone(history.id, history.phone_no)}
                  className="text-gray-400"
                />
              </div>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </Td>
        );

      case 'products':
        return (
          <Td key={key} className="min-w-[14rem] max-w-sm">
            <div className="flex flex-wrap gap-1">
              {group.orders.map((order, idx) => {
                const name = order.product?.name || 'Unavailable product';
                return (
                  <Link
                    key={idx}
                    href={`/products/details/${order.product?.productId}`}
                    onClick={(e) => e.stopPropagation()}
                    title={name}
                    className="max-w-[14rem] truncate rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
          </Td>
        );

      case 'price':
        return (
          <Td
            key={key}
            nowrap
            align="right"
            className="font-medium tabular-nums text-gray-900"
          >
            ৳{getOrderTotal(group).toLocaleString('en-BD')}
          </Td>
        );

      case 'payment':
        return (
          <Td key={key} nowrap>
            <Badge>{history?.paymentMethod?.name || 'N/A'}</Badge>
          </Td>
        );

      case 'date':
        return (
          <Td key={key} nowrap className="text-gray-600">
            {formatDate(history?.BuyingDate)}
          </Td>
        );

      case 'status':
        return (
          <Td key={key} nowrap>
            <div className="flex items-center gap-1.5">
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
              {history?.courierInfo && (
                <FiTruck
                  className="h-3.5 w-3.5 text-gray-400"
                  title="Handed to courier"
                />
              )}
            </div>
          </Td>
        );

      case 'notes': {
        const hasNote = Boolean(history?.adminNote?.trim());
        const isOpen = openNoteId === history.id;
        return (
          <Td key={key} nowrap onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              ref={(el) => (noteButtonRefs.current[history.id] = el)}
              onClick={(e) => {
                if (!isOpen) setNotePosition(getNotePosition(e.currentTarget));
                setOpenNoteId(isOpen ? null : history.id);
              }}
              aria-label={hasNote ? 'View note' : 'No note'}
              aria-expanded={isOpen}
              title={hasNote ? 'View note' : 'No note'}
              className={cx(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors [&_svg]:h-4 [&_svg]:w-4',
                hasNote
                  ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                  : 'border-transparent text-gray-300 hover:bg-gray-100 hover:text-gray-500',
                isOpen && 'ring-2 ring-gray-900/10',
              )}
            >
              <FiMessageSquare />
            </button>
          </Td>
        );
      }

      case 'actions':
        return (
          <Td key={key} nowrap onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                icon={<FiClock />}
                loading={fraudLoadId === history.id}
                disabled={!history?.phone_no}
                onClick={() => showCustomerHistory(group)}
                title="Delivery history for this phone number"
              >
                History
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<FiTruck />}
                onClick={() => handlePathaoCourier(group)}
              >
                Ship
              </Button>
              <CheckToggle
                checked={history.isChecked}
                loading={checkingId === history.id}
                onClick={() => handleCheck(history)}
              />
            </div>
          </Td>
        );

      default:
        return null;
    }
  };

  const isLoading = loading || isPending;
  const openNoteGroup =
    openNoteId !== null &&
    sortedOrders.find((group) => group.history.id === openNoteId);
  const openNoteText = openNoteGroup?.history?.adminNote;
  const successRatio = Number(fraudCheck?.success_ratio) || 0;

  return (
    <AdminPage title="Orders">
      <PageHeader
        title="Orders"
        description="Review, check and ship customer orders."
        actions={
          <Dropdown
            label="Export"
            icon={<FiDownload />}
            disabled={!sortedOrders.length}
          >
            <DropdownLabel>Current page</DropdownLabel>
            <DropdownItem
              icon={<FiFileText />}
              onClick={() => handleExport('csv')}
            >
              Export as CSV
            </DropdownItem>
            <DropdownItem icon={<FiGrid />} onClick={() => handleExport('excel')}>
              Export as Excel
            </DropdownItem>
          </Dropdown>
        }
      />

      <StatGrid cols={3}>
        <StatCard
          label="Total orders"
          value={(total || 0).toLocaleString()}
          icon={<FiPackage />}
        />
        <StatCard
          label="Total revenue"
          value={`৳${Math.round(totalRevenue || 0).toLocaleString()}`}
          icon={<FiBarChart2 />}
          tone="success"
        />
        <StatCard
          label="Avg. order value"
          value={`৳${Math.round(avgOrderValue || 0).toLocaleString()}`}
          icon={<FiTrendingUp />}
          tone="info"
        />
      </StatGrid>

      <TableCard
        scrollRef={tableScrollRef}
        toolbar={
          <>
            <SearchInput
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Search by customer, phone or product..."
            />
            <Select
              value={addressFilter}
              onValueChange={setAddressFilter}
              aria-label="Region"
            >
              <option value="all">All regions</option>
              {addressOptions.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.displayName}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              aria-label="Status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <CheckboxField
              label="Hide cancelled"
              checked={hideCancelled}
              onChange={(e) => setHideCancelled(e.target.checked)}
            />
            <ToolbarSpacer />
            <Dropdown
              label="Columns"
              icon={<FiColumns />}
              closeOnSelect={false}
              width="w-52"
            >
              <DropdownLabel>Visible columns</DropdownLabel>
              {COLUMNS.map((column) => (
                <DropdownCheckbox
                  key={column.key}
                  checked={columnConfig[column.key]}
                  onChange={() => toggleColumn(column.key)}
                  disabled={
                    columnConfig[column.key] && visibleColumns.length === 1
                  }
                >
                  {column.label}
                </DropdownCheckbox>
              ))}
            </Dropdown>
          </>
        }
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="orders"
          />
        }
      >
        <Table accented>
          <THead>
            {visibleColumns.map((column) => (
              <Th
                key={column.key}
                align={column.key === 'price' ? 'right' : 'left'}
                sortable={SORTABLE_COLUMNS.has(column.key)}
                active={sortConfig.key === column.key}
                direction={sortConfig.direction}
                onSort={() => handleSort(column.key)}
              >
                {column.label}
              </Th>
            ))}
          </THead>
          <TBody>
            {isLoading ? (
              <SkeletonRows rows={8} cols={visibleColumns.length} />
            ) : sortedOrders.length === 0 ? (
              <TableEmpty
                colSpan={visibleColumns.length}
                icon={<FiPackage />}
                title="No orders found"
                description="Try a different search or clear the filters."
              />
            ) : (
              sortedOrders.map((group) => {
                const status = getOrderStatus(group.history);
                return (
                  <Tr
                    key={group.history.id}
                    accent={status.tone}
                    onClick={() => handleItemClick(group.history?.id)}
                  >
                    {visibleColumns.map((column) =>
                      renderCell(column.key, group, status),
                    )}
                  </Tr>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>

      {openNoteGroup && (
        <div
          ref={notePopoverRef}
          role="dialog"
          aria-label={`Note for order #${openNoteGroup.history.id}`}
          style={notePosition}
          className="fixed z-30 w-72 rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-gray-100 py-1.5 pl-3 pr-1.5">
            <p className="text-xs font-semibold text-gray-900">
              Note · #{openNoteGroup.history.id}
            </p>
            <IconButton
              label="Close note"
              icon={<FiX />}
              size="sm"
              onClick={() => setOpenNoteId(null)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words px-3 py-2.5 text-sm text-gray-700">
            {openNoteText?.trim() ? (
              openNoteText
            ) : (
              <span className="italic text-gray-400">No notes added</span>
            )}
          </div>
        </div>
      )}

      <Modal
        open={Boolean(fraudCheck)}
        onClose={() => setFraudCheck(null)}
        title="Customer delivery history"
        description={
          fraudCheck &&
          [fraudCheck.name, fraudCheck.phone].filter(Boolean).join(' · ')
        }
        size="lg"
        footer={<Button onClick={() => setFraudCheck(null)}>Close</Button>}
      >
        {fraudCheck && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total orders', value: fraudCheck.total },
              {
                label: 'Delivered',
                value: fraudCheck.delivered,
                className: 'text-emerald-600',
              },
              {
                label: 'Returned',
                value: fraudCheck.returned,
                className: 'text-red-600',
              },
              {
                label: 'Success ratio',
                value: `${fraudCheck.success_ratio}%`,
                className:
                  successRatio >= 80
                    ? 'text-emerald-600'
                    : successRatio >= 50
                      ? 'text-amber-600'
                      : 'text-red-600',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-gray-200 p-3"
              >
                <p className="text-xs font-medium text-gray-500">
                  {stat.label}
                </p>
                <p
                  className={cx(
                    'mt-1 text-xl font-semibold tabular-nums text-gray-900',
                    stat.className,
                  )}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AdminPage>
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
