import axios from 'axios';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import useRequests from '../../../Hooks/useRequests';
import Loading from '../../../components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ShowRequests = () => {
    const [requests, refetch, isPending] = useRequests()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const router = useRouter()

    const handleApproveClick = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const confirmApproval = async () => {
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_API}/admin/approve-request`, {
                id: parseInt(selectedRequest.id),
            });

            console.log(response.data, 'reqres');

            if (response.data.isApproved) {
                toast.success("Request approved successfully!", { autoClose: 3000 });
                refetch()
            } else {
                toast.error("Failed to approve request.");
            }
        } catch (error) {
            console.error("Error approving request:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDetails = (req) => {
        console.log(req);
        router.push(`/admin/Show/show-order-details/${req.cart.history.id}`)
    }

    return (
        <>
            <Head>
                <title>Show Requests </title>
            </Head>
            <div className="container mx-auto pt-20 lg:pt-40">
                <h1 className="text-2xl font-bold mb-6 text-center">Cancellation/Return Requests</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Customer Name</th>
                                <th className="py-2 px-4 border-b">Product Name</th>
                                <th className="py-2 px-4 border-b">Quantity</th>
                                {/* <th className="py-2 px-4 border-b">Approved</th> */}
                                <th className="py-2 px-4 border-b">Reason</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        {
                            isPending ?
                                <Loading />
                                :
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4 border-b text-center">{request.id}</td>
                                            <td className="py-2 px-4 border-b text-center">{request.cart.customer.name}</td>
                                            <td className="py-2 px-4 border-b text-center">{request.cart.ProductName}</td>
                                            <td className="py-2 px-4 border-b text-center">{request.quantity}</td>
                                            {/* <td className="py-2 px-4 border-b text-center">{request.isApproved ? 'Yes' : 'No'}</td> */}
                                            <td className="py-2 px-4 border-b text-center">{request.reason}</td>
                                            <td className="py-2 px-4 border-b text-center space-x-2">
                                                {
                                                    !request.isApproved ?
                                                        <button
                                                            onClick={() => handleApproveClick(request)}
                                                            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        :
                                                        <button className='btn-disabled'>
                                                            Approved
                                                            {' '}
                                                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                                        </button>
                                                }
                                                <button onClick={() => handleDetails(request)} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                        }
                    </table>
                </div>

                {/* Modal for confirmation */}
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    contentLabel="Confirm Approval"
                    className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                >
                    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
                        <p>Are you sure you want to approve this request?</p>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproval}
                                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default ShowRequests;
