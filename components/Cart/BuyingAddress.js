import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import Swal from 'sweetalert2';
import axios from 'axios';
import { DeliveryContext } from '../../Contexts/DeliveryFee';
import { generateTempItems, pushToDataLayer } from '../../utils/ga4';

const BuyingAddress = ({ data }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  // Delivery fee constants
  const DELIVERY_FEES = {
    DHAKA_INSIDE: 80,
    DHAKA_AROUND: 120,
    DHAKA_OUTSIDE: 150,
    OTHER_REGIONS: 150,
    WEDNESDAY_DISCOUNT: 0,
  };

  const isWednesday = () => {
    return false; // Can be updated to: new Date().getDay() === 3
  };

  const getDeliveryFee = (location) => {
    if (isWednesday()) return DELIVERY_FEES.WEDNESDAY_DISCOUNT;

    switch (location) {
      case 'dhaka-inside':
        return DELIVERY_FEES.DHAKA_INSIDE;
      case 'dhaka-around':
        return DELIVERY_FEES.DHAKA_AROUND;
      case 'dhaka-outside':
        return DELIVERY_FEES.DHAKA_OUTSIDE;
      default:
        return DELIVERY_FEES.OTHER_REGIONS;
    }
  };

  const updateDeliveryFee = (fee) => {
    localStorage.setItem('deliveryFee', fee.toString());
    setDeliveryFee(fee);
  };

  const fetchUserData = async () => {
    try {
      const email =
        user?.email ||
        JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email;

      if (!email) {
        console.warn('No email found for user or guest');
        return;
      }

      const result = await axiosPublic.get(`admin/get-user-by-email/${email}`);
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
    const cartIds = cartItems.map((item) => item.id);
    setCarts(cartIds);
  };

  useEffect(() => {
    fetchUserData();
    loadCartItems();
  }, []);

  // handle region change
  const handleRegionChange = async (e) => {
    const selectedRegionValue = e.target.value;
    setSelectedRegion(selectedRegionValue);
    setSelectedCity('');
    setCities([]);

    if (selectedRegionValue === 'Dhaka') {
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

  const calculateOrderTotal = (cartItems) => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.product.sellingPrice;
      const discount = (basePrice * item.product.discountPercentage) / 100;
      const vat = (basePrice * item.product.vatPercentage) / 100;
      const finalPrice = (basePrice - discount + vat) * item.Quantity;
      return total + finalPrice;
    }, 0);
  };

  const updateUserAddress = async (formData) => {
    const isAddressChanged =
      formData.fullName !== userData.name ||
      selectedRegion !== userData.region ||
      selectedCity !== userData.city ||
      formData.address !== userData.address;

    if (isAddressChanged && userData.id) {
      await axiosPublic.put(`admin/update-user-address/${userData.id}`, {
        name: formData.fullName,
        region: selectedRegion,
        city: selectedCity,
        address: formData.address,
      });
    }
  };

  // handle submit
  const onSubmit = async (formData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Show professional order confirmation
      const result = await Swal.fire({
        title: 'Confirm Your Order',
        html: `
                    <div style="text-align: left; padding: 10px;">
                        <p style="margin-bottom: 15px; color: #555;">Please review your order details:</p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${
                              formData.fullName
                            }</p>
                            <p style="margin: 8px 0;"><strong>Phone:</strong> ${
                              formData.phoneNumber
                            }</p>
                            <p style="margin: 8px 0;"><strong>Region:</strong> ${selectedRegion}</p>
                            ${
                              selectedCity
                                ? `<p style="margin: 8px 0;"><strong>City:</strong> ${selectedCity}</p>`
                                : ''
                            }
                            <p style="margin: 8px 0;"><strong>Address:</strong> ${
                              formData.address
                            }</p>
                            <p style="margin: 8px 0;"><strong>Delivery Fee:</strong> ৳${deliveryFee}</p>
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
        customClass: {
          popup: 'swal-wide',
          confirmButton: 'swal-confirm-btn',
          cancelButton: 'swal-cancel-btn',
        },
        buttonsStyling: true,
      });

      if (!result.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      const isAddressChanged =
        formData.fullName !== userData.name ||
        selectedRegion !== userData.region ||
        selectedCity !== userData.city ||
        formData.address !== userData.address;

      // Check if the address has changed before proceeding
      if (isAddressChanged) {
        // If the user confirms, store new address in localStorage
        const updatedAddress = {
          id: userData.id,
          name: formData.fullName,
          region: selectedRegion,
          city: selectedCity,
          address: formData.address,
        };

        localStorage.setItem('userAddress', JSON.stringify(updatedAddress));
      }

      // Update user address if changed
      await updateUserAddress(formData);

      // Prepare order data
      const orderData = {
        fullName: formData.fullName,
        region: selectedRegion,
        city: selectedCity,
        address: formData.address,
        phone_no: formData.phoneNumber,
        BuyingDate: new Date(),
        carts,
        deliveryFee,
      };

      const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
      const totalPrice = calculateOrderTotal(cartItems);
      const tempItems = generateTempItems(cartItems);

      // Submit order
      const response = await axiosPublic.post(`/admin/add-to-buy`, orderData);

      // Show final confirmation before placing order
      const finalConfirm = await Swal.fire({
        title: 'Order Confirmed',
        text: 'Thank you for your purchase. We will ship your items as soon as possible.',
        icon: 'success',
        confirmButtonColor: '#000000',
        confirmButtonText: 'OK',
      });

      if (!finalConfirm.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      // Show loading state
      Swal.fire({
        title: 'Processing Order',
        html: 'Please wait while we process your order...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      
      // Track order with GA4
      pushToDataLayer('purchase', {
        order_id: response.data.id,
        currency: 'BDT',
        totalPrice: totalPrice,
        coupon: cartItems[0]?.coupon,
        fullName: formData.fullName,
        region: selectedRegion,
        city: selectedCity,
        address: formData.address,
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
    <div className="bg-white p-8 rounded-md shadow-md mb-10 md:w-2/3">
      <h2 className="text-2xl font-bold mb-6 text-center">Shipping Address</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
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
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            placeholder="Enter your full name"
            {...register('fullName', { required: 'Full Name is required' })}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

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
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
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
            <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
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
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
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
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
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
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            placeholder="House/Flat number, Road, Area, Landmark"
            {...register('address', { required: 'Full Address is required' })}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            placeholder="Enter your phone number"
            {...register('phoneNumber', {
              required: 'Phone Number is required',
              pattern: {
                value: /^[0-9]{8,14}$/,
                message: 'Please enter a valid phone number (8-14 digits)',
              },
            })}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Delivery Fee Display */}
        {deliveryFee > 0 && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Delivery Fee:</span>{' '}
              <span className="font-bold text-black">৳{deliveryFee}</span>
            </p>
          </div>
        )}

        {/* Confirm Order Button */}
        <div className="flex items-center justify-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition duration-200 shadow-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Order and Proceed'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyingAddress;
