import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  MdErrorOutline,
  MdMoreHoriz,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdPerson,
  MdLocalShipping,
  MdPayment,
  MdCheckCircle,
} from 'react-icons/md';
import { BsBoxSeam, BsCreditCard } from 'react-icons/bs';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Head from 'next/head';

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  // Shown when the email this browser knows (or has none of) doesn't match
  // the order - lets a guest who still has the link, but lost the
  // localStorage identity they checked out with, verify with their phone
  // number instead (the same proof-of-ownership the backend now accepts -
  // see AdminService.getBuyingHistoryByToken).
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  const { token } = router.query;
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token) return;

      const userEmail = localStorage.getItem('email');
      const tmpEmail =
        user?.email ||
        userEmail ||
        (typeof window !== 'undefined' &&
          JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email);

      if (!tmpEmail) {
        setNeedsPhoneVerification(true);
        setLoading(false);
        return;
      }

      try {
        const response = await axiosPublic.get(
          `/admin/get-buying-history-by-token/${token}?email=${tmpEmail}`,
        );
        if (response.data.length === 0) {
          setNeedsPhoneVerification(true);
        } else {
          setOrderDetails(response.data);
        }
      } catch (err) {
        setError('Failed to fetch order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [router.query, user?.email]);

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    setVerifyingPhone(true);
    setError(null);
    try {
      const response = await axiosPublic.get(
        `/admin/get-buying-history-by-token/${token}?phone=${encodeURIComponent(phoneInput.trim())}`,
      );
      if (response.data.length === 0) {
        setError('No order found for that phone number on this link.');
      } else {
        setOrderDetails(response.data);
        setNeedsPhoneVerification(false);
      }
    } catch (err) {
      setError('Failed to verify. Please try again later.');
    } finally {
      setVerifyingPhone(false);
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const LoadingIndicator = () => (
    <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <AiOutlineLoading3Quarters className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading order details...</p>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="flex justify-center items-center h-96">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
        <MdErrorOutline className="text-5xl text-red-500 mx-auto mb-4" />
        <p className="text-red-700 text-center text-lg font-medium">{error}</p>
      </div>
    </div>
  );

  const PhoneVerification = () => (
    <div className="flex justify-center items-center h-96">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <MdPhone className="text-4xl text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Verify to view this order
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          We couldn&apos;t recognize this browser as the one used to place this order.
          Enter the phone number used at checkout to verify it&apos;s yours.
        </p>
        <form onSubmit={handlePhoneVerify} className="flex flex-col gap-3">
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Phone number used at checkout"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={verifyingPhone}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {verifyingPhone ? 'Checking...' : 'View order'}
          </button>
        </form>
      </div>
    </div>
  );

  const handleCancellation = () => {
    router.push(`cancel-or-return/${token}`);
  };

  const getStatusColor = (statusName) => {
    const statusColors = {
      Delivered: 'bg-green-100 text-green-800 border-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Processing: 'bg-blue-100 text-blue-800 border-blue-200',
      Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      statusColors[statusName] || 'bg-gray-100 text-gray-800 border-gray-200'
    );
  };

  const OrderInfo = () => (
    <div className="max-w-6xl mx-auto">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 md:p-8 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Order Details
            </h1>
            {orderDetails.length > 0 && (
              <div className="flex items-center text-blue-100">
                <BsBoxSeam className="mr-2" />
                <p className="text-sm md:text-base">
                  Ordered on{' '}
                  {new Date(
                    orderDetails[0].history.BuyingDate,
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={toggleOptions}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 transition-all duration-200"
            >
              <MdMoreHoriz className="text-2xl" />
            </button>
            {showOptions &&
              orderDetails[0].history?.deliveryStatus?.id &&
              orderDetails.length > 0 && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-10 min-w-[200px]">
                  <button
                    onClick={handleCancellation}
                    className=" w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center"
                  >
                    {orderDetails[0].history.deliveryStatus.id < 4 ? (
                      <>
                        <span className="mr-2">❌</span> Cancel Order
                      </>
                    ) : (
                      orderDetails[0].history.deliveryStatus.id === 6 && (
                        <>
                          <span className="mr-2">↩️</span> Return Order
                        </>
                      )
                    )}
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <BsBoxSeam className="mr-2 text-blue-600" />
                Order Items
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {orderDetails.map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product.filename}`}
                      alt={order.product.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-xl shadow-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {order.product.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Category:</span>{' '}
                        {order.category.category.category.name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Size:</span>{' '}
                        {order.size || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Quantity:</span>{' '}
                        {order.Quantity}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Price:</span>{' '}
                        {order.totalPrice} BDT
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Timeline */}
          {/* {orderDetails.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <MdLocalShipping className="mr-2 text-blue-600" />
                                Order Status
                            </h2>
                            <OrderComp orderDetails={orderDetails[0]?.history} />
                        </div>
                    )} */}
        </div>

        {/* Sidebar - Summary & Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          {orderDetails.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Order Summary
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(orderDetails[0].history.deliveryStatus.name)}`}
                  >
                    {orderDetails[0].history.deliveryStatus.name}
                  </span>
                </div>

                {/* Payment Info */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <MdPayment className="mr-2" /> Payment Method:
                    </span>
                    <span className="font-medium text-gray-800">
                      {orderDetails[0].history.paymentMethod.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <MdCheckCircle className="mr-2" /> Payment Status:
                    </span>
                    <span
                      className={`font-medium ${orderDetails[0].history.PaymentDone ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      {orderDetails[0].history.PaymentDone ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>
                      {orderDetails.reduce(
                        (acc, current) => acc + current.totalPrice,
                        0,
                      )}{' '}
                      BDT
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee:</span>
                    <span>{orderDetails[0].history.deliveryFee} BDT</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {orderDetails.reduce(
                      (acc, current) => acc + current.totalPrice,
                      0,
                    ) + orderDetails[0].history.deliveryFee}{' '}
                    BDT
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          {orderDetails.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Customer Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <MdPerson className="text-blue-600 text-xl mr-3 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Name
                    </p>
                    <p className="text-gray-800 font-medium">
                      {orderDetails[0].customer?.name || orderDetails[0].history?.fullName || 'N/A'}
                    </p>
                  </div>
                </div>
                {orderDetails[0].customer?.email && (
                  <div className="flex items-start">
                    <MdEmail className="text-blue-600 text-xl mr-3 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-gray-800 font-medium break-all">
                        {orderDetails[0].customer.email}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <MdPhone className="text-blue-600 text-xl mr-3 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="text-gray-800 font-medium">
                      {orderDetails[0].history.phone_no}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MdLocationOn className="text-blue-600 text-xl mr-3 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Delivery Address
                    </p>
                    <p className="text-gray-800 font-medium">
                      {orderDetails[0].history.address},{' '}
                      {orderDetails[0].history.region}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Order Details - {token && token}</title>
      </Head>
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-32 lg:pt-44">
        {loading ? (
          <LoadingIndicator />
        ) : orderDetails.length > 0 ? (
          <OrderInfo />
        ) : needsPhoneVerification ? (
          <PhoneVerification />
        ) : error ? (
          <ErrorMessage />
        ) : (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <BsBoxSeam className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">
                Order details not available.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
