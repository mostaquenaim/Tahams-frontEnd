import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import Image from 'next/image';
import useOrder from '../../../../Hooks/useOrder';
import { AuthContext } from '../../../../Contexts/Auth/AuthProvider';

const ShowOrderDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [orders] = useOrder();
    const { loading } = useContext(AuthContext);

    const group = orders.filter(order => order.history?.id == id);
    if (group.length === 0) {
        return <div className='min-h-screen flex items-center justify-center text-xl'>No order details found</div>;
    }

    const customer = group[0]?.customer;
    const history = group[0]?.history;

    return (
        <div className='min-h-screen bg-gray-100 p-4 flex justify-center'>
            {loading ? (
                <div className='flex justify-center items-center min-h-screen'>
                    <Loading />
                </div>
            ) : (
                <div className='w-full max-w-4xl bg-white rounded-lg shadow-lg p-6'>
                    <h1 className='text-2xl font-bold text-center mb-6'>Order Details</h1>
                    
                    {/* Order Summary Section */}
                    <div className='grid lg:grid-cols-2 gap-6'>
                        <div className=''>
                            <h2 className='text-xl font-semibold mb-4'>Order Group</h2>
                            <p className='text-gray-700 mb-4'>
                                Total Price: BDT {group.reduce((acc, order) => acc + order.totalPrice, 0) + history.deliveryFee}
                                (Delivery fee: BDT {history.deliveryFee})
                            </p>
                        </div>

                        {/* Customer Info */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <h3 className='text-lg font-semibold mb-2'>Customer Info</h3>
                            <p className='text-gray-700'>Name: {customer?.name || 'N/A'}</p>
                            <p className='text-gray-700'>Email: {customer?.email || 'N/A'}</p>
                            <p className='text-gray-700'>Phone: {customer?.mbl_no || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Order Products Section */}
                    <div className='grid lg:grid-cols-2 gap-6 mt-6'>
                        {group.map(order => (
                            <div key={order.id} className='bg-gray-50 p-4 rounded-lg flex'>
                                <div className='w-32 h-32 relative mr-4'>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product?.filename}`}
                                        alt={order.product?.name || 'Product Image'}
                                        layout='fill'
                                        objectFit='cover'
                                        className='rounded-md'
                                    />
                                </div>
                                <div className='flex flex-col justify-between'>
                                    <h3 className='text-lg font-semibold mb-2'>{order.product?.name}</h3>
                                    <p className='text-gray-600'>Size: {order.size}</p>
                                    <p className='text-gray-600'>Quantity: {order.Quantity}</p>
                                    <p className='text-gray-700 font-semibold'>Price: BDT {order.totalPrice}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delivery and Timeline Section */}
                    <div className='grid lg:grid-cols-2 gap-6 mt-6'>
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <h3 className='text-lg font-semibold mb-2'>Delivery Details</h3>
                            <p className='text-gray-700'>Status: {history?.deliveryStatus?.name || 'N/A'}</p>
                            <p className='text-gray-700'>Address: {history?.address || 'N/A'}</p>
                            {history?.city && <p className='text-gray-700'>City: {history.city}</p>}
                            {history?.region && <p className='text-gray-700'>Region: {history.region}</p>}
                            {history?.phone_no && <p className='text-gray-700'>Phone no: {history.phone_no}</p>}
                            <p className='text-gray-700'>Payment Method: {history?.paymentMethod?.name || 'N/A'}</p>
                        </div>

                        {/* Order Timeline */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <h3 className='text-lg font-semibold mb-2'>Order Timeline</h3>
                            <ul className='list-disc list-inside text-gray-700'>
                                <li>Order Placed: {new Date(history?.BuyingDate).toLocaleDateString() || 'N/A'}</li>
                                <li>Processed: {history?.processedDate ? new Date(history.processedDate).toLocaleDateString() : 'Pending'}</li>
                                <li>Ready to Ship: {history?.readyToShipDate ? new Date(history.readyToShipDate).toLocaleDateString() : 'Pending'}</li>
                                <li>Dropped Off: {history?.droppedOffDate ? new Date(history.droppedOffDate).toLocaleDateString() : 'Pending'}</li>
                                <li>Delivered: {history?.deliveredDate ? new Date(history.deliveredDate).toLocaleDateString() : 'Pending'}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Payment Proof Section */}
                    {history?.screenshot && (
                        <div className='mt-6'>
                            <h3 className='text-lg font-semibold mb-2'>Payment Proof</h3>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${history.screenshot}`}
                                alt="Payment Proof"
                                width={600}
                                height={400}
                                className='w-full h-auto object-cover rounded-md'
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShowOrderDetails;
