import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { ActionPage, getErrorMessage } from '../../../components/Admin';

const ShowViews = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axiosSecure.get('/admin/sync-view-count');
      setSuccess(`View counts synced at ${new Date().toLocaleTimeString()}.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to sync view counts.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionPage
      title="Product views"
      description="Keep product view totals up to date."
      sectionTitle="View counts"
      icon={<FiRefreshCw />}
      sectionText="Adds up the recorded page views for each product and updates its total. Run this if the view numbers shown on products look out of date."
      buttonLabel="Sync view counts"
      loading={loading}
      onRun={handleSync}
      error={error}
      success={success}
    />
  );
};

export default ShowViews;
