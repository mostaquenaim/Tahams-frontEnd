import { useForm } from 'react-hook-form';
import axios from "axios"
import { useState, useEffect } from "react"
import SessionCheck from '../../components/Auth/sessionCheck';
import Drawer from '../../components/Drawers/drawer';

const AddSize = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [success, setSuccess] = useState('')

    const onSubmit = async (data) => {

        try {
            const response = await axios.post(`https://tahams-test-production.up.railway.app/admin/addSize`, data);
            setSuccess('Size added successfully');
        } catch (error) {
            console.error('Error creating Size:', error);
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
                                Add New Size
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
                                    {...register('size', { required: true })}
                                    className="border p-1 rounded w-full focus:outline-none focus:border-blue-500"
                                />
                                {errors.size && (
                                    <p className="text-red-500">This field is required</p>
                                )}
                            </div>


                            <button
                                type="submit"
                                className="btn bg-blue-400 text-black hover:text-white hover:bg-blue-600 transition duration-300 mt-4"
                            >
                                Add Size
                            </button>
                        </form>
                    </div>
                </div>
            </section>

        </>
    );
};

export default AddSize;