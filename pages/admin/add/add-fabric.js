import React, { useState } from 'react';
import AdminDrawer from '../../../components/Drawers/AdminDrawer';
import Head from 'next/head';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

const AddFabric = () => {
    const [fabricName, setFabricName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const axiosSecure = useAxiosSecure();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!fabricName) {
            setError('Fabric name is required');
            setLoading(false);
            return;
        }

        try {
            await axiosSecure.post('/admin/add-fabric', { name: fabricName });

            setFabricName('');
            setSuccess('Fabric added successfully');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add fabric';
            console.error('Error adding fabric:', message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (event) => {
        setFabricName(event.target.value);
    };

    return (
        <>
        <Head>
            <title>Add Fabric - Admin</title>
        </Head>
            {/* <AdminDrawer /> */}
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-700">Add Fabric</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fabricName" className="block text-sm font-medium text-gray-700">Fabric Name</label>
                            <input
                                type="text"
                                id="fabricName"
                                name="fabricName"
                                value={fabricName}
                                onChange={handleNameChange}
                                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter fabric name"
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

export default AddFabric;
