import React, { useState } from 'react';

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://api.tahamsbd.com/admin/addCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryName: categoryName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add category');
            }

            setCategoryName('');
            setSuccess('Category added successfully');
        } catch (error) {
            console.error('Error adding category:', error.message);
            setError(error.message);
        }
    };

    const handleChange = (event) => {
        setCategoryName(event.target.value);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-700">Add Category</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
                        <input
                            type="text"
                            id="categoryName"
                            name="categoryName"
                            value={categoryName}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Enter category name"
                        />
                    </div>
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
    );
};

export default AddCategory;
