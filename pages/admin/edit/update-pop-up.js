import Image from 'next/image';
import useAxiosSecure from '/./Hooks/useAxiosSecure';
import useLoadPopUps from '/./Hooks/useLoadPopUps';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const UpdatePopUp = () => {
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const axiosSecure = useAxiosSecure()
    const popUps = useLoadPopUps();
    // Initialize with the active popup's ID (if any exists)
    const [activePopupId, setActivePopupId] = useState(() => {
        const activePopup = popUps.find(popup => popup.isActive);
        return activePopup ? activePopup.id : null;
    });

    // Update state if popUps data changes
    useEffect(() => {
        const activePopup = popUps.find(popup => popup.isActive);
        setActivePopupId(activePopup ? activePopup.id : null);
    }, [popUps]);

    const handleActiveChange = (popupId) => {
        setActivePopupId(popupId);
    };

    const handleSubmit = async () => {
      // console.log('token');
        // console.log(token);
        try {
            const res = await axiosSecure.put(`/admin/update-active-pop-up/${selectedIndex}`, {})
            // Here you would call your API to update which popup is active
          // console.log(`Updated active popup to ID: ${activePopupId}`);
            alert('Active popup updated successfully!');
        } catch (error) {
            console.error('Error updating active popup:', error);
            alert('Failed to update active popup');
        }
        finally {
            closeConfirmationModal();

        }
    };

    // modal close
    const closeConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        setSelectedIndex(null);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Active Popup</h2>

            <div className="space-y-4 mb-8">
                {popUps.map(popup => (
                    <div
                        onClick={() => setSelectedIndex(popup.id)}
                        key={popup.id}
                        className={`flex items-start p-4 border rounded-lg transition-colors ${activePopupId === popup.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            type="radio"
                            id={`popup-${popup.id}`}
                            name="activePopup"
                            checked={activePopupId === popup.id}
                            onChange={() => handleActiveChange(popup.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`popup-${popup.id}`} className="ml-3 block flex-1">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-900">
                                    {/* {popup.filename} */}
                                    <Image
                                        alt={popup.title}
                                        width={50}
                                        height={50}
                                        src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${popup?.filename}`} />
                                </span>
                                <span>{popup?.title}</span>
                                {popup.isActive && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Currently Active
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                <div>
                                    Dates: {new Date(popup.startDate).toLocaleDateString()}
                                    {" → "}
                                    {new Date(popup.endDate).toLocaleDateString()}
                                </div>
                                {popup.url && (
                                    <div className="mt-1">
                                        URL: <a href={popup.url} className="text-blue-600 hover:underline">{popup.url}</a>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => setIsConfirmationModalOpen(true)}
                    disabled={!activePopupId}
                    className={`px-6 py-2 rounded-md text-white font-medium ${activePopupId
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                    Save Changes
                </button>
            </div>

            {/* step confirmation modal  */}
            <Modal
                isOpen={isConfirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                contentLabel="Confirm step"
                ariaHideApp={false}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Confirm </h2>
                    {/* <p>This action cannot be undone.</p> */}
                    <div className="flex justify-end gap-4 mt-4">
                        <button onClick={closeConfirmationModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Confirm</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UpdatePopUp;