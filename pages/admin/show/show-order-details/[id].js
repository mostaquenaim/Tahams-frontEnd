import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import Image from 'next/image';
import useOrder from '../../../../Hooks/useOrder';
import { AuthContext } from '../../../../Contexts/Auth/AuthProvider';
import OrderComp from '../../../../components/orderComp';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Link from 'next/link';
import {
  FaEnvelope,
  FaTrash,
  FaTimes,
  FaBox,
  FaUser,
  FaTruck,
  FaShoppingBag,
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaCreditCard,
  FaReceipt,
} from 'react-icons/fa';
import useAxiosPublic from '../../../../Hooks/useAxiosPublic';
import Modal from 'react-modal';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

const ShowOrderDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useContext(AuthContext);
  const [orders] = useOrder();
  const { loading } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isConfirmationMessageBoxOpen, setIsConfirmationMessageBoxOpen] =
    useState(false);
  const [message, setMessage] = useState('');

  // Filtered Order Details
  const group = orders.filter((order) => order.history?.id == id);
  if (group.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="text-center">
          <FaBox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No order details found</p>
        </div>
      </div>
    );
  }

  const customer = group[0]?.customer;
  const history = group[0]?.history;

  // Modal handlers
  const openMessageBox = () => setIsConfirmationMessageBoxOpen(true);
  const closeMessageBox = () => setIsConfirmationMessageBoxOpen(false);

  const openConfirmationModal = () => setIsConfirmationModalOpen(true);
  const closeConfirmationModal = () => setIsConfirmationModalOpen(false);

  // Handle delete with confirmation
  const handleDelete = async () => {
    try {
      const res = await axiosPublic.put(
        `/admin/delete-history/${history?.trackingToken}?email=${user?.email}`,
      );
      closeConfirmationModal();
      router.push('/admin/show/show-orders');
    } catch (error) {
      console.error('Failed to delete order history:', error);
    }
  };

  // Handle message sending
  const handleSendMessage = async () => {
    try {
      // Implementation here
      closeMessageBox();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCancellation = () => {
    router.push(
      `/my-orders/details/cancel-or-return/${history?.trackingToken}`,
    );
  };

  const getStatusColor = (statusId) => {
    if (statusId > 6) return 'bg-red-500';
    if (statusId === 6) return 'bg-emerald-500';
    return 'bg-amber-500';
  };

  const totalPrice =
    group.reduce((acc, order) => acc + order.totalPrice, 0) +
    (history?.deliveryFee || 0);

  return (
    <>
      <Head>
        <title>Order #{id} - Order Details</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 lg:p-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <Loading />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors mb-4"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
                Back to Orders
              </button>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        Order #{history?.id}
                      </h1>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg text-white ${getStatusColor(
                          history?.deliveryStatus?.id,
                        )}`}
                      >
                        <FaClock className="w-3.5 h-3.5" />
                        {history?.deliveryStatus?.name}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Placed on{' '}
                      {new Date(history?.BuyingDate).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleCancellation}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FaTimes className="w-4 h-4" />
                      Cancel Order
                    </button>
                    <button
                      onClick={openMessageBox}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FaEnvelope className="w-4 h-4" />
                      Send Message
                    </button>
                    <button
                      onClick={openConfirmationModal}
                      className=" items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* main content  */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Products Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaShoppingBag className="w-4 h-4 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Order Items
                      </h2>
                    </div>
                  </div>
                  {/* ordered items  */}
                  <div className="p-6 space-y-4">
                    {group.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Link
                          href={`/products/details/${order.product.productId}`}
                          className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product?.filename}`}
                            alt={order.product?.name || 'Product Image'}
                            layout="fill"
                            objectFit="cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/details/${order.product.productId}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {order.product?.name}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.category.name} •{' '}
                            {order.category.category.name} •{' '}
                            {order.category.category.category.name}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg">
                              {order.category.category.category.name ===
                                'Couples' && 'Male '}
                              Size: {order.size}
                            </span>
                            {order.category.category.category.name ===
                              'Couples' && (
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg">
                                Female Size: {order.femaleSize}
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg">
                              Qty: {order.Quantity}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">
                            ৳{order.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Payment Proof */}
                {history?.screenshot && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FaReceipt className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Payment Proof
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="relative w-full h-96 rounded-xl overflow-hidden border-2 border-gray-200">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${history.screenshot}`}
                          alt="Payment Proof"
                          layout="fill"
                          objectFit="contain"
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Component */}
                {/* order status  */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <OrderComp orderDetails={history} admin={true} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaReceipt className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Order Summary
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">
                        ৳
                        {group
                          .reduce((acc, order) => acc + order.totalPrice, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">
                        ৳{(history?.deliveryFee || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-blue-600">
                          ৳{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Customer Info
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Name
                      </p>
                      <p className="text-gray-900 font-medium">
                        {customer?.name || history?.fullName || 'N/A'}
                      </p>
                    </div>
                    {customer?.email && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Email
                        </p>
                        <p className="text-gray-900 font-medium">
                          {customer.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Phone
                      </p>
                      <p className="text-gray-900 font-medium">
                        {history?.phone_no || customer?.mbl_no || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <FaTruck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Delivery Details
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        <FaMapMarkerAlt className="inline w-3 h-3 mr-1" />
                        Address
                      </p>
                      <p className="text-gray-900 font-medium">
                        {history?.address || 'N/A'}
                      </p>
                    </div>
                    {history?.city && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          City
                        </p>
                        <p className="text-gray-900 font-medium">
                          {history.city}
                        </p>
                      </div>
                    )}
                    {history?.region && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Region
                        </p>
                        <p className="text-gray-900 font-medium">
                          {history.region}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        <FaCreditCard className="inline w-3 h-3 mr-1" />
                        Payment Method
                      </p>
                      <p className="text-gray-900 font-medium">
                        {history?.paymentMethod?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {isConfirmationModalOpen && (
                <Modal
                  isOpen={isConfirmationModalOpen}
                  onRequestClose={closeConfirmationModal}
                  contentLabel="Confirm Deletion"
                  ariaHideApp={false}
                  className="fixed inset-0 flex items-center justify-center p-4 z-50"
                  overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <FaTrash className="w-8 h-8 text-red-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Delete Order
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete this order? This action
                        cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={closeConfirmationModal}
                          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Modal>
              )}
            </AnimatePresence>

            {/* Message Modal */}
            <AnimatePresence>
              {isConfirmationMessageBoxOpen && (
                <Modal
                  isOpen={isConfirmationMessageBoxOpen}
                  onRequestClose={closeMessageBox}
                  contentLabel="Send Message"
                  ariaHideApp={false}
                  className="fixed inset-0 flex items-center justify-center p-4 z-50"
                  overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-blue-100 rounded-lg">
                        <FaEnvelope className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Send Message
                      </h2>
                    </div>
                    <textarea
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
                      placeholder="Type your message here..."
                      rows="6"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={closeMessageBox}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </motion.div>
                </Modal>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
};

export default ShowOrderDetails;
