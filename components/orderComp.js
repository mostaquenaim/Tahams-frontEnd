import React, { useContext, useEffect, useState } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import { MdRadioButtonUnchecked } from 'react-icons/md';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import useAxiosPublic from '../Hooks/useAxiosPublic'
import { AuthContext } from '../Contexts/Auth/AuthProvider'
import toast from 'react-hot-toast';
import Modal from 'react-modal';

// Custom styled tooltip
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  tooltip: {
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '0.75rem',
    padding: '0.5rem',
    borderRadius: '4px',
  },
  arrow: {
    color: '#333',
  },
});

// steps 
const steps = [
  { id: 'order_placed', label: 'Order Placed', date: 'BuyingDate' },
  { id: 'order_received', label: 'Order Received', date: 'receivedDate' },
  { id: 'processing', label: 'Processed', date: 'processedDate' },
  { id: 'ready_to_ship', label: 'Ready to Ship', date: 'readyToShipDate' },
  { id: 'shipped', label: 'Dropped off', date: 'droppedOffDate' },
  { id: 'delivered', label: 'Delivered', date: 'deliveredDate' },
  { id: 'cancelled', label: 'Cancelled', condition: 'cancelDate', date: 'cancelDate' },
  { id: 'product_returned', label: 'Product Returned', condition: 'returnDate', date: 'returnDate' },
];

const OrderComp = ({ orderDetails, admin = false }) => {
  // console.log('orderDetails', orderDetails);
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const axiosPublic = useAxiosPublic()
  const { user } = useContext(AuthContext)

  useEffect(() => {
    if (orderDetails) {
      const {
        deliveryStatus,
        BuyingDate,
        readyToShipDate,
        droppedOffDate,
        deliveredDate,
      } = orderDetails;

      // Mapping step names to index
      const stepMap = {
        'Order Placed': 0,
        'Order Received': 1,
        'Processed': 2,
        'Ready to Ship': 3,
        'Dropped off': 4,
        'Out for Delivery': 5,
        'Delivered': 6,
        'Cancelled': 7,
        'Product Returned': 8,
      };

      const completedStepsList = [];

      // Populate completed steps list based on available dates
      steps.forEach((step) => {
        if (orderDetails[`${step.id}Date`] || (!step.condition || orderDetails[step.condition])) {
          completedStepsList.push(step);
        }
      });

      if (admin) {
        if (!orderDetails.cancelDate) {
          completedStepsList.push(steps.find(step => step.id === 'cancelled'));
        }
        if (!orderDetails.returnDate) {
          completedStepsList.push(steps.find(step => step.id === 'product_returned'));
        }
      }

      setCompletedSteps(completedStepsList);
      setCurrentStep(stepMap[deliveryStatus.name] || 0);

      // Estimating delivery date if not yet delivered
      if (deliveredDate) {
        setEstimatedDeliveryDate(new Date(deliveredDate).toLocaleDateString());
      } else {
        const orderDate = new Date(BuyingDate);

        // estimated delivery date 
        if (droppedOffDate) {
          const startDate = new Date(orderDate);
          startDate.setDate(orderDate.getDate() + 1); // Start of estimate (1 day after shipment)
          const endDate = new Date(orderDate);
          endDate.setDate(orderDate.getDate() + 2); // End of estimate (2 days after shipment)
          setEstimatedDeliveryDate(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        } else if (readyToShipDate) {
          const startDate = new Date(orderDate);
          startDate.setDate(orderDate.getDate() + 3); // Start of estimate (3 days after processing)
          const endDate = new Date(orderDate);
          endDate.setDate(orderDate.getDate() + 5); // End of estimate (5 days after processing)
          setEstimatedDeliveryDate(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        } else {
          const startDate = new Date(orderDate);
          startDate.setDate(orderDate.getDate() + 3); // Start of estimate (3 days from ordering)
          const endDate = new Date(orderDate);
          endDate.setDate(orderDate.getDate() + 6); // End of estimate (6 days from ordering)
          setEstimatedDeliveryDate(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        }
      }
    }
  }, [orderDetails]);

  // modal open 
  const openConfirmationModal = (idx) => {
    // console.log(idx);
    if (admin) {
      if (currentStep == idx - 1 || idx == 6 || idx == 7) {
        setSelectedIndex(idx);
        setIsConfirmationModalOpen(true);
      }
      else if (currentStep == idx) {
        toast.error('Checked step cannot be checked')
      }
      else {
        toast.error('Check/uncheck the steps serially')
      }
    }

  };

  // modal close
  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setSelectedIndex(null);
  };

  // Handle step update
  const handleStepClick = async () => {
    if (!admin) return; // early return if not admin

    const selectedIndexValue = selectedIndex;
    // setCurrentStep(selectedIndexValue);
    // console.log(selectedIndexValue);

    const dateKey = steps[selectedIndexValue].date;
    const updateData = { [dateKey]: new Date() };

    try {
      const response = await axiosPublic.patch(
        `/admin/update-buying-history-status-by-token/${orderDetails.trackingToken}?email=${user?.email}`,
        updateData,
      );

      // console.log('res =>', response.data);
      setCurrentStep(selectedIndexValue)
      closeConfirmationModal();
      toast.success('Step updated successfully');
      // console.log('Step updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-3xl px-4">
        {completedSteps.map((step, index) => {
          const isCompleted = index <= currentStep; //is completed check 
          const isLastCompletedStep = index === currentStep;
          const showLine = index < completedSteps.length - 1;

          return (
            <div key={step.id} className="flex flex-col sm:flex-row items-center mb-4 last:mb-0">
              <div className="flex flex-col items-center relative">
                <CustomTooltip
                  title={
                    isCompleted
                      ? `Completed on ${new Date(orderDetails[step.date]).toLocaleDateString()}`
                      : `Not completed yet`
                  }
                  arrow
                >
                  <div>
                    {isCompleted ? (
                      // <FaTimes></FaTimes>
                      (orderDetails.cancelDate || orderDetails.returnDate) && !orderDetails[step.date]
                        ?
                        <FaTimes className=' text-red-500 text-2xl mb-2'></FaTimes>
                        :
                        <FaCheckCircle
                          onClick={() => openConfirmationModal(index)}
                          className={`${admin && 'cursor-pointer'} text-green-500 text-2xl mb-2 `} />
                    ) : (
                      <MdRadioButtonUnchecked
                        onClick={() => openConfirmationModal(index)}
                        className={`text-gray-500 text-2xl mb-2 ${admin ? 'cursor-pointer hover:text-blue-500' : ''}`} />
                    )}
                  </div>
                </CustomTooltip>
                {/* show line  */}
                {showLine && (
                  <div
                    className={`h-10 w-px ${isLastCompletedStep || !isCompleted || orderDetails.cancelDate || orderDetails.returnDate
                      ? 'bg-gray-300'
                      : 'bg-green-500'
                      }`}
                  ></div>
                )}
              </div>
              {/* date show  */}
              <div className="ml-4 text-center sm:text-left">
                <span className="text-sm font-medium">{step.label}</span>
                {isCompleted && (
                  <span className="text-xs text-gray-500 ml-2 block sm:inline">
                    {
                      orderDetails[step.date] &&
                      (
                        new Date(orderDetails[step.date]).toLocaleDateString()
                      )
                    }
                  </span>
                )}
                {step.label === 'Delivered' && !isCompleted && (
                  <div className="text-sm text-gray-700">
                    Estimated Delivery Date: <strong>{estimatedDeliveryDate}</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
          <h2 className="text-2xl font-bold mb-4">Confirm Step</h2>
          <p>This action cannot be undone.</p>
          <div className="flex justify-end gap-4 mt-4">
            <button onClick={closeConfirmationModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button onClick={handleStepClick} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderComp;
