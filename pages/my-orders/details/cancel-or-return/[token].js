import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../../Contexts/Auth/AuthProvider';
import { useRouter } from 'next/router';
import useAxiosPublic from '../../../../Hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import Head from 'next/head';

const CancelOrReturn = () => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [reason, setReason] = useState('');
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Same fallback as the order-details page: a guest who still has this
    // link but lost the localStorage identity they checked out with can
    // verify with their phone number instead (see
    // AdminService.getBuyingHistoryByToken).
    const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [verifyingPhone, setVerifyingPhone] = useState(false);

    const router = useRouter();
    const { user } = useContext(AuthContext);
    const { token } = router.query;
    const axiosPublic = useAxiosPublic();
    const [ownerEmail, setOwnerEmail] = useState(null);
    const [ownerPhone, setOwnerPhone] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (token) {
                const userEmail = localStorage.getItem('email');
                const guestEmail =
                    typeof window !== 'undefined' &&
                    JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email;
                const email = user?.email || userEmail || guestEmail;

                if (!email) {
                    setNeedsPhoneVerification(true);
                    setLoading(false);
                    return;
                }

                try {
                    const response = await axiosPublic.get(`/admin/get-buying-history-by-token/${token}?email=${email}`);
                    if (response.data.length === 0) {
                        setNeedsPhoneVerification(true);
                    } else {
                        setOrderDetails(response.data);
                        setOwnerEmail(email);
                    }
                } catch (err) {
                    console.error(err);
                    setError('Failed to fetch order details. Please try again later.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrderDetails();
    }, [token, user?.email, axiosPublic]);

    const handlePhoneVerify = async (e) => {
        e.preventDefault();
        if (!phoneInput.trim()) return;

        setVerifyingPhone(true);
        setError(null);
        try {
            const response = await axiosPublic.get(
                `/admin/get-buying-history-by-token/${token}?phone=${encodeURIComponent(phoneInput.trim())}`,
            );
            if (response.data.length === 0) {
                setError('No order found for that phone number on this link.');
            } else {
                setOrderDetails(response.data);
                setOwnerPhone(phoneInput.trim());
                setNeedsPhoneVerification(false);
            }
        } catch (err) {
            setError('Failed to verify. Please try again later.');
        } finally {
            setVerifyingPhone(false);
        }
    };

    const handleQuantityChange = (itemId, quantity) => {
        setSelectedProducts(prev => {
            const existing = prev.find(p => p.cartId === itemId);
            if (quantity > 0) {
                return existing
                    ? prev.map(p => (p.cartId === itemId ? { ...p, quantity } : p))
                    : [...prev, { cartId: itemId, quantity }];
            } else {
                return prev.filter(p => p.cartId !== itemId);
            }
        });
    };

    const handleConfirm = async () => {
        try {
            const res = await axiosPublic.post('/admin/confirm-return-or-cancellation', {
                selectedProducts,
                reason,
                token,
                email: ownerEmail,
                phone: ownerPhone,
            });

            if (res.data.success === true) {
                toast.success('Your cancellation request has been sent', {
                    position: "top-center",
                    autoClose: 3000, // time in ms
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

                // Redirect after showing toast
                router.push(`/my-orders/details/${token}`);
            }
        } catch (err) {
            // Show error toast if request fails
            toast.error('Something went wrong. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            console.error(err);
        }
    };

    const renderOrderDetails = () => (
        orderDetails.map((item, idx) => (
            <tr key={idx} className="border-b">
                <td className="py-2 px-4">{item.product.name}</td>
                <td className="py-2 px-4">
                    {item.category.name}, {item.category.category.name}, {item?.category?.category?.category?.name}
                </td>
                <td className="py-2 px-4">
                    <input
                        type="number"
                        value={selectedProducts.find(p => p.cartId === item.id)?.quantity || 0}
                        max={item.Quantity}
                        className="border border-gray-300 rounded p-1 w-20"
                        min="0"
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    />
                </td>
            </tr>
        ))
    );

    if (loading) {
        return (
            <div className="pt-40 lg:pt-56 flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (needsPhoneVerification) {
        return (
            <>
                <Head>
                    <title>Cancellation/Return - {token && token} </title>
                </Head>
                <div className="pt-40 lg:pt-56 flex items-center justify-center min-h-screen">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Verify to continue
                        </h2>
                        <p className="text-gray-600 text-sm mb-4">
                            We couldn&apos;t recognize this browser as the one used to place this order.
                            Enter the phone number used at checkout to verify it&apos;s yours.
                        </p>
                        <form onSubmit={handlePhoneVerify} className="flex flex-col gap-3">
                            <input
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="Phone number used at checkout"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={verifyingPhone}
                                className="bg-blue-600 text-white font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {verifyingPhone ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <div className="pt-40 lg:pt-56 flex items-center justify-center min-h-screen">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Cancellation/Return - {token && token} </title>
            </Head>
            <div className="pt-20 lg:pt-40 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">
                        Confirm {orderDetails.length > 0 && (orderDetails[0].history.deliveryStatus.id < 4 ? 'Cancellation' : 'Return')}
                    </h2>
                    <div>
                        <h1 className='font-semibold text-lg'>Select product to return</h1>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 text-left border-b">Name</th>
                                        <th className="py-2 px-4 text-left border-b">Category</th>
                                        <th className="py-2 px-4 text-left border-b">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderOrderDetails()}
                                </tbody>
                            </table>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Reason for Cancellation/Return:</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="border border-gray-300 rounded p-2 w-full h-24"
                                    placeholder="Please provide a reason..."
                                />
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <button onClick={handleConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Confirm</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CancelOrReturn;
