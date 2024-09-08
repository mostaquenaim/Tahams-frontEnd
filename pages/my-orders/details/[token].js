import React, { useContext, useEffect, useState } from 'react';
import NavbarCompTwo from '../../../components/Header/NavbarComp';
import Footer from '../../../components/Footer/Footer';
import { useRouter } from 'next/router';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline } from 'react-icons/md';
import OrderComp from '../../../components/Draft/orderComp';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';

const OrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const { token } = router.query;
            if (token) {
                try {
                    const userEmail = localStorage.getItem('email');
                    const response = await axiosPublic.get(`/admin/get-buying-history-by-token/${token}?email=${user?.email || userEmail}`);
                    console.log(response.data);
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

    const OrderInfo = () => (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4 text-center">
                {/* <h2 className="text-lg font-semibold text-gray-800">Order #{orderDetails.uniqueId}</h2> */}
                <p className="text-sm text-gray-600">Ordered at {new Date(orderDetails.history.BuyingDate).toLocaleDateString()}</p>
            </div>
            <div className="mb-4 text-center">
                <img 
                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${orderDetails.product.filename}`} 
                    alt={orderDetails.product.name} 
                    className="h-48 w-auto object-cover rounded-lg mb-4 mx-auto"
                />
                <p className="text-sm text-gray-700"><strong>Product:</strong> {orderDetails.product.name}</p>
                <p className="text-sm text-gray-700"><strong>Size:</strong> {orderDetails.size || "N/A"}</p>
                <p className="text-sm text-gray-700"><strong>Quantity:</strong> {orderDetails.Quantity}</p>
                <p className="text-sm text-gray-700"><strong>Price:</strong> {orderDetails.totalPrice} BDT</p>
            </div>
            <div className="mb-4">
                <p className={`text-sm ${orderDetails.history.deliveryStatus.name === "Delivered" ? "text-green-500" : "text-orange-500"}`}>
                    <strong>Status:</strong> {orderDetails.history.deliveryStatus.name}
                </p>
                <p className="text-sm text-gray-700"><strong>Payment Method:</strong> {orderDetails.history.paymentMethod.name}</p>
                <p className="text-sm text-gray-700"><strong>Payment Done:</strong> {orderDetails.history.PaymentDone ? "Yes" : "No"}</p>
            </div>
            <div className="mb-4">
                <p className="text-sm text-gray-700"><strong>Customer Name:</strong> {orderDetails.customer.name}</p>
                <p className="text-sm text-gray-700"><strong>Email:</strong> {orderDetails.customer.email}</p>
                <p className="text-sm text-gray-700"><strong>Phone:</strong> {orderDetails.history.phone_no}</p>
            </div>
            <div className="mb-4">
                <p className="text-sm text-gray-700"><strong>Address:</strong> {orderDetails.history.address}, {orderDetails.history.city}, {orderDetails.history.region}</p>
                <p className="text-sm text-gray-700"><strong>Delivery Fee:</strong> {orderDetails.history.deliveryFee} BDT</p>
            </div>
            {/* delivery path  */}
            <OrderComp orderDetails={orderDetails} />
        </div>
    );

    return (
        <div>
            {/* <NavbarCompTwo /> */}
            <div className='container mx-auto px-4 py-8 pt-40 min-h-screen'>
                <h1 className="text-3xl font-semibold text-center mb-8">Order Details</h1>
                {loading ? <LoadingIndicator /> : error ? <ErrorMessage /> : orderDetails ? <OrderInfo /> : <p className="text-center text-xl text-gray-600">Order details not available.</p>}
            </div>
          {/* <Footer /> */} 
        </div>
    );
};

export default OrderDetails;
