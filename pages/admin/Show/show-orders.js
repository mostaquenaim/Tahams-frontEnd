import React, { useContext } from 'react';
import useOrder from '../../../Hooks/useOrder';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Loading from '../../../components/Loading';
import Link from 'next/link';

const ShowOrders = () => {
    const { user, loading } = useContext(AuthContext);
    const [orders] = useOrder();

    // Group orders by history ID
    const groupedOrders = orders.reduce((acc, order) => {
        const key = order.history?.id;
        if (!acc[key]) {
            acc[key] = {
                history: order.history,
                orders: [],
                totalPrice: 0,
                deliveryFee: order.history?.deliveryFee || 0,
                customer: order.customer,
            };
        }
        acc[key].orders.push(order);
        acc[key].totalPrice += order.totalPrice;
        return acc;
    }, {});

    const groupedOrdersArray = Object.values(groupedOrders);

    const handleCheck = () => {
        console.log('Check clicked');
    }

    return (
        <div className='min-h-screen bg-gray-100 p-8'>
            <h1 className='text-3xl font-bold text-center mb-8'>Orders</h1>
            <div className='container mx-auto'>
                {loading ? (
                    <Loading />
                ) : groupedOrdersArray.length > 0 ? (
                    <table className='min-w-full bg-white'>
                        <thead>
                            <tr>
                                <th className='py-2 px-4 border-b'>Customer Name</th>
                                <th className='py-2 px-4 border-b'>Phone Number</th>
                                {/* <th className='py-2 px-4 border-b'>Number of Products</th> */}
                                <th className='py-2 px-4 border-b'>Product Names</th>
                                <th className='py-2 px-4 border-b'>Payment Details</th>
                                <th className='py-2 px-4 border-b'>Buying Date</th>
                                <th className='py-2 px-4 border-b'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedOrdersArray.map((group, index) => (
                                <tr key={index}>
                                    <td className='py-2 px-4 border-b'>{group.customer?.name}</td>
                                    <td className='py-2 px-4 border-b'>{group.history?.phone_no}</td>
                                    {/* <td className='py-2 px-4 border-b'>{group.orders.length}</td> */}
                                    <td className='py-2 px-4 border-b'>
                                        {group.orders.map(order => (
                                            <>
                                            <Link key={order.product.id} href={`/products/details/${order.product.id}`}>
                                                <span className='text-blue-500 hover:underline'>{order.product.name}</span>
                                            </Link> </>
                                        )).reduce((prev, curr) => [prev, ', ', curr])}
                                    </td>
                                    <td className='py-2 px-4 border-b'>{group.history?.paymentMethod?.name}</td>
                                    <td className='py-2 px-4 border-b'>
                                        {new Date(group.history?.BuyingDate).toLocaleDateString()}
                                    </td>
                                    <td className='py-2 px-4 border-b flex gap-2'>
                                        <Link href={`show-order-details/${group.history?.id}`}>
                                            <span className='text-blue-500 hover:underline'>Details</span>
                                        </Link>
                                        <span>|</span>
                                        <button onClick={handleCheck}>
                                            <span className='text-blue-500 hover:underline'>Check</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className='text-center text-gray-600'>No orders found.</p>
                )}
            </div>
        </div>
    );
};

export default ShowOrders;
