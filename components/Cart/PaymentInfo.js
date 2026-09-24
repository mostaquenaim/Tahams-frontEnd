import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiCheck, FiCheckCircle, FiCopy } from 'react-icons/fi';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { generateTempItems, pushToDataLayer } from '../../utils/ga4';
import { PaymentMethods } from '../../utils/Methods';
import { formatBDT } from '../../utils/pricing';

// Methods the customer pays for up front and must prove with a screenshot.
// (Cash on delivery / pick-up need nothing here - they're chosen at checkout.)
const ONLINE_METHOD_IDS = [2, 3, 4, 6];
const MAX_SCREENSHOT_MB = 10;

// Pulls the copyable account/merchant number out of a method's instructions.
const extractCopyValue = (process) => {
  const text = String(process || '');
  const account = text.match(/A\/C NUMBER:\s*(\d+)/i);
  if (account) return account[1];
  const mobile = text.match(/0\d{10}/);
  return mobile ? mobile[0] : null;
};

const PaymentInfo = ({ history, token, email }) => {
  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  const methods = useMemo(
    () => PaymentMethods().filter((method) => ONLINE_METHOD_IDS.includes(method.id)),
    [],
  );

  const [selected, setSelected] = useState(methods[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const order = history[0].history;
  const subtotal = history.reduce((sum, cart) => sum + (Number(cart.totalPrice) || 0), 0);
  const deliveryFee = Number(order.deliveryFee) || 0;
  const total = subtotal + deliveryFee;
  const copyValue = extractCopyValue(selected?.process);

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const handleSelect = (method) => {
    setSelected(method);
    setErrors({});
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Couldn't copy - please select and copy the number.");
    }
  };

  const handleScreenshot = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, screenshot: 'Please choose an image file.' }));
      event.target.value = '';
      return;
    }
    if (file.size > MAX_SCREENSHOT_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        screenshot: `The image must be under ${MAX_SCREENSHOT_MB}MB.`,
      }));
      event.target.value = '';
      return;
    }

    setScreenshot(file);
    setErrors((prev) => ({ ...prev, screenshot: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const found = {};
    if (!accountNumber.trim()) {
      found.accountNumber = 'Enter the number or account you paid from.';
    }
    if (!screenshot) found.screenshot = 'Upload a screenshot of your payment.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append('paymentMethod', selected.id);
      body.append('accountNumber', accountNumber.trim());
      body.append('screenshot', screenshot);
      body.append('history', order.trackingToken);
      body.append('customer', history[0].customer?.email || email);

      await axiosPublic.post('/admin/add-payment', body);

      // try {
      //   pushToDataLayer('payment_method', {
      //     currency: 'BDT',
      //     totalPrice: total,
      //     payment_method: selected.name,
      //     region: order.region,
      //     address: order.address,
      //     items: generateTempItems(history),
      //   });
      // } catch (error) {
      //   console.error('Analytics event failed:', error);
      // }

      router.push(`/my-orders/details/${token}?placed=1&paid=1`);
    } catch (error) {
      console.error(error);
      toast.error("We couldn't save your payment details. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Order placed */}
      <div className="mb-5 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <FiCheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
        <div>
          <h1 className="text-lg font-semibold text-emerald-900">
            Your order is placed
          </h1>
          <p className="mt-0.5 text-sm text-emerald-800">
            One last step - send your payment and upload the screenshot so we can
            confirm it.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"
      >
        {/* Amount */}
        <div className="flex items-baseline justify-between rounded-xl bg-gray-50 px-4 py-3.5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Amount to pay
            </p>
            <p className="text-xs text-gray-400">
              {formatBDT(subtotal)} items
              {deliveryFee > 0 ? ` + ${formatBDT(deliveryFee)} delivery` : ''}
            </p>
          </div>
          <p className="text-2xl font-bold">{formatBDT(total)}</p>
        </div>

        {/* Method */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">Choose how you'll pay</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {methods.map((method) => {
              const isSelected = selected.id === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleSelect(method)}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition ${
                    isSelected
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method.icon && (
                    <Image
                      src={method.icon}
                      alt=""
                      width={48}
                      height={48}
                      className="h-10 w-10 object-contain"
                    />
                  )}
                  {method.name}
                  {isSelected && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                      <FiCheck className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Instructions */}
        <section className="rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold">
            How to pay with {selected.name}
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {selected.process}
          </p>
          {copyValue && (
            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              {copied ? (
                <>
                  <FiCheck className="h-4 w-4 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <FiCopy className="h-4 w-4" />
                  Copy {copyValue}
                </>
              )}
            </button>
          )}
          <p className="mt-3 text-xs text-gray-500">
            Please send exactly <strong>{formatBDT(total)}</strong>.
          </p>
        </section>

        {/* Proof */}
        <section className="space-y-4">
          <div>
            <label
              htmlFor="accountNumber"
              className="mb-1.5 block text-sm font-medium"
            >
              Your {selected.id === 6 ? 'account' : 'wallet'} number
            </label>
            <input
              id="accountNumber"
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                setErrors((prev) => ({ ...prev, accountNumber: undefined }));
              }}
              placeholder="The number you paid from"
              className={`w-full rounded-xl border px-3.5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                errors.accountNumber
                  ? 'border-red-400 focus:ring-red-500/10'
                  : 'border-gray-300 focus:border-black focus:ring-black/10'
              }`}
            />
            {errors.accountNumber && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <FiAlertCircle className="h-3.5 w-3.5" />
                {errors.accountNumber}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="screenshot"
              className="mb-1.5 block text-sm font-medium"
            >
              Payment screenshot
            </label>
            <input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={handleScreenshot}
              className="block w-full rounded-xl border border-gray-300 text-sm file:mr-3 file:cursor-pointer file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-medium hover:file:bg-gray-200"
            />
            {errors.screenshot && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <FiAlertCircle className="h-3.5 w-3.5" />
                {errors.screenshot}
              </p>
            )}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Your payment screenshot"
                className="mt-3 max-h-48 rounded-lg border border-gray-200 object-contain"
              />
            )}
          </div>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Submitting...
            </>
          ) : (
            'Confirm payment'
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Changed your mind?{' '}
          <Link
            href={`/my-orders/details/${token}?placed=1`}
            className="font-medium text-black underline underline-offset-4"
          >
            Pay on delivery / pickup instead
          </Link>
        </p>
      </form>
    </div>
  );
};

export default PaymentInfo;
