import React, { useContext, useEffect, useState } from 'react';
import { FaShoppingCart, FaRegStickyNote } from 'react-icons/fa';
import { TiInputChecked } from 'react-icons/ti';
import PropTypes from 'prop-types';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { DeliveryContext } from '../../Contexts/DeliveryFee';

const FinalCart = ({ cartItems }) => {
    const [couponCode, setCouponCode] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [enableCoupon, setEnableCoupon] = useState(false)
    const [error, setError] = useState('')

    const { deliveryFee } = useContext(DeliveryContext)

    const axiosPublic = useAxiosPublic()

    useEffect(() => {
        // Calculate total price when cartItems change
        const sum = cartItems.reduce((acc, item) => {
            // Assuming item.product.sellingPrice and item.Quantity are numbers
            return acc + parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity;
        }, 0);

        const newTotalPrice = sum + deliveryFee;
        setTotalPrice(newTotalPrice);


        console.log(cartItems);
        const tempItems = []

        cartItems.forEach((item) => {
            tempItems.push({
                item_id: item.product.id,
                item_name: item.product.name,
                item_color: item.ProductName.split(" ")[0] || "Unknown",
                item_series: item.category?.category?.category?.name || "N/A",
                main_category: item.category?.category?.name || "N/A",
                sub_category: item.category?.name || "N/A",
                price: parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity || 0,
                total_views: item.product.totalViews || 0,
                // selected_category: selectedCategory,
                selected_size: item.size || null,
                selected_maleSize: item.maleSize || null,
                selected_femaleSize: item.femaleSize || null,
                discount_percent: item.product.discountPercentage || 0,
                quantity: item.Quantity,
            })
        })
    }, [cartItems, deliveryFee]);

    const handleApplyCoupon = async () => {
        const res = await axiosPublic.get(`/admin/get-coupons`)
        setError('Coupon not valid')
    };

    return (
        <div className="mt-8 p-8 bg-gray-100 border rounded-lg mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Your Cart</h2>
                <FaShoppingCart className="text-3xl text-blue-500" />
            </div>

            {/* Cart Information */}
            <div className="mb-4 pb-4 border-b-2 border-gray-200">
                {cartItems.map((item, index) => (
                    <div className='flex justify-between' key={index}>
                        <p className='w-2/3'>{item.ProductName} <span className='text-lg font-semibold'> x {item.Quantity}</span></p>
                        <p>৳ {parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity} </p>
                    </div>
                ))}
                <p className='flex justify-between'>
                    <span>Delivery fee</span>
                    <span>৳ {deliveryFee && deliveryFee}</span>
                </p>
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
                <div className="flex flex-col md:flex-row gap-3">
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
                        Apply
                    </button>
                </div>
                <div>
                    <span className={`text-error ${error ? 'opacity-70' : 'opacity-0'}`}>
                        Error: {error}
                    </span>
                </div>
            </div>
        </div>
    );
};

FinalCart.propTypes = {
    cartItems: PropTypes.array.isRequired,
};

export default FinalCart;
