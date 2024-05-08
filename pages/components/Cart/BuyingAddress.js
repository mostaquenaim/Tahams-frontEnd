import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

const BuyingAddress = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm();

    const router = useRouter()
    const axios = useAxiosPublic()
    const [carts, setCarts] = useState([])

    // const [countries, setCountries] = useState([]);

    // useEffect(() => {
    //     // Fetch countries from a public API
    //     const fetchCountries = async () => {
    //         try {
    //             const response = await fetch('https://restcountries.com/v2/all');
    //             const data = await response.json();
    //             setCountries(data);
    //         } catch (error) {
    //             console.error('Error fetching countries:', error);
    //         }
    //     };
    //     fetchCountries();
    // }, [])

    useEffect(() => {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartIds = cartItems.map((item) => item.id);
        setCarts(cartIds);
        console.log(cartIds);
    }, [])

    const onSubmit = async (data) => {
        console.log(data);

        try {
            // Create FormData object
            const formData = new FormData();

            // Append form fields to FormData
            formData.append('fullName', data.fullName);
            formData.append('zip', data.zip);
            formData.append('state', data.state);
            formData.append('city', data.city);
            formData.append('Address', data.Address);
            formData.append('phoneNumber', data.phoneNumber);
            // data.carts = carts
            // console.log(data.carts);
            formData.append('carts', carts);

            // Assuming your API endpoint for adding to the cart is correct
            const res = await axios.post(`/admin/add-to-buy`, {
                fullName: data.fullName,
                zip: data.zip,
                state: data.state,
                city: data.city,
                Address: data.Address,
                phone_no: data.phoneNumber,
                BuyingDate: new Date(),
                carts:carts
            });
            console.log("61", res);
            console.log(res.data);

            // Redirect to the home page or a confirmation page after successful submission
            if(res.status > 200 && res.status < 300)
            {
                router.push(`/confirm-order/${res.data.trackingToken}`);
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
        }
    };

    return (
        <div className="bg-white p-8 rounded-md shadow-md mb-10 w-2/3">
            <h2 className="text-2xl font-bold mb-6 text-center">Shipping Address</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-600">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('fullName', { required: 'Full Name is required' })}
                    />
                    {errors.fullName && <p className="text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>

                {/* country  */}
                {/* <div className="mb-4">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-600">
                        Country
                    </label>
                    <select
                        id="country"
                        name="country"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('country', { required: 'Country is required' })}
                    >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                            <option key={country.alpha2Code} value={country.alpha2Code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                    {errors.country && <p className="text-red-500 mt-1">{errors.country.message}</p>}
                </div> */}

                {/* zip  */}
                <div className="mb-4">
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-600">
                        Zip/Postal Code
                    </label>
                    <input
                        type="text"
                        id="zip"
                        name="zip"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('zip', { required: 'Zip/Postal Code is required' })}
                    />
                    {errors.zip && <p className="text-red-500 mt-1">{errors.zip.message}</p>}
                </div>

                {/* state  */}
                <div className="mb-4">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-600">
                        State
                    </label>
                    <input
                        type="text"
                        id="state"
                        name="state"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('state', { required: 'State is required' })}
                    />
                    {errors.state && <p className="text-red-500 mt-1">{errors.state.message}</p>}
                </div>

                {/* city/town  */}
                <div className="mb-4">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-600">
                        City/Town
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('city', { required: 'City/Town is required' })}
                    />
                    {errors.city && <p className="text-red-500 mt-1">{errors.city.message}</p>}
                </div>

                {/* full address  */}
                <div className="mb-4">
                    <label htmlFor="Address" className="block text-sm font-medium text-gray-600">
                        Full Address
                    </label>
                    <textarea
                        id="Address"
                        name="Address"
                        rows="4"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('Address', { required: 'Full Address is required' })}
                    />
                    {errors.Address && (
                        <p className="text-red-500 mt-1">{errors.Address.message}</p>
                    )}
                </div>

                {/* phone number  */}
                <div className="mb-4">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
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
