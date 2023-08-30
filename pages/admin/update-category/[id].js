import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const UpdateVehicle = ({ item }) => {

    const [updatedData, setUpdatedData] = useState({});
    const router = useRouter();

    const [success, setSuccess] = useState('')

    const handleUpdate = async () => {
        try {
            for (const key in item) {
                console.log(updatedData[key])
                if (!updatedData[key]) {
                    updatedData[key] = item[key]
                }
            }
            console.log(updatedData)
            await axios.put(`http://localhost:3000/admin/updateCategory/${item.id}`, updatedData);
            setSuccess(' update successfully');
        }
        catch (error) {
            setSuccess('Error updating user:', error);
        }
    };

    const handleDelete = async () => {
        try {
            console.log(updatedData)
            await axios.delete(`http://localhost:3000/admin/deleteCategory/${item.id}`);
            setSuccess(' deleted successfully');
            router.push('/admin/categories')
        }
        catch (error) {
            setSuccess('Error deleting:', error);
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
    };

    return (
        <>
            
            <div className="flex flex-col justify-center items-center text-center bg-gradient-to-b from-zinc-50 to-blue-100 h-screen">
                <div className="p-5 bg-white shadow-md w-96 flex flex-col gap-3 rounded-lg">
                    <h1 className="text-xl font-bold">Update Vehicle</h1>
                    <p className="text-red-500">{success}</p>
                    <div className="my-2">
                        {item.filename && (
                            <img
                                src={`http://localhost:3000/admin/getImage/${item.filename}`}
                                alt="User Image"
                                onError={(e) => {
                                    console.error("Error loading image:", e);
                                }}
                            />
                        )}
                    </div>
                    <div><Link href={`change-category-image/${item.id}`}>Update Image</Link></div>
                    <div className="my-2">
                        <label className="block font-semibold">category:</label>
                        <input
                            type="text"
                            name="categoryName"
                            value={updatedData.categoryName || item.categoryName}
                            onChange={handleInputChange}
                            className="border p-1 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleUpdate}
                        className="btn bg-blue-400 text-black hover:text-white hover:bg-blue-600 transition duration-300"
                    >
                        Update
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn btn-outline btn-error hover:text-red-600 transition duration-300"
                    >
                        Delete
                    </button>
                </div>
            </div>



        </>
    );
};

export default UpdateVehicle;

// Rest of the code remains the same


export async function getServerSideProps(context) {

    const id = context.params.id;

    console.log(id);

    const response = await axios.get(`http://localhost:3000/admin/getCategoryById/${id}`);
    const item = await response.data;

    return { props: { item } }
}