import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import BuyingAddress from '../../components/Cart/BuyingAddress';
import FinalCart from '../../components/Cart/FinalCart';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';

const readSelectedItems = () => {
  try {
    const items = JSON.parse(localStorage.getItem('selectedItems'));
    return Array.isArray(items) ? items : [];
  } catch (error) {
    return [];
  }
};

const BuyNow = ({ regions }) => {
  const router = useRouter();
  const axiosPublic = useAxiosPublic();
  const { user, loading: authLoading } = useContext(AuthContext);

  // null while we work out which items are actually still purchasable.
  const [items, setItems] = useState(null);
  const [droppedCount, setDroppedCount] = useState(0);
  // null until the customer has picked a delivery area.
  const [deliveryFee, setDeliveryFee] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const load = async () => {
      const stored = readSelectedItems();
      if (stored.length === 0) {
        router.replace('/MyCart');
        return;
      }

      // Re-check against the server: the stored copy can be stale (prices
      // changed, or the order was already placed and the customer came back).
      let fresh = stored;
      try {
        const email = user?.email || getGuestCustomerInfo().email;
        const res = await axiosPublic.get(
          `/admin/get-all-carts?email=${encodeURIComponent(email)}`,
        );
        const available = res.data.filter((item) => !item.isBought);
        fresh = stored
          .map((item) => available.find((cart) => cart.id === item.id))
          .filter(Boolean);
      } catch (error) {
        // Offline hiccup: fall back to what we have rather than blocking checkout.
        console.error('Could not refresh cart:', error);
      }

      if (cancelled) return;

      if (fresh.length === 0) {
        localStorage.removeItem('selectedItems');
        router.replace('/MyCart');
        return;
      }

      setDroppedCount(stored.length - fresh.length);
      localStorage.setItem('selectedItems', JSON.stringify(fresh));
      setItems(fresh);
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.email]);

  return (
    <>
      <Head>
        <title>Checkout - Tahams</title>
      </Head>
      <div className="min-h-screen pb-16 pt-28 lg:pt-56">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <Link
              href="/MyCart"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-black"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to cart
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Checkout</h1>
          </div>

          {items === null ? (
            <div className="grid gap-6 lg:grid-cols-5" aria-busy="true">
              <div className="h-96 animate-pulse rounded-2xl bg-gray-100 lg:col-span-3" />
              <div className="h-72 animate-pulse rounded-2xl bg-gray-100 lg:col-span-2" />
            </div>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-5">
              <div className="order-2 lg:order-1 lg:col-span-3">
                <BuyingAddress
                  regions={regions}
                  items={items}
                  deliveryFee={deliveryFee}
                  onDeliveryFeeChange={setDeliveryFee}
                />
              </div>
              <div className="order-1 lg:order-2 lg:col-span-2">
                <FinalCart
                  items={items}
                  deliveryFee={deliveryFee}
                  droppedCount={droppedCount}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BuyNow;

// Used only if the location service is unreachable, so checkout still works.
const FALLBACK_REGIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
].map((name) => ({ id: name, name }));

export async function getServerSideProps() {
  let regions = FALLBACK_REGIONS;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_LOCATION}?countryCode=BD`,
      { signal: controller.signal },
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.module) && data.module.length > 0) {
        regions = data.module.map(({ id, name }) => ({ id, name }));
      }
    }
  } catch (error) {
    console.error('Could not load regions, using fallback:', error.message);
  }

  return { props: { regions } };
}
