import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import _ from 'lodash'; // install lodash if not already: npm i lodash
import {
  FiDownload,
  FiEye,
  FiFileText,
  FiGrid,
  FiLayers,
} from 'react-icons/fi';
import useCustomizationReq from '/Hooks/useCustomizationReq';
import useAxiosSecure from '/Hooks/useAxiosSecure';
import {
  AdminPage,
  Badge,
  CheckToggle,
  Dropdown,
  DropdownItem,
  IconButton,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  SkeletonRows,
  TBody,
  THead,
  Table,
  TableCard,
  TableEmpty,
  Td,
  Th,
  Tr,
  cx,
} from '/components/Admin';

const STATUS_TONES = { approved: 'success', rejected: 'danger' };

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const ShowCustomizationRequests = () => {
  const [customizations, refetch, isPending] = useCustomizationReq();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [checkingId, setCheckingId] = useState(null);

  // Filter customizations based on search term and status filter
  const filteredCustomizations = customizations.filter((customization) => {
    const matchesSearch =
      customization.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customization.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      customization.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Group by groupId
  const groupedCustomizations = _(filteredCustomizations)
    .groupBy('groupId')
    .map((items) => {
      const base = items[0]; // take common info
      return {
        ...base,
        sides: items.reduce((acc, item) => {
          acc[item.side] = {
            previewImage: item.previewImage,
            customTexts: item.customTexts,
            customImages: item.customImages,
          };
          return acc;
        }, {}),
      };
    })
    .value();

  const totalPages = Math.ceil(groupedCustomizations.length / pageSize);
  const currentGroups = groupedCustomizations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Handle export functionality for CSV and Excel
  const handleExport = (type) => {
    if (!filteredCustomizations.length) return;

    const exportData = filteredCustomizations.map((customization) => ({
      'Customization ID': customization.id,
      Customer: customization.name || customization.phone,
      Color: customization.color,
      Side: customization.side,
      CustomText: customization.customTexts
        .map((text) => text.content)
        .join(', '),
      Status: customization.status,
      SpecialInstructions: customization.specialInstructions,
    }));

    if (type === 'csv') {
      exportToCSV(exportData);
    } else {
      exportToExcel(exportData);
    }
  };

  // Export to CSV
  const exportToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customizations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Export to Excel
  const exportToExcel = (data, filename = 'customizations.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customizations');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const axiosSecure = useAxiosSecure();

  const handleDeleteCustomReq = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the customization request.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(
            `/admin/delete-customization-request/${id}`,
          );

          Swal.fire(
            'Deleted!',
            res.data?.message || 'Request deleted successfully.',
            'success',
          );
          refetch();
        } catch (error) {
          Swal.fire(
            'Error!',
            error.response?.data?.message || 'Something went wrong.',
            'error',
          );
        }
      }
    });
  };

  const handleCheckRequest = async (customization) => {
    setCheckingId(customization.groupId);
    try {
      await axiosSecure.put(
        `/admin/update-customization-request/${customization.groupId}`,
        {
          isChecked: !customization.isChecked,
        },
      );

      await refetch();
    } catch (error) {
      Swal.fire(
        'Error!',
        error.response?.data?.message || 'Something went wrong.',
        'error',
      );
    } finally {
      setCheckingId(null);
    }
  };

  const renderSideText = (label, side) => {
    if (!side) return null;
    const text = side.customTexts.map((t) => t.content).join(', ');
    return (
      <p className="truncate" title={text}>
        <span className="text-gray-500">{label}:</span>{' '}
        {text || <span className="text-gray-400">No text</span>}
      </p>
    );
  };

  return (
    <AdminPage title="Customization requests">
      <PageHeader
        title="Customization requests"
        description="Review custom design requests and mark them as checked."
        actions={
          <Dropdown
            label="Export"
            icon={<FiDownload />}
            disabled={!filteredCustomizations.length}
          >
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

      <TableCard
        toolbar={
          <>
            <SearchInput
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name or phone..."
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
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </>
        }
        footer={
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={groupedCustomizations.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            pageSizeOptions={[10, 25, 50]}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="requests"
          />
        }
      >
        <Table>
          <THead>
            <Th>Request</Th>
            <Th>Customer</Th>
            <Th>Color</Th>
            <Th>Custom text</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </THead>
          <TBody>
            {isPending ? (
              <SkeletonRows rows={6} cols={6} />
            ) : currentGroups.length === 0 ? (
              <TableEmpty
                colSpan={6}
                icon={<FiLayers />}
                title="No customization requests found"
                description="Try a different search or status."
              />
            ) : (
              currentGroups.map((customization) => (
                <Tr key={customization.groupId}>
                  <Td nowrap>
                    <div className="flex items-center gap-2">
                      <span
                        className={cx(
                          'h-2 w-2 shrink-0 rounded-full',
                          customization.isChecked
                            ? 'bg-transparent'
                            : 'bg-sky-500',
                        )}
                        title={
                          customization.isChecked ? undefined : 'Not checked yet'
                        }
                      />
                      <span className="font-semibold text-gray-900">
                        #{customization.id}
                      </span>
                    </div>
                  </Td>
                  <Td nowrap>
                    <p className="font-medium text-gray-900">
                      {customization.name || '—'}
                    </p>
                    {customization.phone && (
                      <p className="text-xs tabular-nums text-gray-500">
                        {customization.phone}
                      </p>
                    )}
                  </Td>
                  <Td nowrap>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-200"
                        style={{ backgroundColor: customization.color }}
                      />
                      {customization.color || '—'}
                    </span>
                  </Td>
                  <Td className="min-w-[14rem] max-w-md">
                    <div className="space-y-0.5">
                      {renderSideText('Front', customization.sides.front)}
                      {renderSideText('Back', customization.sides.back)}
                    </div>
                  </Td>
                  <Td nowrap>
                    <Badge
                      tone={
                        STATUS_TONES[customization.status?.toLowerCase()] ||
                        'warning'
                      }
                      dot
                      className="capitalize"
                    >
                      {customization.status}
                    </Badge>
                  </Td>
                  <Td nowrap align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <CheckToggle
                        checked={customization.isChecked}
                        loading={checkingId === customization.groupId}
                        onClick={() => handleCheckRequest(customization)}
                      />
                      <IconButton
                        label="View details"
                        icon={<FiEye />}
                        href={`/admin/show/customization-details/${customization.groupId}`}
                      />
                    </div>
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

export default ShowCustomizationRequests;
