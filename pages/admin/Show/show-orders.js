import React, { useContext } from 'react';
import useOrder from '../../../Hooks/useOrder';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Loading from '../../../components/Loading';
import Link from 'next/link';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { motion } from 'framer-motion'; // Import framer-motion

const ShowOrders = () => {
    const { user, loading } = useContext(AuthContext);
    const [orders, refetch] = useOrder();
    const axiosPublic = useAxiosPublic();

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

    // Sort the grouped orders array based on isChecked and checkedDate
    const groupedOrdersArray = Object.values(groupedOrders);

    const sortedGroupedOrdersArray = groupedOrdersArray.sort((a, b) => {
        // Sort by check status first
        if (a.history.isChecked && !b.history.isChecked) {
            return 1; // b should come before a
        } else if (!a.history.isChecked && b.history.isChecked) {
            return -1; // a should come before b
        } else if (a.history.isChecked && b.history.isChecked) {
            // If both are checked, sort by the most recent checked date
            return new Date(b.history.checkedDate) - new Date(a.history.checkedDate);
        } else {
            // If neither is checked, maintain the original order
            return 0;
        }
    });


    const handleCheck = async (history) => {
        const res = await axiosPublic.patch(`admin/update-history/${history.trackingToken}?email=${user?.email}`, {
            isChecked: !history.isChecked,
            checkedDate: new Date().toISOString(),
        });

        refetch();
    };

    return (
        <div className='min-h-screen bg-gray-100 p-8'>
            <h1 className='text-3xl font-bold text-center mb-8'>Orders</h1>
            <div className='container mx-auto'>
                {loading ? (
                    <Loading />
                ) : sortedGroupedOrdersArray.length > 0 ? (
                    <table className='min-w-full bg-white'>
                        <thead>
                            <tr>
                                <th className='py-2 px-4 border-b'>ID</th>
                                <th className='py-2 px-4 border-b'>Customer Name</th>
                                <th className='py-2 px-4 border-b'>Phone Number</th>
                                <th className='py-2 px-4 border-b'>Product Names</th>
                                <th className='py-2 px-4 border-b'>Payment Details</th>
                                <th className='py-2 px-4 border-b'>Buying Date</th>
                                <th className='py-2 px-4 border-b'>Actions</th>
                                <th className='py-2 px-4 border-b'>ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedGroupedOrdersArray.map((group, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ y: group.history.isChecked ? 0 : -20 }} // Initial position
                                    animate={{ y: group.history.isChecked ? 20 : 0 }} // Final position when checked
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }} // Smooth animation
                                    className={group.history.isChecked ? 'bg-green-100' : 'bg-white'}
                                >
                                    <td className='py-2 px-4 border-b'>{group.history.id}</td>
                                    <td className='py-2 px-4 border-b'>{group.customer?.name}</td>
                                    <td className='py-2 px-4 border-b'>{group.history?.phone_no}</td>
                                    <td className='py-2 px-4 border-b'>
                                        {group.orders.map((order, idx) => (
                                            <Link key={idx} href={`/products/details/${order.product.id}`}>
                                                <span className='text-blue-500 hover:underline'>{order.product.name}</span>
                                            </Link>
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
                                        {group.history.isChecked ? (
                                            <span>&#10004;</span> // tick box
                                        ) : (
                                            <button onClick={() => handleCheck(group.history)}>
                                                <span className='text-blue-500 hover:underline'>Check</span>
                                            </button>
                                        )}
                                    </td>
                                    <td className='py-2 px-4 border-b'>{group.history.id}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                        {/* <tfoot>
                            <tr>
                                -
                            </tr>
                            <tr>
                                <th className='py-2 px-4 border-b'>ID</th>
                                <th className='py-2 px-4 border-b'>Customer Name</th>
                                <th className='py-2 px-4 border-b'>Phone Number</th>
                                <th className='py-2 px-4 border-b'>Product Names</th>
                                <th className='py-2 px-4 border-b'>Payment Details</th>
                                <th className='py-2 px-4 border-b'>Buying Date</th>
                                <th className='py-2 px-4 border-b'>Actions</th>
                                <th className='py-2 px-4 border-b'>ID</th>
                            </tr>
                        </tfoot> */}
                    </table>
                ) : (
                    <p className='text-center text-gray-600'>No orders found.</p>
                )}
            </div>
        </div>
    );
};

export default ShowOrders;
