import React, { useContext, useEffect, useState } from 'react';
import { FaBox, FaHeart, FaUser, FaShoppingBag, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { FiLogOut, FiArrowRight } from 'react-icons/fi';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import useOrder from '../../Hooks/useOrder';
import useWish from '../../Hooks/useWish';
import Loading from '../../components/Loading';
import Link from 'next/link';
import useCart from '../../Hooks/useCart';
import Head from 'next/head';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, logOut, loading } = useContext(AuthContext);
  const [userData, setUserData] = useState('');
  const [orders] = useOrder(1,100, true, true);
  const [isPending, wish] = useWish();
  const [isLoading, cart] = useCart();

  useEffect(() => {
    !loading && user ? setUserData(user) : setUserData(getGuestCustomerInfo());
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 lg:pt-40">
        <Loading />
      </div>
    );
  }

  const handleLogout = () => {
    logOut()
      .then(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userInfo');
          localStorage.removeItem('access_token');
        }
      })
      .catch((error) => {
        console.error('Error during logout:', error.message);
        toast.error('Error during logout. Please try again.');
      });
  };

  const totalSpent = orders?.reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;
  const cartTotal = cart?.reduce((acc, item) => acc + item.product.sellingPrice * item.Quantity, 0) || 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Head>
        <title>Dashboard - {user ? userData.displayName : 'Guest'}</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 lg:p-8 pt-20 lg:pt-40">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 mt-28 sm:mt-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    Welcome back, {user ? userData.displayName?.split(' ')[0] : userData.username}!
                  </h1>
                  <p className="text-gray-600">Manage your orders, wishlist, and account settings</p>
                </div>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link href="/login">
                    <span className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm">
                      Login
                      <FiArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Orders</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{orders?.length || 0}</p>
              <p className="text-sm text-gray-600 mt-1">All time purchases</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <FaChartLine className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Spent</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">৳{totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Lifetime value</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <FaHeart className="w-6 h-6 text-pink-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Wishlist</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{wish?.length || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Saved items</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <AiOutlineShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Cart Value</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">৳{cartTotal.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">{cart?.length || 0} items</p>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
              <div className="px-6 pb-6">
                <div className="flex items-start -mt-12 mb-4">
                  <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-white">
                    <FaUser className="w-12 h-12 text-gray-700" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {user ? userData.displayName : userData.username}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{userData?.email}</p>
                {userData?.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="w-4 h-4" />
                    Member since {new Date(userData?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2"
            >
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaBox className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                  </div>
                  <Link href="/my-orders">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                      View All
                      <FiArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {orders?.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 4).map((order, index) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{order.ProductName}</p>
                          <p className="text-sm text-gray-600 mt-1">Order #{order.history.id}</p>
                        </div>
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                            order.history.deliveryStatus.id === 6
                              ? 'bg-emerald-100 text-emerald-700'
                              : order.history.deliveryStatus.id > 6
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.history.deliveryStatus.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : !user ? (
                  <div className="text-center py-8">
                    <FaBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Log in to see your order history</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Guest checkout? Use the tracking link from your order email or SMS.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link href="/">
                      <span className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                        Start Shopping
                        <FiArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Wishlist Card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-pink-50/30 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <FaHeart className="w-4 h-4 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Wishlist</h3>
                  </div>
                  <Link href="/WishList">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700">
                      View All
                      <FiArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {isPending ? (
                  <Loading />
                ) : wish?.length > 0 ? (
                  <div className="space-y-3">
                    {wish.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-900 flex-1">{item.product.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FaHeart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No saved items</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Cart Summary */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.7 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2"
            >
              <div className="bg-gradient-to-r from-gray-50 to-purple-50/30 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <AiOutlineShoppingCart className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Shopping Cart</h3>
                  </div>
                  <Link href="/MyCart">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700">
                      View Cart
                      <FiArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <Loading />
                ) : cart?.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4 p-4 bg-purple-50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-700">Total ({cart.length} items)</span>
                      <span className="text-xl font-bold text-purple-600">৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="space-y-3">
                      {cart.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {item.Quantity}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            ৳{(item.product.sellingPrice * item.Quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AiOutlineShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;