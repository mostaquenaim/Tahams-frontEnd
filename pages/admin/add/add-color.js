import { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  Field,
  Input,
  SimpleCreateForm,
  getErrorMessage,
} from '../../../components/Admin';
import { randomHex, randomLabel } from '../../../utils/devRandom';

const DEFAULT_CODE = '#000000';
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

const AddColor = () => {
  const axiosSecure = useAxiosSecure();
  const [name, setName] = useState('');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = name.trim();
    const colorCode = code.trim();
    if (!trimmed) {
      setError('Color name is required.');
      return;
    }
    if (!HEX_PATTERN.test(colorCode)) {
      setError('Enter the color code as a hex value, like #1a2b3c.');
      return;
    }

    setLoading(true);
    try {
      await axiosSecure.post('/admin/add-color', { name: trimmed, colorCode });
      setName('');
      setCode(DEFAULT_CODE);
      setSuccess(`"${trimmed}" was added.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add color.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleCreateForm
      title="Add color"
      description="Add a color option that products can be listed in."
      submitLabel="Add color"
      loading={loading}
      onSubmit={handleSubmit}
      onFillRandom={() => {
        setName(randomLabel(['Shade', 'Tone', 'Hue']));
        setCode(randomHex());
      }}
      error={error}
      success={success}
    >
      <Field label="Color name" htmlFor="name" required>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Navy Blue"
          autoFocus
          className="w-full"
        />
      </Field>
      <Field
        label="Color code"
        htmlFor="colorCode"
        required
        hint="Pick a color or type a hex value."
      >
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Pick a color"
            value={HEX_PATTERN.test(code) ? code : DEFAULT_CODE}
            onChange={(e) => setCode(e.target.value)}
            className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
          />
          <Input
            id="colorCode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="#000000"
            maxLength={7}
            className="w-full font-mono"
          />
        </div>
      </Field>
    </SimpleCreateForm>
  );
};

export default AddColor;
