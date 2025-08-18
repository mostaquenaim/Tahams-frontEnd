import React, { useContext } from 'react';
import useOrder from '../../../Hooks/useOrder';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Image from 'next/image';
import Loading from '../../../components/Loading';
import Head from 'next/head';

const ShowOrdersDraft = () => {
    const { user, loading } = useContext(AuthContext);
    const [orders, refetch] = useOrder();

    // console.log("orders",orders);

    // Group orders by history ID
    const groupedOrders = orders.reduce((acc, order) => {
        const key = order.history?.id;
        if (!acc[key]) {
            acc[key] = {
                history: order.history,
                orders: [],
                totalPrice: 0,
                deliveryFee: order.history?.deliveryFee || 0,
                customer: order.customer, // Ensure this is correctly set
            };
        }
        acc[key].orders.push(order);
        acc[key].totalPrice += order.totalPrice;
        return acc;
    }, {});

    const groupedOrdersArray = Object.values(groupedOrders);

    console.log(groupedOrdersArray,'groupedOrdersArray');

    return (
        <div className='min-h-screen bg-gray-100 p-8'>
        <Head>
            <title>Show order draft </title>
        </Head>
            <h1 className='text-3xl font-bold text-center mb-8'>Orders</h1>
            <div className='container mx-auto'>
                {
                    loading ?
                        <Loading />
                        :
                        groupedOrdersArray.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {groupedOrdersArray.map((group, index) => (
                                    <div key={index} className='bg-white p-6 rounded-lg shadow-md'>
                                        <div className='mb-4'>
                                            <h2 className='text-xl font-semibold mb-2'>Order Group</h2>
                                            <p className='text-gray-600 mb-2'>Total Price: BDT {group.totalPrice + group.deliveryFee} (Includes delivery fee: BDT {group.deliveryFee})</p>
                                        </div>

                                        {group.orders.map(order => (
                                            <div key={order.id} className='mb-6'>
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product?.filename}`}
                                                    alt={order.product?.name}
                                                    width={250}
                                                    height={250}
                                                    className='rounded-md mb-4'
                                                />
                                                <h3 className='text-lg font-bold'>{order.product?.name}</h3>
                                                <p className='text-gray-600'>Size: {order.size}</p>
                                                <p className='text-gray-600'>Quantity: {order.Quantity}</p>
                                                <p className='text-gray-700 font-semibold'>Price: BDT {order.totalPrice}</p>
                                            </div>
                                        ))}

                                        {/* Customer Info */}
                                        <div className='mb-4'>
                                            <h3 className='text-lg font-bold'>Customer Info:</h3>
                                            <p className='text-gray-600'>Name: {group.customer?.name}</p>
                                            <p className='text-gray-600'>Email: {group.customer?.email}</p>
                                            <p className='text-gray-600'>Phone: {group.customer?.mbl_no}</p>
                                        </div>

                                        {/* Delivery Details */}
                                        <div className='mb-4'>
                                            <h3 className='text-lg font-bold'>Delivery Details:</h3>
                                            <p className='text-gray-600'>Status: {group.history?.deliveryStatus?.name}</p>
                                            <p className='text-gray-600'>Address: {group.history?.address}</p>
                                            {group.history?.city && <p className='text-gray-600'>City: {group.history.city}</p>}
                                            {group.history?.region && <p className='text-gray-600'>Region: {group.history.region}</p>}
                                            {group.history?.phone_no && <p className='text-gray-600'>Phone no: {group.history.phone_no}</p>}
                                            <p className='text-gray-600'>Payment Method: {group.history?.paymentMethod?.name}</p>
                                        </div>

                                        {/* Order Timeline */}
                                        <div className='mb-4'>
                                            <h3 className='text-lg font-bold'>Order Timeline:</h3>
                                            <ul className='list-disc list-inside text-gray-600'>
                                                <li>Order Placed: {new Date(group.history?.BuyingDate).toLocaleDateString()}</li>
                                                <li>Processed: {group.history?.processedDate ? new Date(group.history.processedDate).toLocaleDateString() : 'Processing...'}</li>
                                                <li>Ready to Ship: {group.history?.readyToShipDate ? new Date(group.history.readyToShipDate).toLocaleDateString() : 'Pending'}</li>
                                                <li>Dropped Off: {group.history?.droppedOffDate ? new Date(group.history.droppedOffDate).toLocaleDateString() : 'Pending'}</li>
                                                <li>Delivered: {group.history?.deliveredDate ? new Date(group.history.deliveredDate).toLocaleDateString() : 'Pending'}</li>
                                            </ul>
                                        </div>

                                        {/* Payment Proof */}
                                        {group.history?.screenshot && (
                                            <div className='mb-4'>
                                                <h3 className='text-lg font-bold'>Payment Proof:</h3>
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${group.history.screenshot}`}
                                                    alt="Payment Proof"
                                                    width={300}
                                                    height={200}
                                                    className='w-full h-40 object-cover rounded-md'
                                                />
                                            </div>
                                        )}

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-center text-gray-600'>No orders found.</p>
                        )}
            </div>
        </div>
    );
};

export default ShowOrdersDraft;
