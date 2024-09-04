import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Contexts/Auth/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdErrorOutline } from "react-icons/md";
import NavbarCompTwo from "../../components/Header/NavbarComp";
import { useRouter } from "next/router";
import Footer from "../../components/Footer/Footer";

const MyOrders = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleFetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axiosPublic.get(`admin/get-all-buying-history?email=${user?.email}`);
            // console.log(res.data);
            setOrders(res.data);
        } catch (err) {
            setError("Failed to fetch orders. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email) {
            handleFetchOrders();
        }
    }, [user?.email]);

    const router = useRouter()

    const handleDetails = (item) => {
        // console.log(item);
        router.push(`my-orders/details/${item.history.trackingToken}`)
    }

    return (
        <>
            {/* <NavbarCompTwo /> */}
            <div className="container mx-auto px-4 py-8 pt-40">
                <h1 className="text-3xl font-semibold text-center mb-8">My Orders</h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-500" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64 text-red-500">
                        <MdErrorOutline className="text-4xl mr-2" />
                        <p>{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <p className="text-center text-xl text-gray-600">You have no orders yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order, idx) => (
                            <div key={idx} className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product.filename}`} 
                                    alt={order.product.name} 
                                    className="w-32 h-32 object-cover mb-4 rounded"
                                />
                                <div className="mb-4 text-center">
                                    <h2 className="text-lg font-semibold text-gray-800">Order #{orders.length - idx}</h2>
                                    <p className="text-sm text-gray-600">{new Date(order.history.BuyingDate).toLocaleDateString()}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-700"><strong>Product:</strong> {order.product.name}</p>
                                    <p className="text-sm text-gray-700"><strong>Size:</strong> {order.size ? order.size : "N/A"}</p>
                                    <p className="text-sm text-gray-700"><strong>Quantity:</strong> {order.Quantity}</p>
                                    <p className="text-sm text-gray-700"><strong>Price:</strong> {order.totalPrice} BDT</p>
                                </div>
                                <div className="mb-4">
                                    <p className={`text-sm ${order.history.deliveryStatus.name === "Delivered" ? "text-green-500" : "text-orange-500"}`}>
                                        <strong>Status:</strong> {order.history.deliveryStatus.name}
                                    </p>
                                    <p className="text-sm text-gray-700"><strong>Payment Method:</strong> {order.history.paymentMethod.name}</p>
                                    <p className="text-sm text-gray-700"><strong>Payment Done:</strong> {order.history.PaymentDone ? "Yes" : "No"}</p>
                                </div>
                                <div className="text-right">
                                    <button onClick={()=>handleDetails(order)} className="text-blue-500 hover:underline">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;
