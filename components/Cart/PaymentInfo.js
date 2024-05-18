import React, { useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

const PaymentInfo = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const axios = useAxiosPublic()

    const [paymentInfo, setPaymentInfo] = useState({
        bankName: '',
        accountNumber: '',
        mobileNumber: '',
        screenshot: null,
    });

    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method);
    };

    const handlePayment = async () => {
        // Check if form fields are filled up
        if (selectedPaymentMethod === 'bankPayment') {
            if (!paymentInfo.bankName || !paymentInfo.accountNumber) {
                toast.error('Please fill up all the fields.');
                return;
            }
        } else if (selectedPaymentMethod === 'bkash' || selectedPaymentMethod === 'nagad') {
            if (!paymentInfo.mobileNumber || !paymentInfo.screenshot) {
                toast.error('Please fill up all the fields.');
                return;
            }
        }
    
        try {
            // Create FormData object
            const formData = new FormData();
    
            // Append payment details to FormData
            formData.append('paymentMethod', selectedPaymentMethod);
            formData.append('bankName', paymentInfo?.bankName || null);
            formData.append('accountNumber', paymentInfo?.accountNumber || null);
            formData.append('mobileNumber', paymentInfo?.mobileNumber || null);
            formData.append('screenshot', paymentInfo?.screenshot || null);
    
            // Assuming `your-backend-url` is the base URL of your backend
            const response = await axios.post(`/admin/add-payment`, formData);
    
            if (response.status >= 200 && response.status <= 300) {
                // Payment was successful
                toast.success('Payment confirmed!');
            } else {
                // Payment failed
                toast.error('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            toast.error('Error submitting payment. Please try again.');
        }
    };
    

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setPaymentInfo((prevInfo) => ({
            ...prevInfo,
            [name]: files ? files[0] : value,
        }));
    };

    const paymentMethods = [
        { id: 'bkash', name: 'bKash', icon: '/bkash.png', process: 'Send money to 01602054102' },
        { id: 'nagad', name: 'Nagad', icon: '/nagad.png', process: 'Send money to 01602054102' },
        { id: 'cashOnDelivery', name: 'Cash on Delivery', icon: '/cod.png', process: 'Payment upon delivery' },
        // { id: 'bankPayment', name: 'Bank Payment', icon: '/mastercard.png', process: 'Card details not available' },
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
                            className={`btn ${selectedPaymentMethod === method.id
                                ? 'transform shadow-black shadow-lg bg-white scale-105 text-white'
                                : 'bg-white text-black'
                                } border-black text-black`}
                            onClick={() => handlePaymentMethodChange(method.id)}>
                            {method.icon && <Image src={method.icon} width={50} height={50} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Additional fields based on the selected payment method */}
            {selectedPaymentMethod === 'bankPayment' ? (
                <div>
                    {/* Add fields for bank payment details */}
                    <label htmlFor="bankName">Bank Name:</label>
                    <input
                        type="text"
                        id="bankName"
                        name="bankName"
                        value={paymentInfo.bankName}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="accountNumber">Account Number:</label>
                    <input
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        value={paymentInfo.accountNumber}
                        onChange={handleInputChange}
                    />
                </div>
            ) : selectedPaymentMethod === 'bkash' || selectedPaymentMethod === 'nagad' ? (
                <div>
                    {/* Add fields for mobile number and screenshot upload */}
                    <label htmlFor="mobileNumber">Mobile Number:</label>
                    <input
                        type="text"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={paymentInfo.mobileNumber}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="screenshot">Screenshot Proof:</label>
                    <input
                        type="file"
                        id="screenshot"
                        name="screenshot"
                        accept="image/*"
                        onChange={handleInputChange}
                    />
                </div>
            ) : null}

            {/* Display payment process information */}
            <div className="mt-4">
                <p className="text-gray-600 font-semibold">Payment Process:</p>
                <p>{paymentMethods.find((method) => method.id === selectedPaymentMethod)?.process}</p>
                {/* {selectedPaymentMethod !== 'cashOnDelivery' && (
                    <div>
                        <p className="text-gray-600 font-semibold">Additional Details:</p>
                        <p>{paymentMethods.find((method) => method.id === selectedPaymentMethod)?.details}</p>
                    </div>
                )} */}
            </div>

            {/* Add a submit button or any other actions based on the selected payment method */}
            <div className="mt-6">
                <button
                    onClick={handlePayment}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Confirm Payment
                </button>
            </div>

            <Toaster />
        </div>
    );
};

export default PaymentInfo;
