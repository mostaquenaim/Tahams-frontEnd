import { useForm } from 'react-hook-form';
import axios from "axios"
import { useState, useEffect } from "react"
import SessionCheck from '../../components/Auth/sessionCheck';
import Drawer from '../../components/Drawers/drawer';

function AddCategory() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("")
    const [success, setSuccess] = useState('')
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchCategories();
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3000/admin/view-product-categories');
            setCategories(response.data);
        } catch (error) {
            // Handle errors here, e.g., log the error or show an error message.
            console.error('Error fetching data:', error);
        }
    };

    const onSubmit = async (data) => {

        try {
            const UserEmail = sessionStorage.getItem('email')
            setEmail(UserEmail)

            const checkAvailability = categories.some((category) => category.categoryName === data.categoryName)

            if (checkAvailability) setSuccess(`${data.categoryName} already exists`);
            else {
                const response = await axios.post(`http://localhost:3000/admin/addCategory`, data);
                console.log('Category:', response.data);

                setSuccess('Category added successfully');
            }

        } catch (error) {
            console.error('Error creating Category:', error);
        }
    };

    return (
        <>
            <Drawer title="Add Size" />
            <SessionCheck />
            <section className="text-gray-600 body-font">
                <div className="container mx-auto bg-gradient-to-b from-zinc-50 to-blue-100 h-screen">
                    <div className="flex flex-wrap w-full mb-20 justify-center text-center items-center">
                        <div className="w-full mb-6">
                            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
                                Add New Category
                            </h1>
                            <p>{success}</p>
                            <div className="h-1 w-20 bg-indigo-500 rounded"></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            encType="multipart/form-data"
                            action="#"
                            className="w-96 bg-white p-5 shadow-md rounded-lg"
                        >
                            <div className="my-2">
                                <label className="block font-semibold">Name</label>
                                <input
                                    type="text"
                                    {...register('categoryName', { required: true })}
                                    className="border p-1 rounded w-full focus:outline-none focus:border-blue-500"
                                />
                                {errors.categoryName && (
                                    <p className="text-red-500">This field is required</p>
                                )}
                            </div>


                            <button
                                type="submit"
                                className="btn bg-blue-400 text-black hover:text-white hover:bg-blue-600 transition duration-300 mt-4"
                            >
                                Add Category
                            </button>
                        </form>
                    </div>
                </div>
            </section>

        </>
    );
}

export default AddCategory;
