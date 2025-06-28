import toast from 'react-hot-toast';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import React from 'react';

const SyncSalesCount = () => {
    const axiosPublic = useAxiosPublic()

    const handleSyncSales = async () => {
        const result = await axiosPublic.put(`admin/sync-sales-count`)
        console.log(result.data,'ss');
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