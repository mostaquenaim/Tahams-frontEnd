import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  FiEdit2,
  FiEye,
  FiFilter,
  FiSlash,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import useAxiosSecure from '/Hooks/useAxiosSecure';
import {
  AdminPage,
  Badge,
  Button,
  IconButton,
  Input,
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

const USERS_PER_PAGE = 10;

const ROLE_TONES = {
  admin: 'info',
  employee: 'warning',
  seller: 'success',
  customer: 'neutral',
};

const getInitials = (name, email) => {
  const source = name?.trim() || email || '?';
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, roleFilter, startDate, endDate, users]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  const hasDateRange = Boolean(startDate && endDate);

  return (
    <AdminPage title="Users">
      <PageHeader
        title="Users"
        description="Browse customer and staff accounts."
      />

      <StatGrid cols={3}>
        <StatCard
          label="Total users"
          value={loading ? '—' : users.length.toLocaleString()}
          icon={<FiUsers />}
        />
        <StatCard
          label="Matching filters"
          value={loading ? '—' : filteredUsers.length.toLocaleString()}
          icon={<FiFilter />}
          tone="info"
        />
        <StatCard
          label="New users per day"
          value={hasDateRange ? dateStats.average : '—'}
          hint={
            hasDateRange
              ? `${dateStats.total} joined over ${dateStats.days} ${
                  dateStats.days === 1 ? 'day' : 'days'
                }`
              : 'Pick a date range to see the sign-up rate'
          }
          icon={<FiTrendingUp />}
          tone="success"
        />
      </StatGrid>

      <TableCard
        toolbar={
          <>
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search by name or email..."
            />
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              width="w-full sm:w-40"
              aria-label="Role"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="employee">Employee</option>
            </Select>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Joined from"
                className="w-full sm:w-40"
              />
              <span className="text-sm text-gray-400">to</span>
              <Input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="Joined until"
                className="w-full sm:w-40"
              />
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </>
        }
        footer={
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={USERS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemLabel="users"
          />
        }
      >
        <Table>
          <THead>
            <Th className="w-14">#</Th>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Joined</Th>
            <Th align="right">Actions</Th>
          </THead>
          <TBody>
            {loading ? (
              <SkeletonRows rows={8} cols={5} />
            ) : paginatedUsers.length === 0 ? (
              <TableEmpty
                colSpan={5}
                icon={<FiUsers />}
                title="No users found"
                description="Try a different search, role or date range."
              />
            ) : (
              paginatedUsers.map((user, index) => {
                const joined = new Date(user.created_at);
                return (
                  <Tr key={user.id || user._id}>
                    <Td nowrap className="tabular-nums text-gray-500">
                      {(currentPage - 1) * USERS_PER_PAGE + index + 1}
                    </Td>
                    <Td>
                      <div className="flex min-w-[14rem] items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                          {getInitials(user.name, user.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {user.name || '—'}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td nowrap>
                      <Badge
                        tone={ROLE_TONES[user.role] || 'neutral'}
                        className="capitalize"
                      >
                        {user.role || 'unknown'}
                      </Badge>
                    </Td>
                    <Td nowrap>
                      <p className="text-gray-700">
                        {joined.toLocaleDateString('en-GB', {
                          timeZone: 'Asia/Dhaka',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {joined.toLocaleTimeString('en-GB', {
                          timeZone: 'Asia/Dhaka',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </Td>
                    <Td nowrap align="right">
                      <div className="flex justify-end gap-0.5">
                        <IconButton
                          label="View"
                          icon={<FiEye />}
                          onClick={() => console.log('View', user)}
                        />
                        <IconButton
                          label="Edit"
                          icon={<FiEdit2 />}
                          onClick={() => console.log('Edit', user)}
                        />
                        <IconButton
                          label="Disable"
                          icon={<FiSlash />}
                          variant="ghost-danger"
                          onClick={() => console.log('Disable', user)}
                        />
                      </div>
                    </Td>
                  </Tr>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>
    </AdminPage>
  );
};

export default ShowUsers;
