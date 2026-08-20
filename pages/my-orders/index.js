import React, { useContext } from 'react';
import useOrder from '../../Hooks/useOrder';
import Loading from '../../components/Loading';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import ShowOrderComp from '../../components/Show/ShowOrderComp';
import Head from 'next/head';

const ShowOrders = () => {
    const { user, loading } = useContext(AuthContext);
    const [orders] = useOrder(1,100,true, true);
    // const axiosPublic = useAxiosPublic();

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
    const cardBtnStyle = 'bg-black text-white duration-300 hover:shadow-lg hover:shadow-black hover:scale-105 hover:-translate-y-1'

    return (
        <>
            <Head>
                <title>My Orders - Tahams</title>
            </Head>
            <div className='min-h-screen bg-gray-100 p-8 pt-60 lg:pt-60'>
                <h1 className='text-3xl font-bold text-center mb-8'>Orders</h1>
                <div className='container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center'>
                    {loading ? (
                        <Loading />
                    ) : groupedOrdersArray.length > 0 ? (
                        groupedOrdersArray.map((group, index) => (
                            <ShowOrderComp group={group} idx={index} cardBtnStyle={cardBtnStyle} />
                        ))
                    ) : (
                        <p className='text-center text-base sm:text-xl text-gray-600 col-span-full'>No orders found.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ShowOrders;