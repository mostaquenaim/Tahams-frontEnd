import React, { useEffect, useState } from 'react';
import useAxiosSecure from '/Hooks/useAxiosSecure';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';

const USERS_PER_PAGE = 10;

const ShowUsers = () => {
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateStats, setDateStats] = useState({
    total: 0,
    days: 0,
    average: 0,
  });

  const getDhakaDate = (date) =>
    new Date(date).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Dhaka',
    });

  //   fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosSecure.get('/admin/get-all-users');
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [axiosSecure]);

  // Custom pagination rendering logic
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 3;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPages = [1, 2, 3];
      const endPages = [totalPages - 2, totalPages - 1, totalPages];

      if (currentPage <= 4) {
        pages.push(...startPages, '...', ...endPages.slice(-3));
      } else if (currentPage >= totalPages - 3) {
        pages.push(...startPages.slice(0, 1), '...', ...endPages);
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          className={`btn btn-sm ${
            currentPage === page ? 'btn-primary' : 'btn-outline'
          }`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      );
    });
  };

  // Filter logic
  useEffect(() => {
    let filtered = [...users];

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(lowerSearch) ||
          user.email?.toLowerCase().includes(lowerSearch),
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // ✅ Date range filter (Asia/Dhaka safe)
    if (startDate && endDate) {
      filtered = filtered.filter((user) => {
        const userDate = getDhakaDate(user.created_at);
        return userDate >= startDate && userDate <= endDate;
      });

      // 📊 Stats calculation
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
      );

      const total = filtered.length;
      const average = (total / days).toFixed(2);

      setDateStats({ total, days, average });
    } else {
      setDateStats({ total: 0, days: 0, average: 0 });
    }

    console.log(filtered, 'filtered');
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, roleFilter, startDate, endDate, users]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">All Users</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="input input-bordered w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered w-full md:w-1/4"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="employee">Employee</option>
        </select>

        {/* Date-wise Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="date"
              className="input input-bordered"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <span className="text-sm text-gray-500">to</span>

            <input
              type="date"
              className="input input-bordered"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {startDate && endDate && (
              <div className="text-sm font-medium text-gray-700">
                <div>
                  Total users created:{' '}
                  <span className="font-semibold">{dateStats.total}</span>
                </div>
                <div>
                  Average per day:{' '}
                  <span className="font-semibold">{dateStats.average}</span>
                </div>
              </div>
            )}
          </div>

          {startDate && endDate && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear
            </button>
          )}

          {/* {dateFilter && (
            <div className="text-sm font-medium text-gray-700">
              Total users created on this date:{' '}
              <span className="font-semibold">{dateCount}</span>
            </div>
          )} */}

          {/* {dateFilter && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setDateFilter('')}
            >
              Clear
            </button>
          )} */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Created At</th>
              <th className="py-2 px-4">Action</th> {/* New Action Column */}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr
                key={user.id || user._id}
                className="border-t hover:bg-gray-50"
              >
                <td className="py-2 px-4">
                  {(currentPage - 1) * USERS_PER_PAGE + index + 1}
                </td>
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4 capitalize">{user.role}</td>
                <td className="py-2 px-4 capitalize">
                  {new Date(user.created_at).toLocaleString('en-GB', {
                    timeZone: 'Asia/Dhaka',
                  })}
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    <button
                      className="btn btn-xs btn-info"
                      onClick={() => console.log('View', user)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-xs btn-warning"
                      onClick={() => console.log('Edit', user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => console.log('Disable', user)}
                    >
                      Disable
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {renderPagination()}
        <button
          className="btn btn-sm btn-outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ShowUsers;
