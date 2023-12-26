import Image from 'next/image';
import React, { useState } from 'react';

const PaymentInfo = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method);
    };

    const paymentMethods = [
        { id: 'bkash', name: 'bKash', icon: '/bkash.png' },
        { id: 'nagad', name: 'Nagad', icon: '/nagad.png' },
        { id: 'cashOnDelivery', name: 'Cash on Delivery', icon: '/cod.png' },
        { id: 'bankPayment', name: 'Bank Payment', icon: '/mastercard.png' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

            {/* Payment Method Options */}
            <div className="mb-4">
                <label className="text-gray-600 font-semibold">Select Payment Method:</label>
                <div className="flex gap-3 flex-wrap">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            className={`btn ${
                                selectedPaymentMethod === method.id
                                    ? 'bg-gray-400 text-white'
                                    : 'bg-white text-black'
                            } border-black text-black`}
                            onClick={() => handlePaymentMethodChange(method.id)}
                        >
                            {
                                method.icon &&
                            <Image src={method.icon} width={50} height={50}></Image>
                            }
                            {/* {method.name} */}
                        </button>
                    ))}
                </div>
            </div>

            {/* Additional fields based on the selected payment method */}
            {selectedPaymentMethod === 'bankPayment' && (
                <div>
                    {/* Add fields for bank payment details */}
                    <label htmlFor="bankName">Bank Name:</label>
                    <input type="text" id="bankName" name="bankName" />

                    <label htmlFor="accountNumber">Account Number:</label>
                    <input type="text" id="accountNumber" name="accountNumber" />

                    {/* Add any other fields as needed */}
                </div>
            )}

            {/* Add a submit button or any other actions based on the selected payment method */}
            <div className="mt-6">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Continue to Payment
                </button>
            </div>
        </div>
    );
};

export default PaymentInfo;
