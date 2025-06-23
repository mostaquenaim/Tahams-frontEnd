import { useState } from "react";
import useAxiosPublic from "../../../../Hooks/useAxiosPublic";
import Loading from "../../../../components/Loading";
import Head from "next/head";
import Swal from "sweetalert2";
import useLoadSeries from "../../../../Hooks/useLoadSeries";

const ShowAllSeries = () => {
    const axiosPublic = useAxiosPublic();
    const [series, refetch, isPending] = useLoadSeries();

    const [editId, setEditId] = useState(null);
    const [nameEdits, setNameEdits] = useState({});

    const handleDeleteCategory = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the category.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                const token = localStorage.getItem("access_token");
                await axiosPublic.delete(`/admin/delete-category/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                await Swal.fire("Deleted!", "Category has been deleted.", "success");
                refetch();
            } catch (error) {
                console.error("Delete failed:", error);
                Swal.fire("Error", "Could not delete category.", "error");
            }
        }
    };

    const handleStartEdit = (id, name) => {
        setEditId(id);
        setNameEdits({ ...nameEdits, [id]: name });
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
            const res = await axiosPublic.put(`/admin/updateCategory/${id}`, {
                name: newName,
            });

            await Swal.fire("Updated!", "Category name updated successfully.", "success");
            setEditId(null);
            refetch();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to update category name.", "error");
        }
    };

    return (
        <div className="container mx-auto pt-20 lg:pt-40">
            <Head>
                <title>Series</title>
            </Head>
            <h1 className="text-2xl font-bold mb-6 text-center">All Series</h1>

            {isPending ? (
                <Loading />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">ID</th>
                                <th className="py-2 px-4 border-b text-left">Name</th>
                                <th className="py-2 px-4 border-b text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {series.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{cat.id}</td>
                                    <td className="py-2 px-4 border-b">
                                        {editId === cat.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={nameEdits[cat.id] || ""}
                                                    onChange={(e) =>
                                                        setNameEdits((prev) => ({
                                                            ...prev,
                                                            [cat.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="input input-sm input-bordered"
                                                />
                                                <button onClick={() => handleSaveEdit(cat.id)} className="btn btn-xs btn-success">Save</button>
                                                <button onClick={handleCancelEdit} className="btn btn-xs btn-warning">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={cat.name}
                                                    disabled
                                                    className="input input-sm input-bordered"
                                                />
                                                <button onClick={() => handleStartEdit(cat.id, cat.name)} className="btn btn-xs btn-primary">Edit</button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
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

export default ShowAllSeries;
