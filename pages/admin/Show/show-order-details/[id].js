import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import Image from 'next/image';
import useOrder from '../../../../Hooks/useOrder';
import { AuthContext } from '../../../../Contexts/Auth/AuthProvider';
import OrderComp from '../../../../components/orderComp';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Link from 'next/link';
import { FaEnvelope, FaSms, FaTrash, FaXbox } from 'react-icons/fa';
import useAxiosPublic from '../../../../Hooks/useAxiosPublic';
import Modal from 'react-modal';

const ShowOrderDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useContext(AuthContext)
    const [orders] = useOrder();
    const { loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isConfirmationMessageBoxOpen, setIsConfirmationMessageBoxOpen] = useState(false);
    const [message, setMessage] = useState('');

    // Filtered Order Details
    const group = orders.filter(order => order.history?.id == id);
    if (group.length === 0) {
        return <div className='min-h-screen flex items-center justify-center text-xl'>No order details found</div>;
    }

    const customer = group[0]?.customer;
    const history = group[0]?.history;
    console.log(history);

    // Modal handlers
    const openMessageBox = () => setIsConfirmationMessageBoxOpen(true);
    const closeMessageBox = () => setIsConfirmationMessageBoxOpen(false);

    const openConfirmationModal = () => setIsConfirmationModalOpen(true);
    const closeConfirmationModal = () => setIsConfirmationModalOpen(false);

    // Handle delete with confirmation
    const handleDelete = async () => {
        try {
            const res = await axiosPublic.put(`/admin/delete-history/${history?.trackingToken}?email=${user?.email}`);
            console.log(res.data);
            closeConfirmationModal(); // Close modal on success
            router.push('/admin/Show/show-orders'); // Redirect to orders page or any other page
        } catch (error) {
            console.error("Failed to delete order history:", error);
        }
    };

    // Handle message sending
    const handleSendMessage = async () => {
        try {
            // const res = await axiosPublic.put(`/admin/delete-history/${history?.trackingToken}?email=${user?.email}`);
            // console.log(res.data);
            // closeConfirmationModal(); // Close modal on success
            // router.push('/admin/Show/show-orders'); // Redirect to orders page or any other page
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleCancellation = () => {
        router.push(`/my-orders/details/cancel-or-return/${history?.trackingToken}`)
    }

    return (
        <div className='min-h-screen bg-gray-100 p-6 flex justify-center'>
            {loading ? (
                <div className='flex justify-center items-center min-h-screen'>
                    <Loading />
                </div>
            ) : (
                <div className='w-full max-w-5xl bg-white rounded-lg shadow-lg p-8 relative'>
                    {/* Delete Icon with Modal Trigger */}
                    <FaTrash
                        className='absolute top-4 right-4 text-red-500 cursor-pointer'
                        onClick={openConfirmationModal}
                    />

                    <FaEnvelope
                        className='absolute top-4 right-12 text-green-500 cursor-pointer'
                        onClick={openMessageBox}
                    />

                    <span
                        className='absolute top-4 left-4 text-red-500 cursor-pointer'
                        onClick={handleCancellation}
                    >
                        Cancel
                    </span>
                    <h1 className='text-3xl font-bold text-center mb-8'>Order Details</h1>

                    {/* Tabs for Sections */}
                    <Tabs className='space-y-6'>
                        <TabList className='flex justify-center mb-6'>
                            <Tab className='px-4 py-2 border-b-2 focus:outline-none cursor-pointer' selectedClassName="border-indigo-600 text-indigo-600">
                                Order Summary
                            </Tab>
                            <Tab className='px-4 py-2 border-b-2 focus:outline-none cursor-pointer' selectedClassName="border-indigo-600 text-indigo-600">
                                Customer Info
                            </Tab>
                            <Tab className='px-4 py-2 border-b-2 focus:outline-none cursor-pointer' selectedClassName="border-indigo-600 text-indigo-600">
                                Delivery Details
                            </Tab>
                            <Tab className='px-4 py-2 border-b-2 focus:outline-none cursor-pointer' selectedClassName="border-indigo-600 text-indigo-600">
                                Products
                            </Tab>
                        </TabList>

                        {/* Tab Panels */}

                        {/* Order Summary Tab */}
                        <TabPanel>
                            <div>
                                <h2 className='text-xl font-semibold mb-4'>Order Summary</h2>
                                <p className='text-gray-700'>
                                    Total Price: BDT {group.reduce((acc, order) => acc + order.totalPrice, 0) + history.deliveryFee}
                                    (Delivery fee: BDT {history.deliveryFee})
                                </p>
                            </div>
                        </TabPanel>

                        {/* Customer Info Tab */}
                        <TabPanel>
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-lg font-semibold mb-2'>Customer Info</h3>
                                <p className='text-gray-700'>Name: {customer?.name || 'N/A'}</p>
                                <p className='text-gray-700'>Email: {customer?.email || 'N/A'}</p>
                                <p className='text-gray-700'>Phone: {customer?.mbl_no || 'N/A'}</p>
                            </div>
                        </TabPanel>

                        {/* Delivery Details Tab */}
                        <TabPanel>
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-lg font-semibold mb-2'>Delivery Details</h3>
                                <p className='text-gray-700'>Status: {history?.deliveryStatus?.name || 'N/A'}</p>
                                <p className='text-gray-700'>Address: {history?.address || 'N/A'}</p>
                                {history?.city && <p className='text-gray-700'>City: {history.city}</p>}
                                {history?.region && <p className='text-gray-700'>Region: {history.region}</p>}
                                {history?.phone_no && <p className='text-gray-700'>Phone no: {history.phone_no}</p>}
                                <p className='text-gray-700'>Payment Method: {history?.paymentMethod?.name || 'N/A'}</p>
                            </div>
                        </TabPanel>

                        {/* Products Tab */}
                        <TabPanel>
                            <div className='grid lg:grid-cols-2 gap-6'>
                                {group.map(order => (
                                    <div key={order.id} className='bg-gray-50 p-4 rounded-lg flex'>
                                        <Link href={`/products/details/${order.product.id}`} className='w-32 h-32 relative mr-4'>
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product?.filename}`}
                                                alt={order.product?.name || 'Product Image'}
                                                layout='fill'
                                                objectFit='cover'
                                                className='rounded-md'
                                            />
                                        </Link>
                                        <div className='flex flex-col justify-between'>
                                            <h3 className='text-lg font-semibold mb-2'>{order.product?.name}</h3>
                                            <p className='text-gray-600'>Category: <span className='font-semibold text-lg'>{order.category.name}, {order.category.category.name}, {order.category.category.category.name}</span></p>
                                            <p className='text-gray-600'>{
                                                order.category.category.category.name == 'Couples'
                                                &&
                                                <span>Male </span>
                                            }
                                                Size: {order.size}</p>
                                            {
                                                order.category.category.category.name == 'Couples'
                                                &&
                                                <div>
                                                    <p className='text-gray-600'>Female Size: {order.femaleSize}</p>
                                                </div>
                                            }
                                            <p className='text-gray-600'>Quantity: {order.Quantity}</p>
                                            <p className='text-gray-700 font-semibold'>Price: BDT {order.totalPrice}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabPanel>
                    </Tabs>

                    {/* Payment Proof */}
                    {history?.screenshot && (
                        <div className='mt-6'>
                            <h3 className='text-lg font-semibold mb-2'>Payment Proof</h3>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${history.screenshot}`}
                                alt="Payment Proof"
                                width={600}
                                height={400}
                                className='w-full h-auto object-cover rounded-md'
                            />
                        </div>
                    )}

                    <OrderComp orderDetails={group[0].history} admin={true} />

                    {/* Delete Confirmation Modal */}
                    <Modal
                        isOpen={isConfirmationModalOpen}
                        onRequestClose={closeConfirmationModal}
                        contentLabel="Confirm Deletion"
                        ariaHideApp={false}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                            <p>Are you sure you want to delete this order? This action cannot be undone.</p>
                            <div className="flex justify-end gap-4 mt-4">
                                <button onClick={closeConfirmationModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                                <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Confirm</button>
                            </div>
                        </div>
                    </Modal>

                    {/* Message Confirmation Modal */}
                    <Modal
                        isOpen={isConfirmationMessageBoxOpen}
                        onRequestClose={closeMessageBox}
                        contentLabel="Send Message"
                        ariaHideApp={false}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-4 text-center">Send a Message</h2>
                            <textarea
                                className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Type your message here..."
                                rows="5"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)} // Bind the message state
                            />
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={closeMessageBox}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            )}
        </div>
    );
};

export default ShowOrderDetails;
