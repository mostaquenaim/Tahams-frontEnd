import { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  Field,
  Input,
  SimpleCreateForm,
  getErrorMessage,
} from '../../../components/Admin';

const AddSeries = () => {
  const axiosSecure = useAxiosSecure();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Series name is required.');
      return;
    }

    setLoading(true);
    try {
      await axiosSecure.post('/admin/add-category', { name: trimmed });
      setName('');
      setSuccess('"' + trimmed + '" was added.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add series.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleCreateForm
      title="Add series"
      description="Create a top-level series that categories are grouped under."
      submitLabel="Add series"
      loading={loading}
      onSubmit={handleSubmit}
      error={error}
      success={success}
    >
      <Field label="Series name" htmlFor="name" required>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Summer Collection"
          autoFocus
          className="w-full"
        />
      </Field>
    </SimpleCreateForm>
  );
};

export default AddSeries;
