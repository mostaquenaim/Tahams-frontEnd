import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import Swal from 'sweetalert2';
import axios from 'axios';
import { DeliveryContext } from '../../Contexts/DeliveryFee';

const BuyingAddress = ({ data }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const axiosPublic = useAxiosPublic();
    const [carts, setCarts] = useState([]);
    const [userData, setUserData] = useState({});
    const [regions, setRegions] = useState(data ? data.module : []);
    const [cities, setCities] = useState([]);
    const [outSideCities, setOutSideCities] = useState(false);

    const {
        deliveryFee,
        setDeliveryFee
    } = useContext(DeliveryContext)

    const [selectedRegion, setSelectedRegion] = useState('')
    const [selectedCity, setSelectedCity] = useState('')

    const isWednesday = () => {
        return new Date().getDay() === 3; // Sunday = 0, Monday = 1, ..., Wednesday = 3
    };

    const getUserByEmail = async () => {
        try {
            // Get email from AuthContext or guestCustomerInfo in localStorage
            const email = user?.email || JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email;

            if (!email) {
                throw new Error('No email found for the user or guest');
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
            console.error('Error fetching user data for email:', error);
        }
    };

    useEffect(() => {
        getUserByEmail();
        const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
        const cartIds = cartItems.map((item) => item.id);
        setCarts(cartIds);
    }, []);

    const handleSelectRegion = async (e) => {
        const selected = e.target.value;
        setSelectedRegion(selected);

        if (selected === 'Dhaka') {
            try {
                const res = await axios.get(`/Dhaka-inside-delivery.json`);
                setCities(res.data);

                const fee = isWednesday() ? 0 : 80;
                localStorage.setItem('deliveryFee', fee.toString());
                setDeliveryFee(fee);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        } else {
            setCities([]);
            const fee = isWednesday() ? 0 : 150;
            localStorage.setItem('deliveryFee', fee.toString());
            setDeliveryFee(fee);
        }
    };

    const handleSelectCity = async (event) => {
        setSelectedCity(event.target.value)
        if (event.target.value === 'others') {
            setSelectedCity('');
            try {
                if (!outSideCities) {
                    setOutSideCities(true);
                    const fee = isWednesday() ? 0 : 150;
                    localStorage.setItem('deliveryFee', fee.toString());
                    setDeliveryFee(fee);
                    const res = await axios.get(`/Dhaka-outside-delivery.json`);
                    setCities(res.data);
                } else {
                    setOutSideCities(false);
                    const fee = isWednesday() ? 0 : 80;
                    localStorage.setItem('deliveryFee', fee.toString());
                    setDeliveryFee(fee);
                    const res = await axios.get(`/Dhaka-inside-delivery.json`);
                    setCities(res.data);
                }
            } catch (error) {
                console.error('Error fetching zones:', error);
            }
        } else {
            if (event.target.value === 'Dhaka - South' || event.target.value === 'Dhaka - North') {
                const fee = isWednesday() ? 0 : 80;
                localStorage.setItem('deliveryFee', fee.toString());
                setDeliveryFee(fee);
            } else if (event.target.value && !outSideCities) {
                const fee = isWednesday() ? 0 : 120;
                localStorage.setItem('deliveryFee', fee.toString());
                setDeliveryFee(fee);
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            const isAddressChanged =
                data.fullName !== userData.name ||
                selectedRegion !== userData.region ||
                selectedCity !== userData.city ||
                data.address !== userData.address;

            // Check if the address has changed before proceeding
            if (isAddressChanged) {
                const result = await Swal.fire({
                    title: 'Address Information Changed',
                    text: 'Do you want to update your default address with this new information?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, update it!',
                    cancelButtonText: 'No, keep the old one'
                });

                // If the user confirms, update the address
                if (result.isConfirmed) {
                    await axiosPublic.put(`admin/update-user-address/${userData.id}`, {
                        name: data.fullName,
                        region: selectedRegion,
                        city: selectedCity,
                        address: data.address,
                    });
                }
            }

            // Regardless of whether the address was changed, proceed to submit the order
            const formData = {
                fullName: data.fullName,
                region: selectedRegion,
                city: selectedCity,
                address: data.address,
                phone_no: data.phoneNumber,
                BuyingDate: new Date(),
                carts,
                deliveryFee,
            };

            const tempItems = []
            const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];

            cartItems.forEach((item) => {
                tempItems.push({
                    item_id: item.product.id,
                    item_name: item.product.name,
                    item_color: item.ProductName.split(" ")[0] || "Unknown",
                    item_series: item.category?.category?.category?.name || "N/A",
                    main_category: item.category?.category?.name || "N/A",
                    sub_category: item.category?.name || "N/A",
                    item_price: parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity || 0,
                    total_views: item.product.totalViews || 0,
                    // selected_category: selectedCategory,
                    selected_size: item.size || null,
                    selected_maleSize: item.maleSize || null,
                    selected_femaleSize: item.femaleSize || null,
                    discount_percent: item.product.discountPercentage || 0,
                    quantity: item.Quantity,
                })
            })

            const sum = cartItems.reduce((acc, item) => {
                // Assuming item.product.sellingPrice and item.Quantity are numbers
                return acc + parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity;
            }, 0);

            const newTotalPrice = sum;
            // const newTotalPrice = sum + deliveryFee;

            const res = await axiosPublic.post(`/admin/add-to-buy`, formData);
            // console.log(res.data,'buyy now');

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "purchase", //begin_checkout
                ecommerce: {
                    // transaction_id: res.data.trackingToken,
                    order_id: res.data.id,
                    currency: "BDT",
                    totalPrice: newTotalPrice,
                    coupon: cartItems[0]?.coupon,
                    fullName: data.fullName,
                    region: selectedRegion,
                    city: selectedCity,
                    address: data.address,
                    phone_no: data.phoneNumber,
                    BuyingDate: new Date(),
                    items: tempItems
                }
            });


            // console.log(tempItems,'cartt');
            // console.log('total',newTotalPrice);

            if (res.status >= 200 && res.status < 300) {
                router.push(`/confirm-order/${res.data.trackingToken}`);
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
        }
    };

    return (
        <div className="bg-white p-8 rounded-md shadow-md mb-10 md:w-2/3">
            <h2 className="text-2xl font-bold mb-6 text-center">Shipping Address</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Full Name */}
                <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-600">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('fullName', { required: 'Full Name is required' })}
                    />
                    {errors.fullName && <p className="text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>

                {/* Region */}
                <div className="mb-4">
                    <label htmlFor="region" className="block text-sm font-medium text-gray-600">
                        Region
                    </label>
                    <select
                        id="region"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('region', { required: 'Region is required' })}
                        value={selectedRegion}
                        onChange={handleSelectRegion}
                    >
                        <option value="">Select a region</option>
                        {regions.map((region) => (
                            <option key={region.id} value={region.name}>
                                {region.name}
                            </option>
                        ))}
                    </select>
                    {errors.region && <p className="text-red-500 mt-1">{errors.region.message}</p>}
                </div>

                {/* City */}
                {selectedRegion === 'Dhaka' && (
                    <div className="mb-4">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-600">
                            {
                                !outSideCities ?
                                    'City' :
                                    'City (Others)'
                            }
                        </label>
                        <select
                            id="city"
                            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                            {...register('city', { required: selectedRegion === 'Dhaka' ? 'City is required' : false })}
                            value={selectedCity}
                            onChange={handleSelectCity}
                        >
                            <option value="">Select a city</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                            <option value="others">Others</option>
                        </select>
                        {errors.city && <p className="text-red-500 mt-1">{errors.city.message}</p>}
                    </div>
                )}

                {/* Full Address */}
                <div className="mb-4">
                    <label htmlFor="Address" className="block text-sm font-medium text-gray-600">
                        Full Address
                    </label>
                    <textarea
                        id="address"
                        rows="4"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('address', { required: 'Full Address is required' })}
                    />
                    {errors.address && (
                        <p className="text-red-500 mt-1">{errors.address.message}</p>
                    )}
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        id="phoneNumber"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('phoneNumber', {
                            required: 'Phone Number is required',
                            pattern: {
                                value: /^[0-9]{8,14}$/, // Accepts only numeric values with a length between 8 and 14
                                message: 'Please enter a valid phone number',
                            },
                        })}
                    />
                    {errors.phoneNumber && <p className="text-red-500 mt-1">{errors.phoneNumber.message}</p>}
                </div>

                {/* Confirm Order */}
                <div className="flex items-center justify-center mt-6">
                    <button
                        type="submit"
                        className="btn btn-accent bg-black text-white"
                    >
                        Confirm Order and Proceed
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BuyingAddress;
