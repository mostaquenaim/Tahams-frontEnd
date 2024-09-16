import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import Image from 'next/image';
import useOrder from '../../../../Hooks/useOrder';
import { AuthContext } from '../../../../Contexts/Auth/AuthProvider';
import OrderComp from '../../../../components/Draft/orderComp';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Link from 'next/link';

const ShowOrderDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [orders] = useOrder();
    const { loading } = useContext(AuthContext);

    const group = orders.filter(order => order.history?.id == id);
    if (group.length === 0) {
        return <div className='min-h-screen flex items-center justify-center text-xl'>No order details found</div>;
    }

    const customer = group[0]?.customer;
    const history = group[0]?.history;

    return (
        <div className='min-h-screen bg-gray-100 p-6 flex justify-center'>
            {loading ? (
                <div className='flex justify-center items-center min-h-screen'>
                    <Loading />
                </div>
            ) : (
                <div className='w-full max-w-5xl bg-white rounded-lg shadow-lg p-8'>
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
                                            <p className='text-gray-600'>Size: {order.size}</p>
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

                    <OrderComp orderDetails={group[0].history} admin={true}/>
                </div>
            )}
        </div>
    );
};

export default ShowOrderDetails;
