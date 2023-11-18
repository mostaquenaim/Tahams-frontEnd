import React from 'react';
import { FaCreditCard, FaSmile, FaTruck, FaCcVisa, FaCcMastercard } from 'react-icons/fa';

const Payment = () => {
    return (
        <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 pb-10 px-10 text-center items-center shadow-md bg-black bg-opacity-20'>
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
                    <div className='flex gap-2 text-3xl items-center'>
                        <FaCcVisa className='hover:opacity-80'></FaCcVisa>
                        <FaCcMastercard className='hover:opacity-80'></FaCcMastercard>
                        <img className='h-16 hover:opacity-80' src='/cod.png'></img>
                        <img className='h-12 hover:opacity-80' src='/cop.png'></img>
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

                    <div className='flex gap-2 justify-center'>
                        <img src="https://pathao.com/bn/wp-content/uploads/sites/6/2019/02/Pathao_Logo-.svg" alt="logo"></img>
                        <img className='h-10' src="/sundarban.jpg" alt=""></img>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Payment;