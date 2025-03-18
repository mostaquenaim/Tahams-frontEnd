import React, { useContext, useEffect, useState } from 'react';
import NavbarCompTwo from '../../../components/Header/NavbarComp';
import Footer from '../../../components/Footer/Footer';
import { useRouter } from 'next/router';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdMoreHoriz } from 'react-icons/md';
import OrderComp from '../../../components/orderComp';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Head from 'next/head';

const OrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
    const [error, setError] = useState(null);
    const [showOptions, setShowOptions] = useState(false);  // State for showing return/cancel options
    const router = useRouter();
    const axiosPublic = useAxiosPublic();

    const { token } = router.query;

    const { user } = useContext(AuthContext);
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (token) {
                try {
                    const userEmail = localStorage.getItem('email');

                    const tmpEmail = user?.email || userEmail ||
                        (typeof window !== "undefined" && JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email);

                    if (!tmpEmail) {
                        throw new Error('No email found for the user or guest');
                    }

                    const response = await axiosPublic.get(`/admin/get-buying-history-by-token/${token}?email=${tmpEmail}`);
                    console.log(response.data, 26);
                    setOrderDetails(response.data);
                } catch (err) {
                    setError('Failed to fetch order details. Please try again later.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrderDetails();
    }, [router.query, user?.email]);

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const LoadingIndicator = () => (
        <div className="flex justify-center items-center h-64">
            <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-500" />
        </div>
    );

    const ErrorMessage = () => (
        <div className="flex justify-center items-center h-64 text-red-500">
            <MdErrorOutline className="text-4xl mr-2" />
            <p>{error}</p>
        </div>
    );

    const handleCancellation = () => {
        router.push(`cancel-or-return/${token}`)
    }

    // const closeConfirmationModal = () => {
    //     setIsConfirmationModalOpen(false);
    // };

    const OrderInfo = () => (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4 flex justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
                    {
                        orderDetails.length > 0 &&
                        <p className="text-sm text-gray-600">Ordered at {new Date(orderDetails[0].history.BuyingDate).toLocaleDateString()}</p>
                    }
                </div>
                <button onClick={toggleOptions}> {/* Toggle options on click */}
                    <MdMoreHoriz className="text-gray-600 text-xl" />
                </button>
            </div>
            {showOptions && (  // Conditionally render options based on showOptions state
                <div className="flex flex-col space-y-2 mb-4">
                    <button onClick={handleCancellation} className="text-red-500 hover:text-red-700">
                        {
                            orderDetails.length > 0 && (
                                orderDetails[0].history.deliveryStatus.id < 4 ?
                                    'Cancel Order' :
                                    orderDetails[0].history.deliveryStatus.id == 6 &&
                                    'Return Order'
                            )

                        }
                        {/* Cancel Order */}
                    </button>
                </div>
            )}
            {orderDetails.length > 0 &&
                <>
                    {orderDetails.map((order, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex mb-4">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product.filename}`}
                                    alt={order.product.name}
                                    className="h-48 w-auto object-cover rounded-lg"
                                />
                            </div>
                            <div className="">
                                <p className="text-sm text-gray-700">
                                    <strong>Product:</strong> {order.product.name}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Category:</strong> {order.category.category.category.name}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Size:</strong> {order.size || "N/A"}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Quantity:</strong> {order.Quantity}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Price:</strong> {order.totalPrice} BDT
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="mb-4">
                        <p className={`text-sm ${orderDetails[0].history.deliveryStatus.name === "Delivered" ? "text-green-500" : "text-orange-500"}`}>
                            <strong>Status:</strong> {orderDetails[0].history.deliveryStatus.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Payment Method:</strong> {orderDetails[0].history.paymentMethod.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Payment Done:</strong> {orderDetails[0].history.PaymentDone ? "Yes" : "No"}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-700">
                            <strong>Customer Name:</strong> {orderDetails[0].customer.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Email:</strong> {orderDetails[0].customer.email}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Phone:</strong> {orderDetails[0].history.phone_no}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-700">
                            <strong>Address:</strong> {orderDetails[0].history.address}, {orderDetails[0].history.region}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong>Delivery Fee:</strong> {orderDetails[0].history.deliveryFee} BDT
                        </p>
                        <div className="mb-4">
                            <p className="text-lg font-bold text-gray-800">
                                <strong>Total Price:</strong> {orderDetails.reduce((acc, current) => acc + current.totalPrice, 0) + orderDetails[0].history.deliveryFee} BDT
                            </p>
                        </div>
                    </div>
                </>
            }
            <OrderComp orderDetails={orderDetails[0]?.history} />
        </div>
    );

    return (
        <div>
            <Head>
                <title>Order - {token && token} </title>
            </Head>
            <div className='container mx-auto px-4 py-8 pt-40 min-h-screen'>
                <h1 className="text-3xl font-semibold text-center mb-8">Order Details</h1>
                {loading ? <LoadingIndicator /> : error ? <ErrorMessage /> : orderDetails ? <OrderInfo /> : <p className="text-center text-xl text-gray-600">Order details not available.</p>}
            </div>
        </div>
    );
};

export default OrderDetails;
