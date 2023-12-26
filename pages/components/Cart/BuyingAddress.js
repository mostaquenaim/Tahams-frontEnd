import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const BuyingAddress = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm();

    const [countries, setCountries] = useState([]);

    useEffect(() => {
        // Fetch countries from a public API
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://restcountries.com/v2/all');
                const data = await response.json();
                setCountries(data);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };
        fetchCountries();
    }, [])

    const onSubmit = (data) => {
        console.log(data);
        // You can send the data to your backend or perform other actions
    };

    return (
        <div className="bg-white p-8 rounded-md shadow-md w-1/2 mx-auto mb-10">
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

                <div className="mb-4">
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
                </div>

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

                <div className="mb-4">
                    <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-600">
                        Full Address
                    </label>
                    <textarea
                        id="fullAddress"
                        name="fullAddress"
                        rows="4"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('fullAddress', { required: 'Full Address is required' })}
                    />
                    {errors.fullAddress && (
                        <p className="text-red-500 mt-1">{errors.fullAddress.message}</p>
                    )}
                </div>

                <div className="flex items-center justify-center mt-6">
                    <button
                        type="submit"
                        className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:border-indigo-300"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BuyingAddress;
