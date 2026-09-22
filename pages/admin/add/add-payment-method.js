import { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  Field,
  Input,
  SimpleCreateForm,
  getErrorMessage,
} from '../../../components/Admin';
import { randomLabel } from '../../../utils/devRandom';

const AddPaymentMethod = () => {
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
      setError('Payment method name is required.');
      return;
    }

    setLoading(true);
    try {
      await axiosSecure.post('/admin/add-payment-method', { name: trimmed });
      setName('');
      setSuccess('"' + trimmed + '" was added.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add payment method.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleCreateForm
      title="Add payment method"
      description="Add a payment method customers can choose at checkout."
      submitLabel="Add payment method"
      loading={loading}
      onSubmit={handleSubmit}
      onFillRandom={() => setName(randomLabel(['Pay', 'Wallet', 'Card']))}
      error={error}
      success={success}
    >
      <Field label="Payment method name" htmlFor="name" required>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. bKash"
          autoFocus
          className="w-full"
        />
      </Field>
    </SimpleCreateForm>
  );
};

export default AddPaymentMethod;
