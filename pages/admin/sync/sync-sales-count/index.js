import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import { ActionPage, getErrorMessage } from '../../../../components/Admin';

const SyncSalesCount = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axiosSecure.put('/admin/sync-sales-count');
      setSuccess(`Sales counts synced at ${new Date().toLocaleTimeString()}.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to sync sales counts.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionPage
      title="Sync sales count"
      description="Recalculate how many times each product has been sold."
      sectionTitle="Sales counts"
      icon={<FiRefreshCw />}
      sectionText="Counts every purchased cart item and updates each product's sales total. Run this if the sales numbers shown on products look out of date."
      buttonLabel="Sync sales count"
      loading={loading}
      onRun={handleSync}
      error={error}
      success={success}
    />
  );
};

export default SyncSalesCount;
