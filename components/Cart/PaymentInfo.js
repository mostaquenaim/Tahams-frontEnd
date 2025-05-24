import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { useRouter } from 'next/router';
import { DeliveryContext } from '../../Contexts/DeliveryFee';

const PaymentInfo = ({ history }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const axiosPublic = useAxiosPublic();
    const router = useRouter();

    const deliveryFee = useContext(DeliveryContext)

    const [paymentInfo, setPaymentInfo] = useState({
        accountNumber: '',
        screenshot: null,
    });

    const handlePaymentMethodChange = (method) => {
        setSelectedPaymentMethod(method);
    };

    const paymentMethods = [
        { id: 1, name: 'Cash on Delivery', icon: '/cod.png', process: 'Payment upon delivery' },
        { id: 2, name: 'BKash', icon: '/bkash-bnw.png', process: 'Merchant Number: 01314188605 (PAYMENT)\nReference: Your name and amount you pay' },
        { id: 3, name: 'Nagad', icon: '/nagad-bnw.png', process: 'Merchant Number: 01602054102 (PAYMENT)\nReference: Your name and amount you pay' },
        { id: 4, name: 'Rocket', icon: '/rocket-bnw.png', process: 'Number: 01602054102 (Send Money)\nReference: Your name and amount you pay' },
        // { id: 5, name: 'Visa Card', icon: '/visa.png', process: 'Please proceed with your Visa Card details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        { id: 6, name: 'Bank Transfer', icon: '/bank-transfer.jpg', process: 'Please proceed with your Bank details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        // { id: 7, name: 'Amex Card', icon: '/amex.png', process: 'Please proceed with your AMEX Card details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001' },
        { id: 8, name: 'Pick-Up Point', icon: '/cop-bnw.png', process: 'Pay when you pick up your item.' },
    ];

    useEffect(() => {
        setSelectedPaymentMethod(paymentMethods[0]); // Set default payment method
    }, []);

    const handleConfirmPayment = async () => {
        // console.log(history);

        if ([2, 3, 4, 6].includes(selectedPaymentMethod.id)) {
            if (!paymentInfo.accountNumber || !paymentInfo.screenshot) {
                toast.error('Please fill up all the fields.');
                return;
            }
        }

        try {
            const formData = new FormData();
            // console.log(selectedPaymentMethod,'===',history);
            formData.append('paymentMethod', selectedPaymentMethod.id);
            formData.append('accountNumber', paymentInfo?.accountNumber || null);
            formData.append('screenshot', paymentInfo?.screenshot || null);
            formData.append('history', history[0].history.trackingToken);
            formData.append('customer', history[0].customer.email);

            const tempItems = []
            const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];

            const sum = cartItems.reduce((acc, item) => {
                // Assuming item.product.sellingPrice and item.Quantity are numbers
                return acc + parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity;
            }, 0);

            const newTotalPrice = sum + deliveryFee;

            cartItems.forEach((item) => {
                tempItems.push({
                    item_id: item.product.id,
                    item_name: item.product.name,
                    item_color: item.ProductName.split(" ")[0] || "Unknown",
                    item_series: item.category?.category?.category?.name || "N/A",
                    main_category: item.category?.category?.name || "N/A",
                    sub_category: item.category?.name || "N/A",
                    item_price: parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity || 0,
                    total_views: item.product.totalViews || 0,
                    // selected_category: selectedCategory,
                    selected_size: item.size || null,
                    selected_maleSize: item.maleSize || null,
                    selected_femaleSize: item.femaleSize || null,
                    discount_percent: item.product.discountPercentage || 0,
                    quantity: item.Quantity,
                })
            })

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "payment_method",
                ecommerce: {
                    currency: "BDT",
                    totalPrice: newTotalPrice,
                    coupon: cartItems[0]?.coupon,
                    payment_method: selectedPaymentMethod.name,
                    customer_email: history[0].customer.email,
                    customer_name: history[0].customer.name,
                    buying_date: history[0].history.BuyingDate,
                    region: history[0].history.region,
                    address: history[0].history.address,
                    delivery_fee: history[0].history.deliveryFee,
                    phone_no: history[0].history.phone_no,
                    items: tempItems
                }
            });

            const response = await axiosPublic.post('/admin/add-payment', formData);

            if (response.status >= 200 && response.status <= 300) {
                toast.success(
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                            <strong style={{ fontSize: '1.1em', color: '#000' }}>Payment Complete!</strong>
                            <p style={{ margin: 0, fontSize: '0.9em', color: '#333' }}>
                                Thank you for your payment.<br />Our representative will contact you shortly.
                            </p>
                        </div>
                    </div>,
                    {
                        duration: 5000,
                        style: {
                            background: '#ffffff',
                            border: '1px solid #000000',
                            borderRadius: '8px',
                            padding: '16px',
                            color: '#000000'
                        }
                    }
                );
                router.push('/my-orders');
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
        <div className='flex justify-center px-4'>
            <div className='w-full max-w-lg border-2 p-2 md:p-5 border-black rounded-md shadow-lg'>
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Payment Information</h2>

                {/* Payment Method Options */}
                <div className="mb-4">
                    <label className="text-gray-600 font-semibold block mb-2">Select Payment Method:</label>
                    <div className="flex gap-2 md:gap-3 flex-wrap justify-center">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-md p-1 transition-transform duration-300 
                                    ${selectedPaymentMethod.id === method.id
                                        ? 'transform shadow-black shadow-lg scale-105 text-white'
                                        : 'bg-white text-black border border-black'
                                    }`}
                                onClick={() => handlePaymentMethodChange(method)}
                            >
                                {method.icon && <Image src={method.icon} width={50} height={50} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Additional fields based on the selected payment method */}
                {[2, 3, 4, 6].includes(selectedPaymentMethod.id) && (
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex flex-col">
                            <label htmlFor="accountNumber" className="font-semibold mb-2">Account Number:</label>
                            <input
                                type="text"
                                id="accountNumber"
                                name="accountNumber"
                                value={paymentInfo.accountNumber}
                                onChange={handleInputChange}
                                className="p-2 border border-gray-400 rounded-md"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="screenshot" className="font-semibold mb-2">Screenshot Proof:</label>
                            <input
                                type="file"
                                id="screenshot"
                                name="screenshot"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="p-2 border border-gray-400 rounded-md"
                            />
                        </div>
                    </div>
                )}

                <div className="mt-4">
                    <p className="text-gray-600 font-semibold">Payment Process:</p>
                    <p className="whitespace-pre-line text-gray-800">
                        {paymentMethods.find((method) => method.id === selectedPaymentMethod.id)?.process}
                    </p>
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleConfirmPayment}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentInfo;
