import Link from 'next/link';
import React from 'react';
import { FiArrowRight, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { formatBDT } from '../../utils/pricing';
import { imageUrl } from '../Storefront/StorefrontUI';

const MAX_PREVIEW = 4;

// Delivered = green, cancelled/returned (id > 6) = red, everything in flight = amber.
const statusTone = (statusId) => {
  if (statusId > 6) return 'bg-red-50 text-red-700 ring-red-200';
  if (statusId === 6) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  return 'bg-amber-50 text-amber-700 ring-amber-200';
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const ShowOrderComp = ({ group, idx }) => {
  const { history, orders } = group;
  const placedOn = formatDate(history?.BuyingDate);
  const total = group.totalPrice + group.deliveryFee;
  const extra = orders.length - MAX_PREVIEW;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(idx, 8) * 0.04 }}
      className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Order #{history?.id}
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
            {placedOn && (
              <span className="flex items-center gap-1">
                <FiCalendar className="h-3 w-3" />
                {placedOn}
              </span>
            )}
            {history?.paymentMethod?.name && (
              <span className="flex items-center gap-1">
                <FiCreditCard className="h-3 w-3" />
                {history.paymentMethod.name}
              </span>
            )}
          </p>
        </div>
        {history?.deliveryStatus?.name && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusTone(
              history.deliveryStatus.id,
            )}`}
          >
            {history.deliveryStatus.name}
          </span>
        )}
      </header>

      <ul className="mt-4 space-y-3">
        {orders.slice(0, MAX_PREVIEW).map((order, i) => (
          <li key={order.id ?? i}>
            <Link
              href={`/products/details/${order.product?.productId}`}
              className="group flex items-center gap-3"
            >
              <img
                src={imageUrl(order.product?.filename)}
                alt={order.product?.name || 'Product'}
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 group-hover:underline">
                  {order.product?.name || 'Unavailable product'}
                </p>
                <p className="text-xs text-gray-500">
                  {[order.size && `Size ${order.size}`, `Qty ${order.Quantity}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <p className="mt-2 text-xs font-medium text-gray-500">
          +{extra} more item{extra > 1 ? 's' : ''}
        </p>
      )}

      <dl className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Subtotal</dt>
          <dd className="font-medium">{formatBDT(group.totalPrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Delivery</dt>
          <dd className="font-medium">
            {group.deliveryFee === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatBDT(group.deliveryFee)
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <dt className="font-semibold">Total</dt>
          <dd className="text-lg font-bold">{formatBDT(total)}</dd>
        </div>
      </dl>

      <Link
        href={`/my-orders/details/${history?.trackingToken}`}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        View order details
        <FiArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
};

export default ShowOrderComp;
