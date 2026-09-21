import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { FiArrowRight, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import useCart from '../../Hooks/useCart';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { generateTempItems, pushToDataLayer } from '../../utils/ga4';
import { cartSubtotal, formatBDT, lineTotal, unitPrice } from '../../utils/pricing';

const MAX_QUANTITY = 10;

const imageUrl = (filename) =>
  `${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`;

function CartSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4"
        >
          <div className="h-24 w-24 animate-pulse rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

const MyCart = () => {
  const [isLoading, cart, refetch] = useCart();
  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  const [selectedIds, setSelectedIds] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkRemoving, setBulkRemoving] = useState(false);
  const hasInitialised = useRef(false);

  // Everything starts selected - most customers check out the whole cart.
  // After that, only drop selections for items that have left the cart.
  useEffect(() => {
    if (isLoading) return;
    if (!hasInitialised.current) {
      hasInitialised.current = true;
      setSelectedIds(cart.map((item) => item.id));
      return;
    }
    // Returning `prev` when nothing changed avoids a render loop: `cart` is a
    // fresh `[]` on every render if the query errors.
    setSelectedIds((prev) => {
      const next = prev.filter((id) => cart.some((item) => item.id === id));
      return next.length === prev.length ? prev : next;
    });
  }, [isLoading, cart]);

  useEffect(() => {
    if (!confirmBulk) return;
    const timer = setTimeout(() => setConfirmBulk(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmBulk]);

  const selectedItems = cart.filter((item) => selectedIds.includes(item.id));
  const subtotal = cartSubtotal(selectedItems);
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;

  const toggleItem = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : cart.map((item) => item.id));

  const handleRemove = async (item) => {
    setRemovingId(item.id);
    try {
      await axiosPublic.delete(`/admin/delete-cart/${item.uniqueId}`);
      pushToDataLayer('remove_from_cart', { item });
      await refetch();
      toast.success('Removed from your cart');
    } catch (error) {
      console.error('Error removing cart item:', error);
      toast.error("Couldn't remove that item. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleQuantity = async (item, next) => {
    if (next < 1 || next > MAX_QUANTITY || updatingId) return;
    setUpdatingId(item.id);
    try {
      await axiosPublic.put(`/admin/update-cart-quantity/${item.uniqueId}`, {
        email: item.customer?.email,
        quantity: next,
      });
      await refetch();
    } catch (error) {
      console.error('Error updating quantity:', error);
      const serverMessage = error?.response?.data?.message;
      toast.error(
        typeof serverMessage === 'string' && serverMessage
          ? serverMessage
          : "Couldn't change the quantity. Please try again.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveSelected = async () => {
    if (!confirmBulk) {
      setConfirmBulk(true);
      return;
    }

    setConfirmBulk(false);
    setBulkRemoving(true);
    try {
      await axiosPublic.delete('/admin/delete-carts', {
        data: { checkedItems: selectedIds },
      });
      await refetch();
      toast.success(
        `Removed ${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'}`,
      );
    } catch (error) {
      console.error('Error deleting selected items:', error);
      toast.error("Couldn't remove the selected items. Please try again.");
    } finally {
      setBulkRemoving(false);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));

    pushToDataLayer('begin_checkout', {
      currency: 'BDT',
      totalPrice: subtotal,
      items: generateTempItems(selectedItems),
    });

    router.push('/buy-now');
  };

  return (
    <>
      <Head>
        <title>My Cart - Tahams</title>
      </Head>
      <section className="min-h-screen pb-16 pt-28 lg:pt-56">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your cart</h1>
              {!isLoading && cart.length > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {cart.length} item{cart.length === 1 ? '' : 's'}
                </p>
              )}
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 underline-offset-4 hover:text-black hover:underline"
            >
              Continue shopping
            </Link>
          </div>

          {isLoading ? (
            <CartSkeleton />
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <FiShoppingBag className="h-6 w-6" />
              </span>
              <h2 className="text-lg font-semibold">Your cart is empty</h2>
              <p className="mt-1 text-sm text-gray-500">
                Add something you like and it will show up here.
              </p>
              <Link
                href="/"
                className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-3 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5 text-sm">
                  <label className="flex cursor-pointer select-none items-center gap-3 font-medium">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 cursor-pointer accent-black"
                    />
                    Select all
                  </label>
                  {selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveSelected}
                      disabled={bulkRemoving}
                      className={`font-medium transition ${
                        confirmBulk
                          ? 'text-red-600'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      {bulkRemoving
                        ? 'Removing...'
                        : confirmBulk
                          ? `Tap again to remove ${selectedItems.length}`
                          : 'Remove selected'}
                    </button>
                  )}
                </div>

                <ul className="space-y-3">
                  {cart.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const productPath = item.product?.productId
                      ? `/products/details/${item.product.productId}`
                      : null;
                    const title = item.ProductName || item.product?.name;

                    return (
                      <li
                        key={item.id}
                        className={`flex gap-3 rounded-2xl border bg-white p-3 transition sm:gap-4 sm:p-4 ${
                          isSelected
                            ? 'border-gray-300 shadow-sm'
                            : 'border-gray-100 opacity-70'
                        } ${removingId === item.id ? 'pointer-events-none opacity-40' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(item.id)}
                          aria-label={`Select ${title}`}
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-black"
                        />
                        <img
                          src={imageUrl(item.product?.filename)}
                          alt={title}
                          className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 object-cover sm:h-24 sm:w-24"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {productPath ? (
                                <Link
                                  href={productPath}
                                  className="block truncate text-sm font-semibold hover:underline sm:text-base"
                                >
                                  {title}
                                </Link>
                              ) : (
                                <p className="truncate text-sm font-semibold sm:text-base">
                                  {title}
                                </p>
                              )}
                              <p className="mt-0.5 text-xs text-gray-500">
                                {[
                                  item.size && `Size ${item.size}`,
                                  item.category?.category?.category?.name,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemove(item)}
                              aria-label={`Remove ${title}`}
                              title="Remove"
                              className="-mr-1 -mt-1 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-end justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center rounded-lg border border-gray-200 ${
                                  updatingId === item.id ? 'opacity-50' : ''
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleQuantity(item, item.Quantity - 1)}
                                  disabled={item.Quantity <= 1 || !!updatingId}
                                  aria-label={`Decrease quantity of ${title}`}
                                  className="px-2.5 py-1 text-base leading-none text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                                >
                                  −
                                </button>
                                <span
                                  className="min-w-[2rem] text-center text-sm font-medium"
                                  aria-live="polite"
                                >
                                  {item.Quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantity(item, item.Quantity + 1)}
                                  disabled={item.Quantity >= MAX_QUANTITY || !!updatingId}
                                  aria-label={`Increase quantity of ${title}`}
                                  className="px-2.5 py-1 text-base leading-none text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-gray-500">
                                × {formatBDT(Math.ceil(unitPrice(item.product)))}
                              </span>
                            </div>
                            <p className="text-base font-bold">
                              {formatBDT(lineTotal(item))}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <aside className="lg:col-span-1">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-44">
                  <h2 className="text-lg font-semibold">Order summary</h2>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">
                        Subtotal ({selectedItems.length} item
                        {selectedItems.length === 1 ? '' : 's'})
                      </dt>
                      <dd className="font-medium">{formatBDT(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Delivery</dt>
                      <dd className="text-gray-500">Calculated at checkout</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {selectedItems.length === 0
                      ? 'Select items to checkout'
                      : 'Checkout'}
                    {selectedItems.length > 0 && (
                      <FiArrowRight className="h-4 w-4" />
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-gray-400">
                    Pay on delivery or online. No account needed.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MyCart;
