import { useState } from "react";
import Swal from "sweetalert2";
import { FiCheck, FiEdit2, FiEye, FiEyeOff, FiFolder, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import useLoadSubCategories from "../../../../Hooks/useLoadSubCategories";
import {
    AdminPage,
    Badge,
    Button,
    Checkbox,
    IconButton,
    Input,
    PageHeader,
    SearchInput,
    Select,
    SelectionBar,
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
    cx,
} from "../../../../components/Admin";

const ShowAllCategories = () => {
    const axiosSecure = useAxiosSecure();
    const [categories, refetch, isPending] = useLoadSubCategories();

    const [editId, setEditId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [nameEdits, setNameEdits] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParent, setSelectedParent] = useState('');

    const handleDelete = async (ids) => {
        const confirm = await Swal.fire({
            title: `Delete ${ids.length > 1 ? 'these categories' : 'this category'}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete",
        });

        if (!confirm.isConfirmed) return;

        try {
            await Promise.all(
                ids.map((id) =>
                    axiosSecure.delete(`/admin/delete-sub-category/${id}`)
                )
            );

            Swal.fire("Deleted!", "Selected categories deleted.", "success");
            setSelectedIds([]);
            refetch();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to delete.", "error");
        }
    };

    // The endpoint toggles each category; `action` only picks the wording.
    const handleDisableOrEnable = async (ids, action = 'disable') => {
        const verb = action === 'enable' ? 'Enable' : 'Disable';
        const confirm = await Swal.fire({
            title: `${verb} ${ids.length > 1 ? 'these categories' : 'this category'}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: `Yes, ${verb.toLowerCase()}`,
        });

        if (!confirm.isConfirmed) return;

        try {
            await Promise.all(
                ids.map((id) =>
                    axiosSecure.put(`/admin/disable-or-enable-sub-category/${id}`, {})
                )
            );

            Swal.fire(`${verb}d!`, `Selected categories ${verb.toLowerCase()}d.`, "success");
            setSelectedIds([]);
            refetch();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", `Failed to ${verb.toLowerCase()}.`, "error");
        }
    };

    const handleStartEdit = (id, currentName) => {
        setEditId(id);
        setNameEdits({ ...nameEdits, [id]: currentName });
    };

    const handleCancelEdit = () => {
        setEditId(null);
    };

    const handleSaveEdit = async (id) => {
        const newName = nameEdits[id]?.trim();

        if (!newName) {
            return Swal.fire("Validation Error", "Category name cannot be empty.", "warning");
        }

        try {
            await axiosSecure.put(`/admin/updateSubCategory/${id}`, {
                name: newName,
            });

            await Swal.fire("Updated!", "Category name updated successfully.", "success");
            setEditId(null);
            refetch();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to update category.", "error");
        }
    };

    // 🧠 Filtering
    const filteredCategories = categories?.filter(cat => {
        const nameMatch = cat.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const parentMatch = cat.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const parentFilter = selectedParent ? cat.category?.name === selectedParent : true;
        return (nameMatch || parentMatch) && parentFilter;
    });

    // 🧠 Unique parent options for dropdown
    const parentOptions = Array.from(
        new Set(categories.map(cat => cat.category?.name).filter(Boolean))
    );

    const allFilteredSelected =
        filteredCategories.length > 0 &&
        selectedIds.length === filteredCategories.length;

    return (
        <AdminPage title="Categories">
            <PageHeader
                title="Categories"
                description="Rename, enable or disable, and remove categories."
                actions={
                    <Button variant="primary" icon={<FiPlus />} href="/admin/add/add-category">
                        Add category
                    </Button>
                }
            />

            <TableCard
                toolbar={
                    <>
                        <SearchInput
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            placeholder="Search by category or parent..."
                        />
                        <Select
                            value={selectedParent}
                            onValueChange={setSelectedParent}
                            width="w-full sm:w-56"
                            aria-label="Parent category"
                        >
                            <option value="">All parent categories</option>
                            {parentOptions.map((parent) => (
                                <option key={parent} value={parent}>
                                    {parent}
                                </option>
                            ))}
                        </Select>
                    </>
                }
                selectionBar={
                    selectedIds.length > 0 && (
                        <SelectionBar count={selectedIds.length} onClear={() => setSelectedIds([])}>
                            <Button size="sm" icon={<FiEyeOff />} onClick={() => handleDisableOrEnable(selectedIds)}>
                                Disable
                            </Button>
                            <Button size="sm" variant="ghost-danger" icon={<FiTrash2 />} onClick={() => handleDelete(selectedIds)}>
                                Delete
                            </Button>
                        </SelectionBar>
                    )
                }
                footer={
                    !isPending && (
                        <TableFooter>
                            {filteredCategories.length} of {categories.length} categories
                        </TableFooter>
                    )
                }
            >
                <Table>
                    <THead>
                        <Th className="w-10">
                            <Checkbox
                                aria-label="Select all categories"
                                checked={allFilteredSelected}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedIds(filteredCategories.map((cat) => cat.id));
                                    } else {
                                        setSelectedIds([]);
                                    }
                                }}
                            />
                        </Th>
                        <Th className="w-16">ID</Th>
                        <Th>Name</Th>
                        <Th>Parent</Th>
                        <Th>Status</Th>
                        <Th align="right">Actions</Th>
                    </THead>
                    <TBody>
                        {isPending ? (
                            <SkeletonRows rows={8} cols={6} />
                        ) : filteredCategories.length === 0 ? (
                            <TableEmpty
                                colSpan={6}
                                icon={<FiFolder />}
                                title="No categories found"
                                description="Try a different search or parent category."
                            />
                        ) : (
                            filteredCategories.map((cat) => {
                                const isSelected = selectedIds.includes(cat.id);
                                const isActive = cat.isDisabled == false;

                                return (
                                    <Tr key={cat.id} className={cx(isSelected && 'bg-gray-50')}>
                                        <Td>
                                            <Checkbox
                                                aria-label={`Select ${cat.name}`}
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...selectedIds, cat.id]
                                                        : selectedIds.filter((id) => id !== cat.id);
                                                    setSelectedIds(updated);
                                                }}
                                            />
                                        </Td>
                                        <Td nowrap className="tabular-nums text-gray-500">{cat.id}</Td>
                                        <Td nowrap>
                                            {editId === cat.id ? (
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        size="sm"
                                                        autoFocus
                                                        value={nameEdits[cat.id]}
                                                        onChange={(e) =>
                                                            setNameEdits({
                                                                ...nameEdits,
                                                                [cat.id]: e.target.value,
                                                            })
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveEdit(cat.id);
                                                            if (e.key === 'Escape') handleCancelEdit();
                                                        }}
                                                        aria-label="Category name"
                                                        className="w-48"
                                                    />
                                                    <IconButton label="Save" icon={<FiCheck />} variant="ghost-success" onClick={() => handleSaveEdit(cat.id)} />
                                                    <IconButton label="Cancel" icon={<FiX />} onClick={handleCancelEdit} />
                                                </div>
                                            ) : (
                                                <span className="font-medium text-gray-900">{cat.name}</span>
                                            )}
                                        </Td>
                                        <Td nowrap className="text-gray-600">{cat.category?.name || "—"}</Td>
                                        <Td nowrap>
                                            {isActive ? (
                                                <Badge tone="success" dot>Active</Badge>
                                            ) : (
                                                <Badge dot>Disabled</Badge>
                                            )}
                                        </Td>
                                        <Td nowrap align="right">
                                            <div className="flex justify-end gap-0.5">
                                                <IconButton
                                                    label="Rename"
                                                    icon={<FiEdit2 />}
                                                    onClick={() => handleStartEdit(cat.id, cat.name)}
                                                />
                                                {isActive ? (
                                                    <IconButton
                                                        label="Disable"
                                                        icon={<FiEyeOff />}
                                                        onClick={() => handleDisableOrEnable([cat.id], 'disable')}
                                                    />
                                                ) : (
                                                    <IconButton
                                                        label="Enable"
                                                        icon={<FiEye />}
                                                        variant="ghost-success"
                                                        onClick={() => handleDisableOrEnable([cat.id], 'enable')}
                                                    />
                                                )}
                                                <IconButton
                                                    label="Delete"
                                                    icon={<FiTrash2 />}
                                                    variant="ghost-danger"
                                                    onClick={() => handleDelete([cat.id])}
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

export default ShowAllCategories;
