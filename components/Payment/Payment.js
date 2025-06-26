import Image from 'next/image';
import React from 'react';
import { FaCreditCard, FaSmile, FaTruck, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { DeliveryMethods, PaymentMethods } from '/utils/Methods';

const Payment = () => {
    const allPaymentMethods = PaymentMethods()
    const deliveryMethods = DeliveryMethods()
    // console.log(allPaymentMethods, 'ress');
    return (
        <>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 pt-16 pb-10 px-10 text-center items-center shadow-md bg-black bg-opacity-20'>
                {/* payment  */}
                <section className='flex flex-col text-center gap-3 items-center'>
                    {/* icon  */}
                    <div className='text-center mx-auto'>
                        <FaCreditCard
                            size={40}
                        // color="#333"
                        />
                    </div>

                    <h1 className="text-xl font-semibold text-gray-800 mb-4">
                        Payment Processes
                    </h1>
                    {/* payment process icons */}
                    <div className="flex gap-2 md:gap-3 flex-wrap justify-center">
                        {
                            allPaymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className="relative w-fit mx-auto group text-center"
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-md p-1 transition-transform duration-300 transform shadow-black shadow-lg scale-105 bg-white border-t-2 border-black">
                                        {method.icon && (
                                            <Image
                                                src={method.icon}
                                                width={50}
                                                height={50}
                                                alt={method.name || 'Payment Method'}
                                            />
                                        )}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition duration-300 text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap z-10">
                                        {method.name}
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>
                {/* satisfaction  */}
                <section className='flex flex-col text-center gap-3'>
                    {/* icon  */}
                    <div className='text-center mx-auto'>
                        <FaSmile size={40}
                        // color="#333"
                        />
                    </div>

                    <h1 className="text-xl font-semibold text-gray-800 mb-4">
                        Satisfaction Guarantee
                    </h1>

                    <p>
                        We are committed to providing you with the best shopping experience. If you are not satisfied with your purchase, contact us, and we'll make it right.
                    </p>
                </section>
                {/* countrywide delivery */}
                <section className='flex flex-col text-center gap-3'>
                    {/* icon  */}
                    <div className='text-center mx-auto'>
                        <FaTruck size={40}
                        // color="#333"
                        />
                    </div>

                    <h1 className="text-xl font-semibold text-gray-800 mb-4">
                        Country-Wide Delivery
                    </h1>
                    <div className='flex gap-2 justify-center md:gap-4 flex-wrap'>
                        {
                            deliveryMethods.length > 0 &&
                            deliveryMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className="relative w-fit group text-center"
                                >
                                    <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-md p-1 transition-transform duration-300 transform shadow-black shadow-lg scale-105 bg-white border-t-2 border-black">
                                        {method.icon && (
                                            <Image
                                                src={method.icon}
                                                width={80}
                                                height={80}
                                                alt={method.name || 'Payment Method'}
                                            />
                                        )}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition duration-300 text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap z-10">
                                        {method.name}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </section>
            </div>
        </>
    );
};

export default Payment;