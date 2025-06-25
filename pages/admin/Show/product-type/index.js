import { useState } from "react";
import useLoadSubSubCategories from "../../../../Hooks/useLoadSubSubCategories";
import useAxiosPublic from "../../../../Hooks/useAxiosPublic";
import Loading from "../../../../components/Loading";
import Head from "next/head";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const ProductType = () => {
    const [subSubCategories, refetch, isPending] = useLoadSubSubCategories();
    const [myfile, setMyFile] = useState('');
    const [editable, setEditable] = useState(false);
    const [editItem, setEditItem] = useState(-1);
    const [isShowImage, setIsShowImage] = useState(false);
    const [imageToShow, setImageToShow] = useState('');
    const [editNameItemId, setEditNameItemId] = useState(-1);
    const [nameEdits, setNameEdits] = useState({});

    const axiosPublic = useAxiosPublic();

    const handleEditSizeChart = async (item) => {
        if (editItem === item.id) {
            if (!myfile) {
                console.error('No file selected');
                return;
            }

            const formData = new FormData();
            formData.append('myFile', myfile);

            try {
                const res = await axiosPublic.put(`/admin/update-sub-sub-category/${item.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                // console.log(res.data);
                refetch();
            } catch (error) {
                console.error('Error uploading file:', error.response?.data || error.message);
            }
        } else {
            setEditable(editable);
            setEditItem(item.id);
        }
    };

    const handleCancelEdit = () => {
        setEditItem(-1);
        setEditable(false);
    };

    const handleShowImage = (filename) => {
        setImageToShow(`${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`);
        setIsShowImage(true);
    };

    const closeImageModal = () => {
        setIsShowImage(false);
        setImageToShow('');
    };

    const handleDeleteCProductType = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('access_token');

                const response = await axiosPublic.delete(`/admin/delete-product-type/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                await Swal.fire(
                    'Deleted!',
                    'Product type has been deleted.',
                    'success'
                );

                refetch(); // Refresh the data after deletion
            } catch (error) {
                console.error('Deleting failed:', error.message);
                Swal.fire(
                    'Failed!',
                    'An error occurred while deleting.',
                    'error'
                );
            }
        }
    };

    const handleChangeProductName = (id) => {
        setEditNameItemId(id);
        const currentItem = subSubCategories.find((item) => item.id === id);
        setNameEdits((prev) => ({ ...prev, [id]: currentItem.name }));
    };

    const handleSaveProductName = async (id) => {
        try {
            const newName = nameEdits[id];

            if (!newName.trim()) {
                return Swal.fire('Validation Error', 'Product name cannot be empty.', 'warning');
            }

            console.log('come here');
            const res = await axiosPublic.put(`/admin/update-product-type-name/${id}`, {
                name: newName,
            });

            await Swal.fire('Success!', 'Product name updated successfully.', 'success');

            setEditNameItemId(-1);
            refetch();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to update name.', 'error');
        }
    };

    const handleCancelNameEdit = () => {
        setEditNameItemId(-1);
    };

    return (
        <div className="container mx-auto pt-20 lg:pt-40">
            <Head>
                <title>Product Type</title>
            </Head>
            <h1 className="text-2xl font-bold mb-6 text-center">Product Types</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Category Name</th>
                            <th className="py-2 px-4 border-b">Size Chart</th>
                            <th className="py-2 px-4 border-b">Parent Categories</th>
                            <th className="py-2 px-4 border-b">Action</th>
                        </tr>
                    </thead>
                    {
                        isPending ?
                            <Loading />
                            :
                            <tbody>
                                {subSubCategories.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-100">
                                        <td className="py-2 px-4 border-b text-center">{item.id}</td>
                                        
                                        {/* item name update / edit  */}
                                        <td className="py-2 px-4 border-b text-center">
                                            {editNameItemId === item.id ? (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <input
                                                        type="text"
                                                        value={nameEdits[item.id] || ''}
                                                        onChange={(e) =>
                                                            setNameEdits((prev) => ({ ...prev, [item.id]: e.target.value }))
                                                        }
                                                        className="input input-sm input-bordered w-32"
                                                    />
                                                    <button onClick={() => handleSaveProductName(item.id)} className="btn btn-xs btn-success">Save</button>
                                                    <button onClick={handleCancelNameEdit} className="btn btn-xs btn-warning">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        disabled
                                                        className="input input-sm input-bordered w-32"
                                                    />
                                                    <button onClick={() => handleChangeProductName(item.id)} className="btn btn-xs btn-primary">
                                                        Change
                                                    </button>
                                                </div>
                                            )}
                                        </td>

                                        {/* size chart  */}
                                        <td className="py-2 px-4 border-b text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {/* Show image if exists */}
                                                {item.filename && (
                                                    <button onClick={() => handleShowImage(item.filename)}>
                                                        <img
                                                            className="h-16 cursor-pointer"
                                                            src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.filename}`}
                                                            alt="Size Chart"
                                                        />
                                                    </button>
                                                )}

                                                {/* Show file input and buttons if editing */}
                                                {editItem === item.id && (
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setMyFile(e.target.files[0])}
                                                    />
                                                )}

                                                <div
                                                    className="flex gap-2 mt-1">
                                                    {editItem === item.id && (
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="btn btn-warning btn-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditSizeChart(item)}
                                                        className={`btn btn-xs ${editable ? editItem === item.id ? 'btn-success' : 'btn-accent' : 'btn-accent'}`}
                                                    >
                                                        {editItem === item.id ? 'Save' : 'Edit'}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* parent categories  */}
                                        <td className="py-2 px-4 border-b text-center">{item.category.name}, {item.category.category.name}</td>
                                        <td>
                                            <button onClick={() => handleDeleteCProductType(item.id)} className="btn btn-sm btn-error">
                                                Delete <FaTrash></FaTrash>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                    }
                </table>
            </div>

            {/* Image Modal */}
            {isShowImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={closeImageModal}>
                    <img src={imageToShow} alt="Enlarged" className="max-w-full max-h-full rounded shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default ProductType;
