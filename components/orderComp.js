import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import { MdRadioButtonUnchecked } from 'react-icons/md';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import useAxiosPublic from '../Hooks/useAxiosPublic';
import { AuthContext } from '../Contexts/Auth/AuthProvider';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

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
  {
    id: 'order_placed',
    label: 'Order Placed',
    statusName: 'Pending',
    aliases: ['Pending', 'Order Placed'],
    date: 'BuyingDate',
    terminal: false,
  },
  {
    id: 'order_received',
    label: 'Order Received',
    statusName: 'Order Received',
    aliases: ['Order Received', 'Received'],
    date: 'receivedDate',
    terminal: false,
  },
  {
    id: 'processing',
    label: 'Processed',
    statusName: 'Processing',
    aliases: ['Processing', 'Processed'],
    date: 'processedDate',
    terminal: false,
  },
  {
    id: 'ready_to_ship',
    label: 'Ready to Ship',
    statusName: 'Ready to Ship',
    aliases: ['Ready to Ship'],
    date: 'readyToShipDate',
    terminal: false,
  },
  {
    id: 'shipped',
    label: 'Dropped off',
    statusName: 'Dropped Off',
    aliases: ['Dropped Off', 'Dropped off'],
    date: 'droppedOffDate',
    terminal: false,
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    statusName: 'Out for Delivery',
    aliases: ['Out for Delivery'],
    date: 'outDate',
    terminal: false,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    statusName: 'Delivered',
    aliases: ['Delivered'],
    date: 'deliveredDate',
    terminal: true,
  },
];

const exceptionSteps = [
  {
    id: 'cancelled',
    label: 'Cancelled',
    statusName: 'Cancelled',
    aliases: ['Cancelled', 'Canceled'],
    date: 'cancelDate',
    terminal: true,
  },
  {
    id: 'product_returned',
    label: 'Product Returned',
    statusName: 'Returned',
    aliases: ['Returned', 'Product Returned'],
    date: 'returnDate',
    terminal: true,
  },
];

const normalize = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

const OrderComp = ({ orderDetails, admin = false, onUpdated }) => {
  const [localOrderDetails, setLocalOrderDetails] = useState(orderDetails);
  const [selectedStep, setSelectedStep] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const axiosPublic = useAxiosPublic();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLocalOrderDetails(orderDetails);
  }, [orderDetails]);

  const visibleSteps = useMemo(() => {
    if (!localOrderDetails) return [];

    const activeException = exceptionSteps.find(
      (step) => localOrderDetails[step.date],
    );

    if (activeException) {
      return [
        ...steps.filter((step) => localOrderDetails[step.date]),
        activeException,
      ];
    }

    return admin ? [...steps, ...exceptionSteps] : steps;
  }, [admin, localOrderDetails]);

  const currentStepIndex = useMemo(() => {
    if (!localOrderDetails) return 0;

    const statusName = normalize(localOrderDetails.deliveryStatus?.name);
    const exceptionIndex = visibleSteps.findIndex(
      (step) =>
        exceptionSteps.some((exception) => exception.id === step.id) &&
        localOrderDetails[step.date],
    );

    if (exceptionIndex >= 0) return exceptionIndex;

    const statusIndex = visibleSteps.findIndex((step) =>
      step.aliases.some((alias) => normalize(alias) === statusName),
    );

    if (statusIndex >= 0) return statusIndex;

    for (let index = steps.length - 1; index >= 0; index -= 1) {
      const step = steps[index];
      if (localOrderDetails[step.date]) {
        return visibleSteps.findIndex(
          (visibleStep) => visibleStep.id === step.id,
        );
      }
    }

    return 0;
  }, [localOrderDetails, visibleSteps]);

  const estimatedDeliveryDate = useMemo(() => {
    if (!localOrderDetails?.BuyingDate) return '';
    if (localOrderDetails.deliveredDate) {
      return formatDate(localOrderDetails.deliveredDate);
    }

    const orderDate = new Date(localOrderDetails.BuyingDate);
    if (Number.isNaN(orderDate.getTime())) return '';

    const addDays = (days) => {
      const date = new Date(orderDate);
      date.setDate(orderDate.getDate() + days);
      return date.toLocaleDateString();
    };

    if (localOrderDetails.droppedOffDate || localOrderDetails.outDate) {
      return `${addDays(1)} - ${addDays(2)}`;
    }

    if (localOrderDetails.readyToShipDate || localOrderDetails.processedDate) {
      return `${addDays(3)} - ${addDays(5)}`;
    }

    return `${addDays(3)} - ${addDays(6)}`;
  }, [localOrderDetails]);

  const openConfirmationModal = (step, index) => {
    if (!admin) return;

    const isException = exceptionSteps.some(
      (exceptionStep) => exceptionStep.id === step.id,
    );

    if (localOrderDetails?.cancelDate || localOrderDetails?.returnDate) {
      toast.error('Final status is already set');
      return;
    }

    if (localOrderDetails?.[step.date]) {
      toast.error('Checked step cannot be checked');
      return;
    }

    if (!isException && index > currentStepIndex + 1) {
      toast.error('Check the steps serially');
      return;
    }

    setSelectedStep(step);
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    if (isUpdating) return;
    setIsConfirmationModalOpen(false);
    setSelectedStep(null);
  };

  const handleStepClick = async () => {
    if (!admin || !selectedStep) return;

    const updateData = {
      dateKey: selectedStep.date,
      statusName: selectedStep.statusName,
      [selectedStep.date]: new Date().toISOString(),
    };

    try {
      setIsUpdating(true);
      const response = await axiosPublic.patch(
        `/admin/update-buying-history-status-by-token/${localOrderDetails.trackingToken}?email=${user?.email}`,
        updateData,
      );

      setLocalOrderDetails(response.data);
      if (onUpdated) await onUpdated();
      toast.success('Step updated successfully');
      setIsConfirmationModalOpen(false);
      setSelectedStep(null);
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error(error.response?.data?.message || 'Failed to update step');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!localOrderDetails) return null;

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative w-full max-w-3xl px-4">
        {visibleSteps.map((step, index) => {
          const isCompleted = Boolean(localOrderDetails[step.date]);
          const isCurrent = index === currentStepIndex;
          const showLine = index < visibleSteps.length - 1;
          const isException = exceptionSteps.some(
            (exceptionStep) => exceptionStep.id === step.id,
          );
          const isBlockedByException =
            (localOrderDetails.cancelDate || localOrderDetails.returnDate) &&
            !isCompleted;

          return (
            <div
              key={step.id}
              className="flex flex-col sm:flex-row items-center mb-4 last:mb-0"
            >
              <div className="flex flex-col items-center relative">
                <CustomTooltip
                  title={
                    isCompleted
                      ? `Completed on ${formatDate(localOrderDetails[step.date])}`
                      : 'Not completed yet'
                  }
                  arrow
                >
                  <div>
                    {isCompleted ? (
                      isException ? (
                        <FaTimes className="text-red-500 text-2xl mb-2" />
                      ) : (
                        <FaCheckCircle
                          onClick={() => openConfirmationModal(step, index)}
                          className={`${admin ? 'cursor-pointer' : ''} text-green-500 text-2xl mb-2`}
                        />
                      )
                    ) : isBlockedByException ? (
                      <FaTimes className="text-red-500 text-2xl mb-2" />
                    ) : (
                      <MdRadioButtonUnchecked
                        onClick={() => openConfirmationModal(step, index)}
                        className={`text-gray-500 text-2xl mb-2 ${
                          admin ? 'cursor-pointer hover:text-blue-500' : ''
                        }`}
                      />
                    )}
                  </div>
                </CustomTooltip>

                {showLine && (
                  <div
                    className={`h-10 w-px ${
                      isCompleted &&
                      !isCurrent &&
                      !localOrderDetails.cancelDate &&
                      !localOrderDetails.returnDate
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>

              <div className="ml-4 text-center sm:text-left">
                <span className="text-sm font-medium">{step.label}</span>
                {isCompleted && (
                  <span className="text-xs text-gray-500 ml-2 block sm:inline">
                    {formatDate(localOrderDetails[step.date])}
                  </span>
                )}
                {step.id === 'delivered' && !isCompleted && (
                  <div className="text-sm text-gray-700">
                    Estimated Delivery Date:{' '}
                    <strong>{estimatedDeliveryDate}</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isConfirmationModalOpen}
        onRequestClose={closeConfirmationModal}
        contentLabel="Confirm step"
        ariaHideApp={false}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4">Confirm Step</h2>
          <p>
            Mark this order as{' '}
            <strong>{selectedStep?.label || 'the selected step'}</strong>?
          </p>
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={closeConfirmationModal}
              disabled={isUpdating}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleStepClick}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-60"
            >
              {isUpdating ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderComp;
