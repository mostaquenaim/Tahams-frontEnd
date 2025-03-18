import React, { useContext, useState } from 'react';
import { FaBox, FaHeart, FaUser } from 'react-icons/fa';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { FiLogOut } from 'react-icons/fi';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import useOrder from '../../Hooks/useOrder';
import useWish from '../../Hooks/useWish';
import Loading from '../../components/Loading';
import Link from 'next/link';
import useCart from '../../Hooks/useCart';
import Head from 'next/head';

const Dashboard = () => {
    const { user, logOut } = useContext(AuthContext);
    const [orders] = useOrder();
    const [loading, wish] = useWish();
    const [cart] = useCart()


    // console.log(cart);
    // console.log(orders);
    console.log(user && user);
    // console.log(wish && wish);

    if (loading) {
        return <Loading />;
    }

    const handleLogout = () => {
        logOut()
            .then(() => {
                // Remove userInfo from localStorage
                if (typeof window !== "undefined") {
                    localStorage.removeItem('userInfo');
                    console.log('User logged out and userInfo removed from localstorage');
                }
            })
            .catch((error) => {
                console.error('Error during logout:', error.message);
                toast.error('Error during logout. Please try again.');
            });
    }

    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>
            <div className="min-h-screen bg-gray-100 p-6 pt-20 lg:pt-40">
                {/* Dashboard Header */}
                <header className="bg-white shadow p-4 sm:p-6 flex justify-between items-center rounded-lg mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Dashboard</h1>
                    {
                        user ?
                            <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-500 text-sm sm:text-base">
                                <FiLogOut className="mr-1 sm:mr-2" /> Logout
                            </button>
                            :
                            <Link href='/login'>
                                Login
                            </Link>
                    }
                </header>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* Profile Card */}
                    <div className="bg-white p-4 sm:p-6 shadow rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <FaUser className="text-3xl sm:text-4xl text-indigo-500" />
                            <div>
                                <h2 className="text-md sm:text-lg font-semibold text-gray-800">{user?.displayName}</h2>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders Card */}
                    <div className="bg-white p-4 sm:p-6 shadow rounded-lg">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <h2 className="text-md sm:text-lg font-semibold text-gray-800">Recent Orders</h2>
                            <FaBox className="text-indigo-500 text-xl sm:text-2xl" />
                        </div>
                        {orders?.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {orders.slice(0, 3).map((order) => (
                                    <li key={order.id} className="py-1 sm:py-2">
                                        <p className="text-gray-700 text-sm sm:text-base">{order.ProductName}</p>
                                        <p className="text-xs sm:text-sm text-gray-500">Status: {order.history.deliveryStatus.name}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No recent orders.</p>
                        )}
                        <a href="/my-orders" className="text-indigo-500 text-xs sm:text-sm mt-2 sm:mt-4 block">View All Orders</a>
                    </div>

                    {/* Wishlist Card */}
                    <div className="bg-white p-4 sm:p-6 shadow rounded-lg">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <h2 className="text-md sm:text-lg font-semibold text-gray-800">Wishlist</h2>
                            <FaHeart className="text-indigo-500 text-xl sm:text-2xl" />
                        </div>
                        {wish?.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {wish.slice(0, 3).map((item) => (
                                    <li key={item.id} className="py-1 sm:py-2">
                                        <p className="text-gray-700 text-sm sm:text-base">{item.product.name}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No items in wishlist.</p>
                        )}
                        <a href="/WishList" className="text-indigo-500 text-xs sm:text-sm mt-2 sm:mt-4 block">View Full Wishlist</a>
                    </div>

                    {/* Cart Summary */}
                    <div className="bg-white p-4 sm:p-6 shadow rounded-lg">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <h2 className="text-md sm:text-lg font-semibold text-gray-800">Your Cart</h2>
                            <AiOutlineShoppingCart className="text-indigo-500 text-xl sm:text-2xl" />
                        </div>

                        {/* Display total items and total price */}
                        {cart?.length > 0 ? (
                            <div>
                                <p className="text-gray-700 text-sm sm:text-base">Items: {cart.length}</p>
                                <p className="text-gray-700 text-sm sm:text-base">
                                    Total: ${cart.reduce((acc, item) => acc + item.product.sellingPrice * item.Quantity, 0)}
                                </p>
                                <ul className="divide-y divide-gray-200 mt-2">
                                    {/* Slicing to show only the first 3 items */}
                                    {cart.slice(0, 3).map(item => (
                                        <li key={item.id} className="py-1 sm:py-2">
                                            <p className="text-gray-700 text-sm sm:text-base">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">Quantity: {item.Quantity}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Your cart is empty.</p>
                        )}
                        <a href="/MyCart" className="text-indigo-500 text-xs sm:text-sm mt-2 sm:mt-4 block">View Cart</a>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white p-4 sm:p-6 shadow rounded-lg">
                        <h2 className="text-md sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Account Details</h2>
                        {
                            user?.createdAt &&
                            <p className="text-gray-700 text-sm sm:text-base">Member since: {new Date(user?.createdAt).toLocaleDateString()}</p>
                        }
                        <p className="text-gray-700 text-sm sm:text-base">Total Orders: {orders?.length}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
