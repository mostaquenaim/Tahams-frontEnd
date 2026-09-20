import { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  Field,
  Input,
  SimpleCreateForm,
  getErrorMessage,
} from '../../../components/Admin';

const AddFabric = () => {
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
      setError('Fabric name is required.');
      return;
    }

    setLoading(true);
    try {
      await axiosSecure.post('/admin/add-fabric', { name: trimmed });
      setName('');
      setSuccess('"' + trimmed + '" was added.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add fabric.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleCreateForm
      title="Add fabric"
      description="Add a fabric option that products can be made from."
      submitLabel="Add fabric"
      loading={loading}
      onSubmit={handleSubmit}
      error={error}
      success={success}
    >
      <Field label="Fabric name" htmlFor="name" required>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cotton"
          autoFocus
          className="w-full"
        />
      </Field>
    </SimpleCreateForm>
  );
};

export default AddFabric;
