import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import useOrder from '../../../Hooks/useOrder';
import Loading from '../../../components/Loading';
import Image from 'next/image';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Head from 'next/head';

const ShowOrderDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [orders] = useOrder();
    const { loading } = useContext(AuthContext)
  // console.log('orders', orders);

    const group = orders.find(order => order.history?.id === id);

    if (!group) {
        return <div>No order details found</div>;
    }

    return (
        <div className='min-h-screen bg-gray-100 p-8'>
            <Head>
                <title>Order details - Admin</title>
            </Head>
            <h1 className='text-3xl font-bold text-center mb-8'>Order Details</h1>
            {
                loading ?
                    <Loading />
                    :
                    <div className='container mx-auto bg-white p-6 rounded-lg shadow-md'>
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

                    </div>
            }
        </div>
    );
};

export default ShowOrderDetails;
