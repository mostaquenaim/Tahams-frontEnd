import React, { useState } from 'react';
import AdminDrawer from '../../../components/Drawers/AdminDrawer';

const AddSize = () => {
    const [sizeName, setSizeName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!sizeName) {
            setError('Size name is required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API}/admin/add-size`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: sizeName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add size');
            }

            setSizeName('');
            setSuccess('Size added successfully');
        } catch (error) {
            console.error('Error adding size:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (event) => {
        setSizeName(event.target.value);
    };

    return (
        <>
            <AdminDrawer />
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-700">Add Size</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="sizeName" className="block text-sm font-medium text-gray-700">Size Name</label>
                            <input
                                type="text"
                                id="sizeName"
                                name="sizeName"
                                value={sizeName}
                                onChange={handleNameChange}
                                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter size name"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
                    {success && <p className="mt-4 text-sm text-center text-green-600">{success}</p>}
                </div>
            </div>
        </>
    );
};

export default AddSize;
