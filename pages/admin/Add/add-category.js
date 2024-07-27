import React, { useEffect, useState } from 'react';
import AdminDrawer from '../../../components/Drawers/AdminDrawer';
import SelectionFormComp from '../../../components/Product/SelectionFormComp';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [categories, setCategories] = useState([])
    const [selectedCat, setSelectedCat] = useState('')

    const axiosPublic = useAxiosPublic()

    //load categories
    const loadCategories = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-product-categories');
            // console.log(result.data);
            setCategories(result.data);
        } catch (error) {
            console.error('Error loading Categories:', error);
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm();

    useEffect(() => {
        loadCategories()
    }, [])

    const handleChange = (event) => {
        setCategoryName(event.target.value);
    };

    const onSubmit = async (data) => {
        // Validate inputs
        if (!categoryName || !selectedCat) {
            toast.error('Please provide all the required information.');
            return;
        }

        const formData = {
            name : categoryName,
            categoryName : selectedCat,
        };

        try {
            const response = await axiosPublic.post('/admin/add-subCategory', formData);
            setCategoryName('');
            setSelectedCat('');
            reset();
            setSuccess('Category added successfully!');
            toast.success('Category added successfully!');
        } catch (error) {
            setError('Error adding category: ' + error.response.data.message)
            toast.error('Error adding category: ' + error.response.data.message);
        }
    };

    return (
        <>
            <AdminDrawer />
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-700">Add Category</h2>
                    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                        <div>
                            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input
                                type="text"
                                id="categoryName"
                                name="categoryName"
                                value={categoryName}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter Category name"
                            />
                        </div>
                        {/* SelectionFormComp = ({selectedValue, setFunction, defaultShown, values, errors, register  }) */}
                        {
                            categories &&
                            <SelectionFormComp label={'Select a series for this category'} name={'category'} selectedValue={selectedCat} setFunction={setSelectedCat} defaultShown={'Select a series'} values={categories} errors={errors} register={register} />
                        }
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add
                        </button>
                    </form>
                    {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
                    {success && <p className="mt-4 text-sm text-center text-green-600">{success}</p>}
                </div>
            </div>
        </>
    );
};

export default AddCategory;
