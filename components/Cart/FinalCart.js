import React from 'react';
import { FiInfo } from 'react-icons/fi';
import { cartSubtotal, formatBDT, lineTotal } from '../../utils/pricing';

const imageUrl = (filename) =>
  `${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`;

// Read-only order summary shown beside (or above, on mobile) the checkout form.
const FinalCart = ({ items, deliveryFee, droppedCount = 0 }) => {
  const subtotal = cartSubtotal(items);
  const hasFee = deliveryFee !== null && deliveryFee !== undefined;
  const total = subtotal + (hasFee ? deliveryFee : 0);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-44">
      <h2 className="text-lg font-semibold">Order summary</h2>

      {droppedCount > 0 && (
        <div className="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <FiInfo className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {droppedCount === 1
            ? "1 item is no longer in your cart, so we've left it out."
            : `${droppedCount} items are no longer in your cart, so we've left them out.`}
        </div>
      )}

      <ul className="mt-4 divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 py-3 first:pt-0">
            <img
              src={imageUrl(item.product?.filename)}
              alt={item.ProductName}
              className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {item.ProductName || item.product?.name}
              </p>
              <p className="text-xs text-gray-500">
                {[item.size && `Size ${item.size}`, `Qty ${item.Quantity}`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatBDT(lineTotal(item))}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-2 space-y-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Subtotal</dt>
          <dd className="font-medium">{formatBDT(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Delivery</dt>
          <dd className="font-medium">
            {!hasFee ? (
              <span className="font-normal text-gray-400">
                Choose your area
              </span>
            ) : deliveryFee === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatBDT(deliveryFee)
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-gray-100 pt-3">
          <dt className="text-base font-semibold">Total</dt>
          <dd className="text-xl font-bold">{formatBDT(total)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FinalCart;
