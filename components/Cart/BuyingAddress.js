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
    // const [deliveryFee, setDeliveryFee] = useState(150);

    const {
        deliveryFee,
        setDeliveryFee
    } = useContext(DeliveryContext)

    const [selectedRegion, setSelectedRegion] = useState('')
    const [selectedCity, setSelectedCity] = useState('')

    const getUserByEmail = async () => {
        try {
            const email = localStorage.getItem('email')
            const result = await axiosPublic.get(`admin/get-user-by-email/${user?.email || email}`);
            setUserData(result.data);
            reset({
                fullName: result.data.name,
                address: result.data.address,
                phoneNumber: result.data.mbl_no,
                city: selectedCity || '',
                region: selectedRegion,
            })
        } catch (error) {
            console.error('Error fetching user data for email:', user?.email, error);
        }
    };

    useEffect(() => {
        getUserByEmail();
        const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
        const cartIds = cartItems.map((item) => item.id);
        setCarts(cartIds);
    }, []);

    const handleSelectRegion = async (e) => {
        setSelectedRegion(e.target.value);
        if (e.target.value === 'Dhaka') {
            try {
                const res = await axios.get(`/Dhaka-inside-delivery.json`);
                setCities(res.data);
                localStorage.setItem('deliveryFee', '80');  // Default fee for others
                setDeliveryFee(80)
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        } else {
            setCities([]);
            // setOutSideCities([])
            localStorage.setItem('deliveryFee', '150');  // Fee for regions outside Dhaka
            setDeliveryFee(150)
        }
    };

    const handleSelectCity = async (event) => {
        setSelectedCity(event.target.value)
        if (event.target.value === 'others') {
            setSelectedCity('')
            try {
                if (!outSideCities) {
                    setOutSideCities(true)
                    localStorage.setItem('deliveryFee', '150')
                    setDeliveryFee(150)
                    const res = await axios.get(`/Dhaka-outside-delivery.json`);
                    setCities(res.data);
                }
                else {
                    setOutSideCities(false)
                    localStorage.setItem('deliveryFee', '80')
                    setDeliveryFee(80)
                    const res = await axios.get(`/Dhaka-inside-delivery.json`);
                    setCities(res.data);
                }
            } catch (error) {
                console.error('Error fetching zones:', error);
            }
        } else {
            // setOutSideCities([])
            if (event.target.value === 'Dhaka - South' || event.target.value === 'Dhaka - North') {
                // console.log('in');
                localStorage.setItem('deliveryFee', '80')
                setDeliveryFee(80)
            } else if (event.target.value && !outSideCities) {
                localStorage.setItem('deliveryFee', '120');
                setDeliveryFee(120)
            }
        }
    };

    const onSubmit = async (data) => {
        // console.log(selectedCity);
        try {
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

            const res = await axiosPublic.post(`/admin/add-to-buy`, formData);

            if (res.status >= 200 && res.status < 300) {
                // console.log(selectedCity, 'vs', userData.city);
                const isAddressChanged =
                    data.fullName !== userData.name ||
                    selectedRegion !== userData.region ||
                    selectedCity !== userData.city ||
                    data.address !== userData.address

                if (isAddressChanged) {
                    Swal.fire({
                        title: 'Address Information Changed',
                        text: 'Do you want to update your default address with this new information?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, update it!',
                        cancelButtonText: 'No, keep the old one'
                    }).then(async (result) => {
                        // console.log('result', result);
                        if (result.isConfirmed) {
                            await axiosPublic.put(`admin/update-user-address/${userData.id}`, {
                                name: data.fullName,
                                region: selectedRegion,
                                city: selectedCity,
                                address: data.address,
                            });
                        }
                        else if (result.dismiss === 'backdrop') {
                            return
                        }
                        router.push(`/confirm-order/${res.data.trackingToken}`);
                    });
                } else {
                    router.push(`/confirm-order/${res.data.trackingToken}`);
                }
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
