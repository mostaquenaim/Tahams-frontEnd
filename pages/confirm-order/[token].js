import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import PaymentInfo from '../../components/Cart/PaymentInfo';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';

// The order is written to the database just before this page opens, and the
// items are attached to it a moment later - so an empty first answer is
// normal. Give it a few chances before calling it a failure.
const MAX_ATTEMPTS = 6;
const RETRY_DELAY_MS = 800;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PaymentProcess = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const { token } = router.query;

  const [history, setHistory] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready | missing

  useEffect(() => {
    if (!token || authLoading) return;

    let cancelled = false;

    const load = async () => {
      const customerEmail = user?.email || getGuestCustomerInfo().email;
      setEmail(customerEmail);

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        try {
          const result = await axiosPublic.get(
            `/admin/get-buying-history-by-token/${token}?email=${encodeURIComponent(customerEmail)}`,
          );
          if (cancelled) return;
          if (Array.isArray(result.data) && result.data.length > 0) {
            setHistory(result.data);
            setStatus('ready');
            return;
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        }
        await wait(RETRY_DELAY_MS);
        if (cancelled) return;
      }

      setStatus('missing');
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token, authLoading, user?.email, axiosPublic]);

  return (
    <div className="min-h-screen">
      <Head>
        <title>Complete your payment - Tahams</title>
      </Head>
      <div className="px-4 pb-16 pt-28 lg:pt-56">
        {status === 'ready' ? (
          <PaymentInfo history={history} token={token} email={email} />
        ) : status === 'missing' ? (
          <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <FiAlertCircle className="h-6 w-6" />
            </span>
            <h1 className="text-lg font-semibold">We couldn't load your order</h1>
            <p className="mt-2 text-sm text-gray-500">
              Your order may still have been placed. Check your order page to
              see it and finish payment.
            </p>
            <Link
              href={`/my-orders/details/${token}`}
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              View my order
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4" aria-busy="true">
            <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentProcess;
