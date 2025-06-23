import { useState } from "react";
import useAxiosPublic from "../../../../Hooks/useAxiosPublic";
import useLoadSubCategories from "../../../../Hooks/useLoadSubCategories";
import Swal from "sweetalert2";
import Loading from "../../../../components/Loading";
import Head from "next/head";

const ShowAllCategories = () => {
    const axiosPublic = useAxiosPublic();
    const [categories, refetch, isPending] = useLoadSubCategories();
    // console.log(categories,'catss');

    const [editId, setEditId] = useState(null);
    const [nameEdits, setNameEdits] = useState({});

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                const token = localStorage.getItem("access_token");
                await axiosPublic.delete(`/admin/delete-sub-category/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                await Swal.fire("Deleted!", "Category deleted successfully.", "success");
                refetch();
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Failed to delete category.", "error");
            }
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

    return (
        <div className="container mx-auto pt-20 lg:pt-40">
            <Head>
                <title>All Categories</title>
            </Head>

            <h1 className="text-2xl font-bold mb-6 text-center">All Categories</h1>

            {isPending ? (
                <Loading />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">ID</th>
                                <th className="py-2 px-4 border-b text-left">Name</th>
                                <th className="py-2 px-4 border-b text-left">Parent</th>
                                <th className="py-2 px-4 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{cat.id}</td>
                                    <td className="py-2 px-4 border-b">
                                        {editId === cat.id ? (
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    className="input input-sm input-bordered"
                                                    value={nameEdits[cat.id]}
                                                    onChange={(e) =>
                                                        setNameEdits({ ...nameEdits, [cat.id]: e.target.value })
                                                    }
                                                />
                                                <button onClick={() => handleSaveEdit(cat.id)} className="btn btn-xs btn-success">Save</button>
                                                <button onClick={handleCancelEdit} className="btn btn-xs btn-warning">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-center">
                                                <span>{cat.name}</span>
                                                <button onClick={() => handleStartEdit(cat.id, cat.name)} className="btn btn-xs btn-primary">Edit</button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">{cat.category?.name || "—"}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => handleDelete(cat.id)}
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
