import { useState } from "react";
import useLoadSubSubCategories from "../../../../Hooks/useLoadSubSubCategories";
import useAxiosPublic from "../../../../Hooks/useAxiosPublic";
import Loading from "../../../../components/Loading";
import Head from "next/head";

const ProductType = () => {
    const [subSubCategories, refetch, isPending] = useLoadSubSubCategories();
    const [myfile, setMyFile] = useState('');
    const [editable, setEditable] = useState(false);
    const [editItem, setEditItem] = useState(-1);
    const [isShowImage, setIsShowImage] = useState(false);
    const [imageToShow, setImageToShow] = useState('');

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
                console.log(res.data);
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
                                        <td className="py-2 px-4 border-b text-center">{item.name}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            {item.filename ? (
                                                <button onClick={() => handleShowImage(item.filename)}>
                                                    <img className="h-16 cursor-pointer" src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.filename}`} alt="Size Chart" />
                                                </button>
                                            ) : (
                                                <div className="flex">
                                                    {editItem === item.id && (
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setMyFile(e.target.files[0])}
                                                        />
                                                    )}
                                                    <div className="flex gap-1">
                                                        {editItem === item.id && (
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="btn btn-warning btn-sm">
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditSizeChart(item)}
                                                            className={`btn btn-sm ${editable ? editItem === item.id ? 'btn-success' : 'btn-disabled' : 'btn-accent'}`}>
                                                            {editItem === item.id ? 'Save' : 'Edit'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 border-b text-center">{item.category.name}, {item.category.category.name}</td>
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
