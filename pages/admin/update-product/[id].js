import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const UpdateProduct = ({ item }) => {

    const [updatedData, setUpdatedData] = useState({});
    const router = useRouter();

    const [success, setSuccess] = useState('')
    const [successColor, setSuccessColor] = useState("");

    const handleUpdate = async () => {

        try {
            for (const key in item) {
                console.log(updatedData[key])
                if (!updatedData[key]) {
                    updatedData[key] = item[key]
                }
            }
            setSuccessColor("text-green-500");
            await axios.put(`http://localhost:3000/admin/updateProduct/${item.id}`, updatedData);
            setSuccess(' update successfully');

        }
        catch (error) {
            setSuccess('Error updating user:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const confirmation = confirm("Are you sure you want to delete? ")

            if (confirmation) {
                console.log("updatedData", updatedData)
                const response = await axios.delete(`http://localhost:3000/admin/deleteProduct/${item.id}`);
                console.log("response", response.data)

                setSuccess(' deleted successfully');
                router.push('/admin/Products')
            }
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
                    <h1 className="text-xl font-bold">Update Product</h1>
                    <p className={successColor}>{success}</p>
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
                    <div><Link href={`change-product-image/${item.id}`}>Update Image</Link></div>
                    <div className="my-2">
                        <label className="block font-semibold">product:</label>
                        <input
                            type="text"
                            name="name"
                            value={updatedData.name || item.name}
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

export default UpdateProduct;

// Rest of the code remains the same


export async function getServerSideProps(context) {

    const id = context.params.id;

    console.log(id);

    const response = await axios.get(`http://localhost:3000/admin/getProductById/${id}`);
    const item = await response.data;

    return { props: { item } }
}