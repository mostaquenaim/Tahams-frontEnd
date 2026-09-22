import { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  Field,
  Input,
  SimpleCreateForm,
  getErrorMessage,
} from '../../../components/Admin';
import { pick } from '../../../utils/devRandom';

const AddSize = () => {
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
      setError('Size name is required.');
      return;
    }

    setLoading(true);
    try {
      await axiosSecure.post('/admin/add-size', { name: trimmed });
      setName('');
      setSuccess('"' + trimmed + '" was added.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add size.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleCreateForm
      title="Add size"
      description="Add a size option that products can be stocked in."
      submitLabel="Add size"
      loading={loading}
      onSubmit={handleSubmit}
      onFillRandom={() => setName(pick(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']))}
      error={error}
      success={success}
    >
      <Field label="Size name" htmlFor="name" required>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. XL"
          autoFocus
          className="w-full"
        />
      </Field>
    </SimpleCreateForm>
  );
};

export default AddSize;
