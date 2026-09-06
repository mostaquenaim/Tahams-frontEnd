import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import Swal from 'sweetalert2';
import axios from 'axios';
import { DeliveryContext } from '../../Contexts/DeliveryFee';
import { generateTempItems, pushToDataLayer } from '../../utils/ga4';
import { MapPin, Store, Truck, CheckCircle2 } from 'lucide-react';

const DISPLAY_CENTERS = [
  {
    id: 'dc1',
    label: 'DC 1',
    name: 'DC1 - Shahabuddin Plaza',
    address: 'Shop: 35-36, 2nd Floor, Shahabuddin Plaza, 1207 Ring Rd, Dhaka',
  },
  {
    id: 'dc2',
    label: 'DC 2',
    name: 'DC2 - Bashundhara City',
    address: 'Shop No: 1, Block: A, Level: 5, Bashundhara City Shopping Complex , Dhaka, Bangladesh, 1215',
  },
  {
    id: 'dc3',
    label: 'DC 3',
    name: 'DC3 - Lalbagh',
    address: '23, 4-C Shaista Khan Rd, Dhaka',
  },
];

const BuyingAddress = ({ data, notes }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm();

  const { user } = useContext(AuthContext);
  const { deliveryFee, setDeliveryFee } = useContext(DeliveryContext);
  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  const [carts, setCarts] = useState([]);
  const [userData, setUserData] = useState({});
  const [regions, setRegions] = useState(data?.module || []);
  const [cities, setCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isOutsideDhaka, setIsOutsideDhaka] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('home');
  const [selectedDC, setSelectedDC] = useState(null);
  const [dcError, setDcError] = useState(false);

  const DELIVERY_FEES = {
    DHAKA_INSIDE: 80,
    DHAKA_AROUND: 120,
    DHAKA_OUTSIDE: 150,
    OTHER_REGIONS: 150,
    WEDNESDAY_DISCOUNT: 0,
  };

  const isWednesday = () => false;

  const getDeliveryFee = (location) => {
    if (isWednesday()) return DELIVERY_FEES.WEDNESDAY_DISCOUNT;
    switch (location) {
      case 'dhaka-inside': return DELIVERY_FEES.DHAKA_INSIDE;
      case 'dhaka-around': return DELIVERY_FEES.DHAKA_AROUND;
      case 'dhaka-outside': return DELIVERY_FEES.DHAKA_OUTSIDE;
      default: return DELIVERY_FEES.OTHER_REGIONS;
    }
  };

  const updateDeliveryFee = (fee) => {
    localStorage.setItem('deliveryFee', fee.toString());
    setDeliveryFee(fee);
  };

  const handleDeliveryModeChange = (mode) => {
    setDeliveryMode(mode);
    setSelectedDC(null);
    setDcError(false);
    clearErrors(['region', 'city', 'address']);

    if (mode === 'pickup') {
      updateDeliveryFee(0);
    } else {
      if (selectedRegion === 'Dhaka') {
        updateDeliveryFee(getDeliveryFee('dhaka-inside'));
      } else if (selectedRegion) {
        updateDeliveryFee(getDeliveryFee('other'));
      } else {
        updateDeliveryFee(0);
      }
    }
  };

  const handleDCSelect = (dcId) => {
    setSelectedDC(dcId);
    setDcError(false);
  };

  const fetchUserData = async () => {
    try {
      // Saved-address prefill needs proof of who's asking, which only a
      // logged-in Firebase user can give - guests just type it in fresh.
      if (!user) return;
      const idToken = await user.getIdToken();
      const result = await axiosPublic.get(
        `admin/get-user-by-email/${user.email}`,
        { headers: { Authorization: `Bearer ${idToken}` } },
      );
      setUserData(result.data);
      reset({
        fullName: result.data?.name || '',
        address: result.data?.address || '',
        phoneNumber: result.data?.mbl_no || '',
        city: selectedCity || '',
        region: selectedRegion || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const loadCartItems = () => {
    const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    setCarts(cartItems.map((item) => item.id));
  };

  useEffect(() => {
    fetchUserData();
    loadCartItems();
  }, []);

  const handleRegionChange = async (e) => {
    const value = e.target.value;
    setSelectedRegion(value);
    setSelectedCity('');
    setCities([]);
    if (value === 'Dhaka') {
      try {
        const res = await axios.get(`/Dhaka-inside-delivery.json`);
        setCities(res.data);
        updateDeliveryFee(getDeliveryFee('dhaka-inside'));
      } catch (error) {
        console.error('Error fetching Dhaka cities:', error);
      }
    } else {
      updateDeliveryFee(getDeliveryFee('other'));
    }
  };

  const handleCityChange = async (event) => {
    const cityValue = event.target.value;
    setSelectedCity(cityValue);
    if (cityValue === 'others') {
      setSelectedCity('');
      try {
        const newOutsideState = !isOutsideDhaka;
        setIsOutsideDhaka(newOutsideState);
        if (newOutsideState) {
          updateDeliveryFee(getDeliveryFee('dhaka-around'));
          const res = await axios.get(`/Dhaka-outside-delivery.json`);
          setCities(res.data);
        } else {
          updateDeliveryFee(getDeliveryFee('dhaka-inside'));
          const res = await axios.get(`/Dhaka-inside-delivery.json`);
          setCities(res.data);
        }
      } catch (error) {
        console.error('Error fetching city data:', error);
      }
    } else if (cityValue) {
      if (cityValue === 'Dhaka - South' || cityValue === 'Dhaka - North') {
        updateDeliveryFee(getDeliveryFee('dhaka-inside'));
      } else if (!isOutsideDhaka) {
        updateDeliveryFee(getDeliveryFee('dhaka-around'));
      } else {
        updateDeliveryFee(getDeliveryFee('dhaka-outside'));
      }
    }
  };

  const calculateOrderTotal = (cartItems) =>
    cartItems.reduce((total, item) => {
      const basePrice = item.product.sellingPrice;
      const discount = (basePrice * item.product.discountPercentage) / 100;
      const vat = (basePrice * item.product.vatPercentage) / 100;
      return total + (basePrice - discount + vat) * item.Quantity;
    }, 0);

  const updateUserAddress = async (formData, address, region, city) => {
    const isAddressChanged =
      formData.fullName !== userData.name ||
      region !== userData.region ||
      city !== userData.city ||
      address !== userData.address;
    if (isAddressChanged && userData.id && user) {
      const idToken = await user.getIdToken();
      await axiosPublic.put(
        `admin/update-user-address/${userData.id}`,
        { name: formData.fullName, region, city, address },
        { headers: { Authorization: `Bearer ${idToken}` } },
      );
    }
  };

  const onSubmit = async (formData) => {
    if (isSubmitting) return;

    if (deliveryMode === 'pickup' && !selectedDC) {
      setDcError(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const dc = deliveryMode === 'pickup'
        ? DISPLAY_CENTERS.find((d) => d.id === selectedDC)
        : null;

      const deliveryAddress = dc ? dc.address : formData.address;
      const deliveryRegion = dc ? 'Dhaka' : selectedRegion;
      const deliveryCity = dc ? dc.name : selectedCity;
      const finalDeliveryFee = dc ? 0 : deliveryFee;

      const result = await Swal.fire({
        title: 'Confirm Your Order',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p style="margin-bottom: 15px; color: #555;">Please review your order details:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${formData.fullName}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${formData.phoneNumber}</p>
              ${dc
                ? `<p style="margin: 8px 0;"><strong>Pickup Center:</strong> ${dc.name}</p>
                   <p style="margin: 8px 0;"><strong>Center Address:</strong> ${dc.address}</p>
                   <p style="margin: 8px 0;"><strong>Delivery Fee:</strong>
                     <span style="color: #16a34a; font-weight: bold;">FREE</span>
                   </p>`
                : `<p style="margin: 8px 0;"><strong>Region:</strong> ${deliveryRegion}</p>
                   ${deliveryCity ? `<p style="margin: 8px 0;"><strong>City:</strong> ${deliveryCity}</p>` : ''}
                   <p style="margin: 8px 0;"><strong>Address:</strong> ${deliveryAddress}</p>
                   <p style="margin: 8px 0;"><strong>Delivery Fee:</strong> ৳${finalDeliveryFee}</p>`
              }
            </div>
            <p style="color: #666; font-size: 14px;">Would you like to proceed with this order?</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#000000',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fa fa-check"></i> Yes, Place Order',
        cancelButtonText: '<i class="fa fa-times"></i> Cancel',
        buttonsStyling: true,
      });

      if (!result.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      const isAddressChanged =
        formData.fullName !== userData.name ||
        deliveryRegion !== userData.region ||
        deliveryCity !== userData.city ||
        deliveryAddress !== userData.address;

      if (isAddressChanged && userData.id && user) {
        localStorage.setItem(
          'userAddress',
          JSON.stringify({
            id: userData.id,
            name: formData.fullName,
            region: deliveryRegion,
            city: deliveryCity,
            address: deliveryAddress,
          }),
        );
      }

      await updateUserAddress(formData, deliveryAddress, deliveryRegion, deliveryCity);

      const orderData = {
        fullName: formData.fullName,
        region: deliveryRegion,
        city: deliveryCity,
        address: deliveryAddress,
        phone_no: formData.phoneNumber,
        BuyingDate: new Date(),
        carts,
        deliveryFee: finalDeliveryFee,
        ...(dc && { isPickup: true, pickupCenter: dc.name }),
        ...(formData.facebookProfile && { facebookProfile: formData.facebookProfile }),
        ...(notes?.trim() && { notes: notes.trim() }),
      };

      const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
      const totalPrice = calculateOrderTotal(cartItems);
      const tempItems = generateTempItems(cartItems);

      const response = await axiosPublic.post(`/admin/add-to-buy`, orderData);

      const finalConfirm = await Swal.fire({
        title: 'Order Confirmed',
        html: `
          <div>
            <p>${dc
              ? 'Your order will be ready for pickup at the selected display center.'
              : 'We will ship your items as soon as possible.'
            }</p>
            ${process.env.NEXT_PUBLIC_BKASHCASHBACK
              ? `<p style="margin-top: 10px; color: #28a745; font-weight: bold;">
                  🎉 Special Offer: Pay with bKash and get ${process.env.NEXT_PUBLIC_BKASHCASHBACK}% cashback!
                </p>`
              : ''
            }
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#000000',
        confirmButtonText: 'Proceed to payment',
        footer: process.env.NEXT_PUBLIC_BKASHCASHBACK
          ? '<span style="font-size: 12px; color: #666;">Cashback will be credited to your bKash account within 24 hours</span>'
          : '',
      });

      if (!finalConfirm.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      Swal.fire({
        title: 'Processing Order',
        html: 'Please wait while we process your order...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      pushToDataLayer('purchase', {
        order_id: response.data.id,
        currency: 'BDT',
        totalPrice,
        coupon: cartItems[0]?.coupon,
        fullName: formData.fullName,
        region: deliveryRegion,
        city: deliveryCity,
        address: deliveryAddress,
        phone_no: formData.phoneNumber,
        BuyingDate: new Date(),
        items: tempItems,
      });

      if (response.status >= 200 && response.status < 300) {
        Swal.close();
        router.push(`/confirm-order/${response.data.trackingToken}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      Swal.fire({
        title: 'Order Failed',
        text: 'There was an error processing your order. Please try again.',
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md mb-10 md:w-2/3">
      <h2 className="text-2xl font-bold mb-8 text-center tracking-tight">
        Checkout
      </h2>

      {/* ── Delivery Method Toggle ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Delivery Method
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Home Delivery */}
          <button
            type="button"
            onClick={() => handleDeliveryModeChange('home')}
            className={`group flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              deliveryMode === 'home'
                ? 'border-black bg-black text-white shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Truck
              className={`w-5 h-5 flex-shrink-0 transition-colors ${
                deliveryMode === 'home' ? 'text-white' : 'text-gray-500'
              }`}
            />
            <div>
              <p className="font-semibold text-sm leading-tight">Home Delivery</p>
              <p
                className={`text-xs mt-0.5 leading-tight ${
                  deliveryMode === 'home' ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                Delivered to your door
              </p>
            </div>
          </button>

          {/* Store Pickup */}
          <button
            type="button"
            onClick={() => handleDeliveryModeChange('pickup')}
            className={`group flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              deliveryMode === 'pickup'
                ? 'border-black bg-black text-white shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Store
              className={`w-5 h-5 flex-shrink-0 ${
                deliveryMode === 'pickup' ? 'text-white' : 'text-gray-500'
              }`}
            />
            <div>
              <p className="font-semibold text-sm leading-tight">Store Pickup</p>
              <p
                className={`text-xs mt-0.5 font-semibold leading-tight ${
                  deliveryMode === 'pickup' ? 'text-green-400' : 'text-green-600'
                }`}
              >
                FREE · Pick up at DC
              </p>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── Full Name ── */}
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            className="mt-1 p-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            placeholder="Enter your full name"
            {...register('fullName', { required: 'Full Name is required' })}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>
          )}
        </div>

        {/* ── Phone Number ── */}
        <div className="mb-6">
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            className="mt-1 p-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            placeholder="Enter your phone number"
            {...register('phoneNumber', {
              required: 'Phone Number is required',
              pattern: {
                value: /^[0-9]{8,14}$/,
                message: 'Please enter a valid phone number (8–14 digits)',
              },
            })}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1.5">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* ── Facebook Profile Link (Optional) ── */}
        <div className="mb-6">
          <label
            htmlFor="facebookProfile"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Facebook Profile Link{' '}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            id="facebookProfile"
            className="mt-1 p-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            placeholder="e.g. facebook.com/yourname"
            {...register('facebookProfile', {
              pattern: {
                value: /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/i,
                message: 'Please enter a valid Facebook profile link',
              },
            })}
          />
          {errors.facebookProfile && (
            <p className="text-red-500 text-xs mt-1.5">{errors.facebookProfile.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Completely optional — feel free to skip this. If you do share it, our team may reach out to you on Messenger regarding your order.
          </p>
        </div>

        {/* ══════════════════════════════════
            STORE PICKUP — DC Selection
        ══════════════════════════════════ */}
        {deliveryMode === 'pickup' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Select Pickup Center <span className="text-red-500">*</span>
              </label>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                FREE Pickup
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {DISPLAY_CENTERS.map((dc, idx) => {
                const isSelected = selectedDC === dc.id;
                return (
                  <button
                    key={dc.id}
                    type="button"
                    onClick={() => handleDCSelect(dc.id)}
                    className={`group relative w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-black bg-gray-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Index badge */}
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm mb-0.5 ${
                          isSelected ? 'text-black' : 'text-gray-800'
                        }`}
                      >
                        {dc.name}
                      </p>
                      <div className="flex items-start gap-1.5">
                        <MapPin
                          className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                            isSelected ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        />
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {dc.address}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-black mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {dcError && (
              <p className="text-red-500 text-xs mt-2">
                Please select a pickup center to continue.
              </p>
            )}

            {/* Free pickup notice */}
            <div className="mt-4 flex items-center gap-2.5 p-3 bg-green-50 border border-green-200 rounded-lg">
              <svg
                className="w-4 h-4 text-green-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-xs text-green-700 font-medium">
                No delivery charge applies when you pick up in store.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            HOME DELIVERY — Address Fields
        ══════════════════════════════════ */}
        {deliveryMode === 'home' && (
          <>
            {/* Region */}
            <div className="mb-4">
              <label
                htmlFor="region"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Region <span className="text-red-500">*</span>
              </label>
              <select
                id="region"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white"
                {...register('region', { required: 'Region is required' })}
                value={selectedRegion}
                onChange={handleRegionChange}
              >
                <option value="">Select a region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className="text-red-500 text-xs mt-1.5">{errors.region.message}</p>
              )}
            </div>

            {/* City */}
            {selectedRegion === 'Dhaka' && (
              <div className="mb-4">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {isOutsideDhaka ? 'City (Outside Dhaka)' : 'City'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  className="mt-1 p-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white"
                  {...register('city', {
                    required:
                      selectedRegion === 'Dhaka' ? 'City is required' : false,
                  })}
                  value={selectedCity}
                  onChange={handleCityChange}
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                  <option value="others">Others</option>
                </select>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.city.message}</p>
                )}
              </div>
            )}

            {/* Full Address */}
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                rows="4"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                placeholder="House/Flat number, Road, Area, Landmark"
                {...register('address', {
                  required: 'Full Address is required',
                })}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1.5">{errors.address.message}</p>
              )}
            </div>

            {/* Delivery Fee */}
            {deliveryFee > 0 && (
              <div className="mb-6 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Delivery Fee</p>
                <p className="text-sm font-bold text-black">৳{deliveryFee.toLocaleString()}</p>
              </div>
            )}
          </>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-10 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-md text-sm tracking-wide ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Processing…' : 'Confirm Order and Proceed'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyingAddress;
