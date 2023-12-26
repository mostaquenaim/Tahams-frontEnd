import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaRegStickyNote } from 'react-icons/fa';
import { TiInputChecked } from 'react-icons/ti';
import toast, { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

const FinalCart = ({ cartItems }) => {
    const [couponCode, setCouponCode] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [enableCoupon, setEnableCoupon] = useState(false)
    const [error, setError] = useState('')

    const axios = useAxiosPublic()

    useEffect(() => {
        // Calculate total price when cartItems change
        const sum = cartItems.reduce((acc, item) => {
            // Assuming item.product.sellingPrice and item.Quantity are numbers
            return acc + item.product.sellingPrice * item.Quantity;
        }, 0);

        setTotalPrice(sum);
    }, [cartItems]);

    const handleApplyCoupon = async () => {
        const res = await axios.get(`/admin/get-coupons`)
        console.log(res.data);
        // Add logic to apply coupon
        // toast.success('Coupon applied successfully!');
        setError('Coupon not valid')
    };

    return (
        <div className="mx-auto mt-8 p-8 bg-gray-100 border rounded-lg w-1/3 mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Your Cart</h2>
                <FaShoppingCart className="text-3xl text-blue-500" />
            </div>

            {/* Cart Information */}
            <div className="mb-4 pb-4 border-b-2 border-gray-200">
                {cartItems.map((item, index) => (
                    <div className='flex justify-between' key={index}>
                        <p>{item.ProductName} x {item.Quantity}</p>
                        <p>৳ {item.product.sellingPrice * item.Quantity} </p>
                    </div>
                ))}
            </div>

            {/* Show Coupon */}
            {enableCoupon && (
                <div className="mb-2">
                    <p className='mb-2'><span>Discount</span> <span></span> </p>
                    <p>Coupon Applied: {couponCode}</p>
                </div>
            )}

            <p className='text-end font-semibold'>৳ {totalPrice}</p>

            {/* Memo Details */}
            <div className="mb-4">
                <div className="flex items-center">
                    <FaRegStickyNote className="text-xl text-purple-500 mr-2" />
                    <span className="text-lg font-semibold">Memo Details</span>
                </div>
                <textarea
                    rows="4"
                    placeholder="Add special instructions, personalization details, or notes here..."
                    className="w-full p-2 border rounded"
                // Add state and onChange handler if you want to capture and store memo details
                />
            </div>

            {/* Coupon Section */}
            <div className="mb-4">
                <div className="flex items-center">
                    <TiInputChecked className="text-xl text-green-500 mr-2" />
                    <span className="text-lg font-semibold">Coupon</span>
                </div>
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="border p-2 mr-2"
                        onFocus={() => setError('')}
                    />
                    <button
                        onClick={handleApplyCoupon}
                        className={`btn ${couponCode ? 'btn-primary' : 'btn-disabled'}`}
                    >
                        Apply Coupon
                    </button>
                </div>
                <div>
                    <span className={`text-error ${error ? 'opacity-70' : 'opacity-0'}`}>
                        Error: {error}
                    </span>
                </div>
            </div>

            <Toaster />
        </div>
    );
};

FinalCart.propTypes = {
    cartItems: PropTypes.array.isRequired,
};

export default FinalCart;
