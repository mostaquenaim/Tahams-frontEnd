import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FiCheck, FiEdit2, FiPlus, FiShield, FiTrash2, FiX } from 'react-icons/fi';
import useAxiosSecure from '/Hooks/useAxiosSecure';
import {
  AdminPage,
  Button,
  IconButton,
  Input,
  PageHeader,
  SkeletonRows,
  TBody,
  THead,
  Table,
  TableCard,
  TableEmpty,
  TableFooter,
  Td,
  Th,
  Tr,
} from '/components/Admin';

const ManageRoles = () => {
  const axiosSecure = useAxiosSecure();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState('');
  const [adding, setAdding] = useState(false);
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
    setAdding(true);
    try {
      await axiosSecure.post('/admin/create-role', { name: newRole });
      setNewRole('');
      fetchRoles();
    } catch (err) {
      console.error('Failed to add role:', err);
    } finally {
      setAdding(false);
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
    <AdminPage title="Roles">
      <PageHeader
        title="Roles"
        description="Create, rename and remove user roles."
      />

      <TableCard
        toolbar={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddRole();
            }}
            className="flex w-full gap-2 sm:max-w-md"
          >
            <Input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="New role name"
              aria-label="New role name"
              className="w-full min-w-0 flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              icon={<FiPlus />}
              loading={adding}
              disabled={!newRole.trim()}
            >
              Add role
            </Button>
          </form>
        }
        footer={
          !loading && (
            <TableFooter>
              {roles.length} {roles.length === 1 ? 'role' : 'roles'}
            </TableFooter>
          )
        }
      >
        <Table>
          <THead>
            <Th className="w-16">#</Th>
            <Th>Role</Th>
            <Th align="right">Actions</Th>
          </THead>
          <TBody>
            {loading ? (
              <SkeletonRows rows={4} cols={3} />
            ) : roles.length === 0 ? (
              <TableEmpty
                colSpan={3}
                icon={<FiShield />}
                title="No roles yet"
                description="Add your first role using the field above."
              />
            ) : (
              roles.map((role, index) => {
                const isEditing = editingRoleId === role.id;
                return (
                  <Tr key={role.id}>
                    <Td nowrap className="tabular-nums text-gray-500">
                      {index + 1}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          size="sm"
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditRole(role.id);
                            if (e.key === 'Escape') setEditingRoleId(null);
                          }}
                          aria-label="Role name"
                          className="w-full max-w-xs"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {role.name}
                        </span>
                      )}
                    </Td>
                    <Td nowrap align="right">
                      <div className="flex justify-end gap-0.5">
                        {isEditing ? (
                          <>
                            <IconButton
                              label="Save"
                              icon={<FiCheck />}
                              variant="ghost-success"
                              onClick={() => handleEditRole(role.id)}
                            />
                            <IconButton
                              label="Cancel"
                              icon={<FiX />}
                              onClick={() => setEditingRoleId(null)}
                            />
                          </>
                        ) : (
                          <>
                            <IconButton
                              label="Rename"
                              icon={<FiEdit2 />}
                              onClick={() => {
                                setEditingRoleId(role.id);
                                setEditingValue(role.name);
                              }}
                            />
                            <IconButton
                              label="Delete"
                              icon={<FiTrash2 />}
                              variant="ghost-danger"
                              onClick={() => handleDeleteRole(role.id)}
                            />
                          </>
                        )}
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

export default ManageRoles;
