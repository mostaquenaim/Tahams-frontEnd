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

    const router = useRouter();
    const { user } = useContext(AuthContext);
    const { token } = router.query;
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (token) {
                const userEmail = localStorage.getItem('email');
                try {
                    const response = await axiosPublic.get(`/admin/get-buying-history-by-token/${token}?email=${user?.email || userEmail}`);
                    // console.log(response.data);
                    setOrderDetails(response.data);
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
                    {item.category.name}, {item.category.category.name}, {item.category.category.category.name}
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
