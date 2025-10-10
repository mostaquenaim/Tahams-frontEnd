import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { useRouter } from 'next/router';
import { DeliveryContext } from '../../Contexts/DeliveryFee';
import { discountedPrice, generateTempItems, pushToDataLayer } from '../../utils/ga4';
import { PaymentMethods } from '../../utils/Methods';

const PaymentInfo = ({ history }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({ accountNumber: '', screenshot: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const paymentMethods = PaymentMethods();
  const deliveryFee = useContext(DeliveryContext);

  useEffect(() => {
    if (paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0]);
      toast.success('Cash on Delivery selected by default.', {
        duration: 3000,
        position: 'top-center',
      });
    }
  }, []);

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentInfo({ accountNumber: '', screenshot: null });
    toast.success(`Payment method changed to ${method.name}`, {
      icon: '💳',
      duration: 2000,
    });
  };

  const handleConfirmPayment = async () => {
    if ([2, 3, 4, 6].includes(selectedPaymentMethod?.id)) {
      if (!paymentInfo.accountNumber || !paymentInfo.screenshot) {
        toast.error('Please provide both account number and screenshot.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentMethod', selectedPaymentMethod.id);
      formData.append('accountNumber', paymentInfo?.accountNumber || null);
      formData.append('screenshot', paymentInfo?.screenshot || null);
      formData.append('history', history[0].history.trackingToken);
      formData.append('customer', history[0].customer.email);

      const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
      const tempItems = generateTempItems(cartItems);
      const total = discountedPrice(cartItems) + deliveryFee;

      pushToDataLayer('payment_method', {
        currency: 'BDT',
        totalPrice: total,
        coupon: cartItems[0]?.coupon,
        payment_method: selectedPaymentMethod.name,
        customer_email: history[0].customer.email,
        customer_name: history[0].customer.name,
        region: history[0].history.region,
        address: history[0].history.address,
        items: tempItems,
      });

      const response = await axiosPublic.post('/admin/add-payment', formData);

      if (response.status >= 200 && response.status <= 300) {
        toast.success('Payment Confirmed! Redirecting...', {
          duration: 3000,
          icon: '✅',
        });
        setTimeout(() => router.push('/my-orders'), 2000);
      } else {
        toast.error('Payment failed. Try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error occurred while processing payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  if (!selectedPaymentMethod) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-3 sm:px-6 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Payment Information</h2>
          <p className="text-blue-100 text-sm mt-1">
            Choose your payment method to complete your order
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Payment Method Grid */}
          <section>
            <label className="font-semibold text-gray-800 text-lg mb-4 block">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodChange(method)}
                  className={`relative aspect-square rounded-xl flex items-center justify-center p-3 transition-all duration-200 ${
                    selectedPaymentMethod.id === method.id
                      ? 'bg-blue-50 border-2 border-blue-500 scale-105 shadow-md'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {method.icon && (
                    <Image
                      src={method.icon}
                      alt={method.name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  )}
                  {selectedPaymentMethod.id === method.id && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1.5 shadow">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Selected Method Info */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedPaymentMethod.name}</h3>
            </div>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {selectedPaymentMethod.process}
            </p>
          </section>

          {/* Additional Fields */}
          {[2, 3, 4, 6].includes(selectedPaymentMethod.id) && (
            <section className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">Payment Details</h3>

              <div>
                <label htmlFor="accountNumber" className="text-gray-700 font-medium mb-2 block">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  id="accountNumber"
                  value={paymentInfo.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your account number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="screenshot" className="text-gray-700 font-medium mb-2 block">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="screenshot"
                  name="screenshot"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg file:bg-blue-50 file:border-0 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                />
                {paymentInfo.screenshot && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {paymentInfo.screenshot.name}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Confirm Button */}
          <div>
            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">Secure Payment</p>
              <p className="text-xs text-gray-600 mt-1">
                Your payment info is encrypted. We never store financial details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
