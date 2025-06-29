import React, { useEffect, useState } from 'react';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';

const USERS_PER_PAGE = 10;

const ShowUsers = () => {
    const axiosPublic = useAxiosPublic();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const [roles, setRoles] = useState([]);
    const [editUserId, setEditUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axiosPublic.get('/admin/get-all-users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(res.data);
                setFilteredUsers(res.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [axiosPublic]);

    // Filter logic
    useEffect(() => {
        let filtered = [...users];

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.name?.toLowerCase().includes(lowerSearch) ||
                    user.email?.toLowerCase().includes(lowerSearch)
            );
        }

        if (roleFilter) {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [search, roleFilter, users]);

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
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
                            <th className="py-2 px-4">Action</th> {/* New Action Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user, index) => (
                            <tr key={user.id || user._id} className="border-t hover:bg-gray-50">
                                <td className="py-2 px-4">{(currentPage - 1) * USERS_PER_PAGE + index + 1}</td>
                                <td className="py-2 px-4">{user.name}</td>
                                <td className="py-2 px-4">{user.email}</td>
                                <td className="py-2 px-4 capitalize">{user.role}</td>
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
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ShowUsers;
