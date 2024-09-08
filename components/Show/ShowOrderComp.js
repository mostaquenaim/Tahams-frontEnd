import Link from 'next/link';
import React from 'react';
import { FaEye } from 'react-icons/fa';

const ShowOrderComp = ({ group, idx, cardBtnStyle }) => {
    // console.log('order',order);
    return (
        <div
            key={idx}
            className={`bg-white p-4 rounded shadow-md relative`}
        >
            <h2 className='text-lg font-bold mb-2'>{group.history.paymentMethod.name}</h2>
            <ul className='list-none mb-4'>
                {group.orders.map((order, idx) => (
                    <li key={idx} className='mb-2'>
                        <Link className='block' href={`/products/details/${order.product.id}`}>
                            <img src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product.filename}`} alt={order.product.name}
                                className='w-48 h-48 rounded mr-2' />
                            <span className='text-blue-500 hover:underline'>{order.product.name}</span>
                        </Link>
                        <span className='text-gray-600'>Category: <span className='font-semibold'>{order.category.category.name}, {order.category.category.category.name}</span></span>
                        <br />
                        <span className='text-gray-600'>Size: <span className='font-semibold'>{order.size}</span></span>
                        <br />
                    </li>
                ))}
            </ul>
            <p className='text-lg font-bold mb-2'>Total Price: {group.totalPrice + group.deliveryFee}</p>
            <Link className='absolute bottom-2 left-0 w-full flex justify-center' href={`my-orders/details/${group.history.trackingToken}`}>
                <button className={`btn btn-sm btn-accent ${cardBtnStyle}`}>
                    <FaEye /> Details
                </button>
            </Link>
        </div>
    );
};

export default ShowOrderComp;