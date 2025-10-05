import Link from 'next/link';
import React from 'react';
import { FaEye, FaCalendarAlt, FaCreditCard, FaBox } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ShowOrderComp = ({ group, idx }) => {
  const getStatusColor = (statusId) => {
    if (statusId > 6) return 'bg-red-100 text-red-700 border-red-200';
    if (statusId === 6) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const getStatusBorderColor = (statusId) => {
    if (statusId > 6) return 'border-red-200';
    if (statusId === 6) return 'border-emerald-200';
    return 'border-amber-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Card Header */}
      <div className={`border-l-4 ${getStatusBorderColor(group.history?.deliveryStatus?.id)} bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBox className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">Order #{group.history?.id}</span>
          </div>
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(
              group.history?.deliveryStatus?.id
            )}`}
          >
            {group.history?.deliveryStatus?.name}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <FaCalendarAlt className="w-3 h-3" />
            <span>{new Date(group.history.BuyingDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaCreditCard className="w-3 h-3" />
            <span>{group.history.paymentMethod.name}</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {group.orders.slice(0, 4).map((order, idx) => (
            <Link key={idx} href={`/products/details/${order.product.productId}`}>
              <span className="group block">
                <div className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition-all">
                  <div className="aspect-square relative">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product.filename}`}
                      alt={order.product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-semibold line-clamp-2">
                        {order.product.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 px-1">
                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {order.product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>Size: {order.size}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Qty: {order.Quantity}</span>
                  </div>
                </div>
              </span>
            </Link>
          ))}
        </div>

        {/* Show more indicator */}
        {group.orders.length > 4 && (
          <div className="mb-4 text-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">
              <FaBox className="w-3 h-3" />
              +{group.orders.length - 4} more item{group.orders.length - 4 > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Price Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900">
              ৳{group.totalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Delivery Fee</span>
            <span className="text-sm font-semibold text-gray-900">
              ৳{group.deliveryFee.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">
              ৳{(group.totalPrice + group.deliveryFee).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* View Details Button */}
      <div className="px-4 pb-4">
        <Link href={`my-orders/details/${group.history.trackingToken}`}>
          <span className="block w-full">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 font-semibold text-sm">
              <FaEye className="w-4 h-4" />
              View Order Details
            </button>
          </span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ShowOrderComp;