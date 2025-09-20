import Link from 'next/link';
import React from 'react';
import { FaEye } from 'react-icons/fa';

const ShowOrderComp = ({ group, idx, cardBtnStyle }) => {
  // console.log('group', group);
    return (
        <div
            key={idx}
            className={`bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1`}
        >
            <div className="flex flex-col md:space-x-6 space-y-4 md:space-y-0">
                <div className="">
                    <div className='flex justify-between'>
                        <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-1 md:mb-3">
                            {group.history.paymentMethod.name}
                        </h2>
                        <button>
                            {/* ... icon  */}
                        </button>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-4">
                        Order Placed on {new Date(group.history.BuyingDate).toLocaleDateString()}
                    </p>
                </div>
                <ul className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.orders.map((order, idx) => (
                        <li
                            key={idx}
                            className="relative bg-gray-50 p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out"
                        >
                            <Link href={`/products/details/${order.product.productId}`} className="block group">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product.filename}`}
                                    alt={order.product.name}
                                    className="w-full h-40 md:h-48 object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                                />
                                <div className="mt-2 md:mt-3">
                                    <h3 className="text-sm md:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 ease-in-out">
                                        {order.product.name}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                                        Category: <span className="font-semibold text-gray-600">{order.category.category.name}</span>
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-500">
                                        Size: <span className="font-semibold text-gray-600">{order.size}</span>
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-4 md:mt-6">
                <p className="text-lg md:text-xl font-bold text-gray-800">
                    Total Price: <span className="text-green-600">{(group.totalPrice + group.deliveryFee).toFixed(2)} BDT</span>
                </p>
            </div>
            <Link href={`my-orders/details/${group.history.trackingToken}`} className="block mt-3 md:mt-4">
                <button
                    className={`w-full btn btn-accent flex items-center justify-center gap-2 ${cardBtnStyle} hover:bg-accent-hover transition duration-300 ease-in-out`}
                >
                    <FaEye /> View Details
                </button>
            </Link>
        </div>
    );
};

export default ShowOrderComp;
