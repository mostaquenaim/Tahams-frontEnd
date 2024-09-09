import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { useRouter } from 'next/router';

const PaymentInfo = ({ history }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const axiosPublic = useAxiosPublic();
    const router = useRouter();

    const [paymentInfo, setPaymentInfo] = useState({
        accountNumber: '',
        screenshot: null,
    });

    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method);
    };

    const paymentMethods = [
        { id: 1, name: 'Cash on Delivery', icon: '/cod.png', process: 'Payment upon delivery' },
        { id: 2, name: 'BKash', icon: '/bkash.png', process: 'Merchant Number: 01602054102 (PAYMENT)\nReference: Your name and amount you pay' },
        { id: 3, name: 'Nagad', icon: '/nagad.png', process: 'Merchant Number: 01602054102 (PAYMENT)\nReference: Your name and amount you pay' },
        { id: 4, name: 'Rocket', icon: '/rocket.png', process: 'Number: 01602054102 (Send Money)\nReference: Your name and amount you pay' },
        { id: 5, name: 'Visa Card', icon: '/visa.png', process: 'Please proceed with your Visa Card details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        { id: 6, name: 'MasterCard', icon: '/mastercard.png', process: 'Please proceed with your MasterCard details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        { id: 7, name: 'Amex Card', icon: '/amex.png', process: 'Please proceed with your AMEX Card details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        { id: 8, name: 'Pick-Up Point', icon: '/cop.png', process: 'Pay when you pick up your item.' },
    ];

    useEffect(() => {
        setSelectedPaymentMethod(paymentMethods[0]); // Set default payment method
    }, []);

    const handleConfirmPayment = async () => {
        if ([2, 3, 4, 5, 6, 7].includes(selectedPaymentMethod.id)) {
            if (!paymentInfo.accountNumber || !paymentInfo.screenshot) {
                toast.error('Please fill up all the fields.');
                return;
            }
        }

        try {
            const formData = new FormData();
            // console.log('history',history);
            formData.append('paymentMethod', selectedPaymentMethod.id); // Send the name instead of ID
            formData.append('accountNumber', paymentInfo?.accountNumber || null);
            formData.append('screenshot', paymentInfo?.screenshot || null);
            formData.append('history', history[0].history.trackingToken);
            formData.append('customer', history[0].customer.email);

            const response = await axiosPublic.post('/admin/add-payment', formData);

            if (response.status >= 200 && response.status <= 300) {
                toast.success('Payment confirmed!');
                router.push('/');
            } else {
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
                            className={`btn ${selectedPaymentMethod.id === method.id
                                ? 'transform shadow-black shadow-lg bg-white scale-105 text-white'
                                : 'bg-white text-black'
                                } border-black text-black`}
                            onClick={() => handlePaymentMethodChange(method)}>
                            {method.icon && <Image src={method.icon} width={50} height={50} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Additional fields based on the selected payment method */}
            {[2, 3, 4, 5, 6, 7].includes(selectedPaymentMethod.id) && ( // For BKash, Nagad, Rocket, Visa, MasterCard, Amex
                <div>
                    <label htmlFor="accountNumber">Account Number:</label>
                    <input
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        value={paymentInfo.accountNumber}
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
            )}

            <div className="mt-4">
                <p className="text-gray-600 font-semibold">Payment Process:</p>
                <p style={{ whiteSpace: 'pre-line' }}>
                    {paymentMethods.find((method) => method.id === selectedPaymentMethod.id)?.process}
                </p>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleConfirmPayment}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Confirm Payment
                </button>
            </div>
        </div>
    );
};

export default PaymentInfo;
