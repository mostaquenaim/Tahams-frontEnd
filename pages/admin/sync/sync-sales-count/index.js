import toast from 'react-hot-toast';
import useAxiosSecure from '/Hooks/useAxiosSecure';
import React from 'react';

const SyncSalesCount = () => {
    const axiosSecure = useAxiosSecure()

    const handleSyncSales = async () => {
        const result = await axiosSecure.put(`admin/sync-sales-count`)
        toast.success('synced sales count')
    }
    return (
        <div className='flex items-center justify-center text-center w-full min-h-screen'>
            <button onClick={handleSyncSales} className='btn btn-success btn-lg'>
                sync sales count
            </button>
        </div>
    );
};

export default SyncSalesCount;