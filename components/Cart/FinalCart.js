import React, { useContext, useEffect, useState } from 'react';
import { FaShoppingCart, FaRegStickyNote } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { DeliveryContext } from '../../Contexts/DeliveryFee';

const FinalCart = ({ cartItems, onMemoChange }) => {
    const [totalPrice, setTotalPrice] = useState(0);
    const [memo, setMemo] = useState('');

    const handleMemoChange = (e) => {
        setMemo(e.target.value);
        onMemoChange?.(e.target.value);
    };

    const { deliveryFee } = useContext(DeliveryContext)

    useEffect(() => {
        // Calculate total price when cartItems change
        const sum = cartItems.reduce((acc, item) => {
            // Assuming item.product.sellingPrice and item.Quantity are numbers
            return acc + parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity;
        }, 0);

        const newTotalPrice = sum + deliveryFee;
        setTotalPrice(newTotalPrice);


      // console.log(cartItems);
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
                        <p>৳ {(parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity).toLocaleString()} </p>
                    </div>
                ))}
                <p className='flex justify-between'>
                    <span>Delivery fee</span>
                    <span>৳ {deliveryFee && deliveryFee.toLocaleString()}</span>
                </p>
            </div>

            <p className='text-end font-semibold'>৳ {totalPrice.toLocaleString()}</p>

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
                    value={memo}
                    onChange={handleMemoChange}
                />
            </div>

        </div>
    );
};

FinalCart.propTypes = {
    cartItems: PropTypes.array.isRequired,
    onMemoChange: PropTypes.func,
};

export default FinalCart;
