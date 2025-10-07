import React, { useContext, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiSearch, FiDownload, FiChevronDown, FiFilter } from 'react-icons/fi';
import { useOnClickOutside } from 'usehooks-ts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import useCustomizationReq from '/Hooks/useCustomizationReq';
import Loading from '/components/Loading';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import { getGuestCustomerInfo } from '/utils/guestCustomer';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import Swal from 'sweetalert2';
import _ from 'lodash'; // install lodash if not already: npm i lodash
import { FaCheck } from 'react-icons/fa';

const ShowCustomizationRequests = () => {
  const [customizations, refetch, isPending] = useCustomizationReq();
  console.log(customizations, 'customizationscustomizations');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(0);

  // Handle click outside export dropdown to close it
  useOnClickOutside(exportRef, () => setExportDropdownOpen(false));

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

  // console.log(filteredCustomizations,'filteredCustomizationsfilteredCustomizations');

  // Filter first
  const filtered = customizations.filter((customization) => {
    const matchesSearch =
      customization.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customization.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      customization.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Group by groupId
  const groupedCustomizations = _(filtered)
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

  // Handle export functionality for CSV and Excel
  const handleExport = (type) => {
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
    setExportDropdownOpen(false);
  };

  // Export to CSV
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

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const axiosPublic = useAxiosPublic();

  const handleDeleteCustomReq = async (id) => {
    const token = localStorage.getItem('access_token');

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
          const res = await axiosPublic.delete(
            `/admin/delete-customization-request/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
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
    const token = localStorage.getItem('access_token');
    try {
      const res = await axiosPublic.put(
        `/admin/update-customization-request/${customization.groupId}`,
        {
          isChecked: !customization.isChecked,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Swal.fire(
      //   'Deleted!',
      //   res.data?.message || 'Request deleted successfully.',
      //   'success',
      // );

      refetch();
    } catch (error) {
      Swal.fire(
        'Error!',
        error.response?.data?.message || 'Something went wrong.',
        'error',
      );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Customization Requests
            </h1>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customizations..."
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

          {isPending ? (
            <Loading />
          ) : filteredCustomizations.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customization ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Side
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Custom Texts
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedCustomizations.map((customization) => (
                      <motion.tr
                        key={customization.groupId}
                        className={customization.isChecked && 'bg-green-300'}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">
                          #{customization.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {customization.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {customization.color}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {/* Show both sides */}
                          {customization.sides.front && (
                            <div>
                              Front:{' '}
                              {customization.sides.front.customTexts
                                .map((t) => t.content)
                                .join(', ')}
                            </div>
                          )}
                          {customization.sides.back && (
                            <div>
                              Back:{' '}
                              {customization.sides.back.customTexts
                                .map((t) => t.content)
                                .join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              customization.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : customization.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {customization.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium flex gap-2 items-center text-center">
                          <Link
                            href={`customization-details/${customization.groupId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleCheckRequest(customization)}
                          >
                            {customization.isChecked ? (
                              <span
                                className="flex items-center justify-center text-center w-16 text-green-600 hover:text-red-800 cursor-pointer"
                                onMouseEnter={() =>
                                  setHoveredId(customization.groupId)
                                }
                                onMouseLeave={() => setHoveredId(0)}
                              >
                                {hoveredId === customization.groupId ? (
                                  'Uncheck'
                                ) : (
                                  <FaCheck />
                                )}
                              </span>
                            ) : (
                              <span className="text-yellow-600 hover:text-yellow-800">
                                Check
                              </span>
                            )}
                          </button>
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
                No customization requests found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShowCustomizationRequests;
