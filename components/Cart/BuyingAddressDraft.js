import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import Swal from 'sweetalert2';
import axios from 'axios';

const BuyingAddress = ({data}) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const axiosPublic = useAxiosPublic();
    const [carts, setCarts] = useState([]);
    const [userData, setUserData] = useState({});
    const [regions, setRegions] = useState(data & data.module)

    const getUserByEmail = async () => {
        try {
            const result = await axiosPublic.get(`admin/get-user-by-email/${user?.email}`);
            setUserData(result.data);
            reset({
                fullName: result.data.name,
                zip: result.data.postal_code,
                state: result.data.state,
                city: result.data.city,
                Address: result.data.address,
                phoneNumber: result.data.mbl_no,
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        getUserByEmail();
        const cartItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
        const cartIds = cartItems.map((item) => item.id);
        setCarts(cartIds);
    }, []);

    // useEffect(()=>{

    // },[])

    const onSubmit = async (data) => {
        try {
            const formData = {
                fullName: data.fullName,
                zip: data.zip,
                state: data.state,
                city: data.city,
                Address: data.Address,
                phone_no: data.phoneNumber,
                BuyingDate: new Date(),
                carts,
            };

            const res = await axiosPublic.post(`/admin/add-to-buy`, formData);

            if (res.status >= 200 && res.status < 300) {
                // Check if any address-related data has changed
                const isAddressChanged =
                    data.fullName !== userData.name ||
                    data.zip !== userData.postal_code ||
                    data.state !== userData.state ||
                    data.city !== userData.city ||
                    data.Address !== userData.address ||
                    data.phoneNumber !== userData.mbl_no;

                if (isAddressChanged) {
                    Swal.fire({
                        title: 'Address Information Changed',
                        text: 'Do you want to update your default address with this new information?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, update it!',
                        cancelButtonText: 'No, keep the old one'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            await axiosPublic.put(`admin/update-user-address/${userData.id}`, {
                                name: data.fullName,
                                postal_code: data.zip,
                                state: data.state,
                                city: data.city,
                                address: data.Address,
                                mbl_no: data.phoneNumber,
                            });
                        }
                        router.push(`/confirm-order/${res.data.trackingToken}`);
                    });
                }

                else router.push(`/confirm-order/${res.data.trackingToken}`);
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
        }
    };

    return (
        <div className="bg-white p-8 rounded-md shadow-md mb-10 w-2/3">
            <h2 className="text-2xl font-bold mb-6 text-center">Shipping Address</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* name  */}
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

                {/* postal code */}
                <div className="mb-4">
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-600">
                        Zip/Postal Code
                    </label>
                    <input
                        type="text"
                        id="zip"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('zip', { required: 'Zip/Postal Code is required' })}
                    />
                    {errors.zip && <p className="text-red-500 mt-1">{errors.zip.message}</p>}
                </div>

                {/* state */}
                <div className="mb-4">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-600">
                        State
                    </label>
                    <input
                        type="text"
                        id="state"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('state', { required: 'State is required' })}
                    />
                    {errors.state && <p className="text-red-500 mt-1">{errors.state.message}</p>}
                </div>

                {/* city / town */}
                <div className="mb-4">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-600">
                        City/Town
                    </label>
                    <input
                        type="text"
                        id="city"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('city', { required: 'City/Town is required' })}
                    />
                    {errors.city && <p className="text-red-500 mt-1">{errors.city.message}</p>}
                </div>

                {/* full address */}
                <div className="mb-4">
                    <label htmlFor="Address" className="block text-sm font-medium text-gray-600">
                        Full Address
                    </label>
                    <textarea
                        id="Address"
                        rows="4"
                        className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
                        {...register('Address', { required: 'Full Address is required' })}
                    />
                    {errors.Address && (
                        <p className="text-red-500 mt-1">{errors.Address.message}</p>
                    )}
                </div>

                {/* phone number */}
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

                {/* confirm order */}
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

