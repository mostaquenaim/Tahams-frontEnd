import React, { useEffect, useState } from 'react';
import useAxiosSecure from '/Hooks/useAxiosSecure';
import { Loader2, Pencil, Trash2, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';

const ManageRoles = () => {
    const axiosSecure = useAxiosSecure();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRole, setNewRole] = useState('');
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [editingValue, setEditingValue] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axiosSecure.get('/admin/get-all-roles');
            setRoles(res.data);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = async () => {
        if (!newRole.trim()) return;
        try {
            await axiosSecure.post('/admin/create-role', { name: newRole });
            setNewRole('');
            fetchRoles();
        } catch (err) {
            console.error('Failed to add role:', err);
        }
    };

    const handleEditRole = async (roleId) => {
        try {
            await axiosSecure.patch(`/admin/update-role/${roleId}`, {
                name: editingValue,
            });
            setEditingRoleId(null);
            fetchRoles();
        } catch (err) {
            console.error('Failed to update role:', err);
        }
    };

    const handleDeleteRole = async (roleId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won’t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!result.isConfirmed) return;

        try {
            await axiosSecure.delete(`/admin/delete-role/${roleId}`);

            await Swal.fire('Deleted!', 'The role has been deleted.', 'success');
            fetchRoles();
        } catch (err) {
            console.error('Failed to delete role:', err);
            Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Roles</h2>

            {/* Add Role */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    className="input input-bordered w-full max-w-sm"
                    placeholder="New role name"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleAddRole}>
                    Add Role
                </button>
            </div>

            {/* Roles Table */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="py-2 px-4">#</th>
                                <th className="py-2 px-4">Role</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role, index) => (
                                <tr key={role.id} className="border-t hover:bg-gray-50">
                                    <td className="py-2 px-4">{index + 1}</td>
                                    <td className="py-2 px-4">
                                        {editingRoleId === role.id ? (
                                            <input
                                                type="text"
                                                className="input input-sm input-bordered"
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                            />
                                        ) : (
                                            <span>{role.name}</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 flex gap-2">
                                        {editingRoleId === role.id ? (
                                            <>
                                                <button
                                                    className="btn btn-xs btn-success"
                                                    onClick={() => handleEditRole(role.id)}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-xs btn-outline"
                                                    onClick={() => setEditingRoleId(null)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-xs btn-warning"
                                                    onClick={() => {
                                                        setEditingRoleId(role.id);
                                                        setEditingValue(role.name);
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-xs btn-error"
                                                    onClick={() => handleDeleteRole(role.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {roles.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="py-4 text-center text-gray-500">
                                        No roles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageRoles;
