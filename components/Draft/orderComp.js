import React, { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { MdRadioButtonUnchecked } from 'react-icons/md';
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip from MUI
import { styled } from '@mui/material/styles';

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

const steps = [
  { id: 'order_placed', label: 'Order Placed', date: 'BuyingDate' },
  { id: 'order_received', label: 'Order Received', date: 'receivedDate' },
  { id: 'processing', label: 'Processed', date: 'processedDate' },
  { id: 'ready_to_ship', label: 'Ready to Ship', date: 'readyToShipDate' },
  { id: 'shipped', label: 'Dropped off', date: 'droppedOffDate' },
  { id: 'out_for_delivery', label: 'Out for Delivery', date: 'outDate' },
  { id: 'delivered', label: 'Delivered', date: 'deliveredDate' },
  { id: 'cancelled', label: 'Cancelled', condition: 'cancelDate', date: 'cancelDate' },
  { id: 'product_returned', label: 'Product Returned', condition: 'returnDate', date: 'returnDate' },
];

const OrderComp = ({ orderDetails }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (orderDetails) {
      const {
        deliveryStatus,
        BuyingDate,
        readyToShipDate,
        droppedOffDate,
        deliveredDate,
        cancelDate,
        returnDate
      } = orderDetails.history;

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
      steps.forEach((step, idx) => {
        if (orderDetails.history[`${step.id}Date`] || (!step.condition || orderDetails.history[step.condition])) {
          completedStepsList.push(step);
        }
      });

      setCompletedSteps(completedStepsList);
      setCurrentStep(stepMap[deliveryStatus.name] || 0);

      // Estimating delivery date if not yet delivered
      if (deliveredDate) {
        setEstimatedDeliveryDate(new Date(deliveredDate).toLocaleDateString());
      } else {
        const orderDate = new Date(BuyingDate);

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
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-3xl px-4">
        {completedSteps.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isLastCompletedStep = index === currentStep;
          const showLine = index < completedSteps.length - 1;

          return (
            <div key={step.id} className="flex flex-col sm:flex-row items-center mb-4 last:mb-0">
              <div className="flex flex-col items-center relative">
                <CustomTooltip
                  title={
                    isCompleted
                      ? `Completed on ${new Date(orderDetails.history[step.date]).toLocaleDateString()}`
                      : `Not completed yet`
                  }
                  arrow
                >
                  <div>
                    {isCompleted ? (
                      <FaCheckCircle className="text-green-500 text-2xl mb-2" />
                    ) : (
                      <MdRadioButtonUnchecked className="text-gray-500 text-2xl mb-2" />
                    )}
                  </div>
                </CustomTooltip>
                {showLine && (
                  <div
                    className={`h-10 w-px ${isLastCompletedStep || !isCompleted
                      ? 'bg-gray-300'
                      : 'bg-green-500'
                      }`}
                  ></div>
                )}
              </div>
              <div className="ml-4 text-center sm:text-left">
                <span className="text-sm font-medium">{step.label}</span>
                {isCompleted && (
                  <span className="text-xs text-gray-500 ml-2 block sm:inline">
                    ({new Date(orderDetails.history[step.date]).toLocaleDateString()})
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
    </div>
  );
};

export default OrderComp;
