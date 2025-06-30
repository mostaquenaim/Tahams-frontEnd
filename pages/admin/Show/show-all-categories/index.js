import { useEffect, useState } from "react";
import useAxiosPublic from "../../../../Hooks/useAxiosPublic";
import useLoadSubCategories from "../../../../Hooks/useLoadSubCategories";
import Swal from "sweetalert2";
import Loading from "../../../../components/Loading";
import Head from "next/head";

const ShowAllCategories = () => {
    const axiosPublic = useAxiosPublic();
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
            const token = localStorage.getItem("access_token");

            await Promise.all(
                ids.map((id) =>
                    axiosPublic.delete(`/admin/delete-sub-category/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
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

    const handleDisableOrEnable = async (ids) => {
        const confirm = await Swal.fire({
            title: `Disable ${ids.length > 1 ? 'these categories' : 'this category'}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, disable",
        });

        if (!confirm.isConfirmed) return;

        try {
            const token = localStorage.getItem("access_token");

            await Promise.all(
                ids.map((id) =>
                    axiosPublic.put(`/admin/disable-or-enable-sub-category/${id}`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                )
            );

            Swal.fire("Disabled!", "Selected categories disabled.", "success");
            setSelectedIds([]);
            refetch();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to disable.", "error");
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
            const token = localStorage.getItem("access_token");
            await axiosPublic.put(`/admin/updateSubCategory/${id}`, {
                name: newName,
            }, {
                headers: { Authorization: `Bearer ${token}` },
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

    return (
        <div className="container mx-auto pt-20 lg:pt-40">
            <Head>
                <title>All Categories</title>
            </Head>

            <h1 className="text-2xl font-bold mb-6 text-center">All Categories</h1>

            {/* 🔍 Search + Filter */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between">
                <input
                    type="text"
                    placeholder="Search by category or parent..."
                    className="input input-bordered w-full lg:max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="select select-bordered w-full lg:max-w-xs"
                    value={selectedParent}
                    onChange={(e) => setSelectedParent(e.target.value)}
                >
                    <option value="">All Parent Categories</option>
                    {parentOptions.map((parent) => (
                        <option key={parent} value={parent}>
                            {parent}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🧹 Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => handleDisableOrEnable(selectedIds)}
                        className="btn btn-sm btn-warning"

                    >
                        Disable Selected ({selectedIds.length})
                    </button>
                    <button
                        onClick={() => handleDelete(selectedIds)}
                        className="btn btn-sm btn-error"
                    >
                        Delete Selected ({selectedIds.length})
                    </button>
                </div>
            )}

            {isPending ? (
                <Loading />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">
                                    <input
                                        type="checkbox"
                                        checked={
                                            filteredCategories.length > 0 &&
                                            selectedIds.length === filteredCategories.length
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds(filteredCategories.map((cat) => cat.id));
                                            } else {
                                                setSelectedIds([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="py-2 px-4 border-b text-left">ID</th>
                                <th className="py-2 px-4 border-b text-left">Name</th>
                                <th className="py-2 px-4 border-b text-left">Parent</th>
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(cat.id)}
                                            onChange={(e) => {
                                                const updated = e.target.checked
                                                    ? [...selectedIds, cat.id]
                                                    : selectedIds.filter((id) => id !== cat.id);
                                                setSelectedIds(updated);
                                            }}
                                        />
                                    </td>
                                    <td className="py-2 px-4 border-b">{cat.id}</td>
                                    <td className="py-2 px-4 border-b">
                                        {editId === cat.id ? (
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    className="input input-sm input-bordered"
                                                    value={nameEdits[cat.id]}
                                                    onChange={(e) =>
                                                        setNameEdits({
                                                            ...nameEdits,
                                                            [cat.id]: e.target.value,
                                                        })
                                                    }
                                                />
                                                <button
                                                    onClick={() => handleSaveEdit(cat.id)}
                                                    className="btn btn-xs btn-success"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="btn btn-xs btn-warning"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-center">
                                                <span>{cat.name}</span>
                                                <button
                                                    onClick={() => handleStartEdit(cat.id, cat.name)}
                                                    className="btn btn-xs btn-primary"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">{cat.category?.name || "—"}</td>
                                    <td className="py-2 px-4 border-b space-x-2">
                                        {cat.isActive ? (
                                            <button
                                                onClick={() => handleDisableOrEnable([cat.id])}
                                                className="btn btn-xs btn-warning"
                                            >
                                                Disable
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDisableOrEnable([cat.id])}
                                                className="btn btn-xs btn-success"
                                            >
                                                Enable
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete([cat.id])}
                                            className="btn btn-xs btn-error"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

};

export default ShowAllCategories;
