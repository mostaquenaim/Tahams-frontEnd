import { useState } from 'react';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useLoadCats from '../../../Hooks/useLoadCats';
import {
  Alert,
  Field,
  Input,
  Select,
  SimpleCreateForm,
  getErrorMessage,
} from '../../../components/Admin';

const genderSuffix = (item) => {
  if (!item?.isGenderVaried) return '';
  if (item.isForMen) return ' (Men)';
  if (item.isForWomen) return ' (Women)';
  return '';
};

const AddCategory = () => {
  const axiosSecure = useAxiosSecure();
  const [series, , isLoadingSeries] = useLoadCats();

  const [name, setName] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = name.trim();
    const selectedSeries = series.find((item) => String(item.id) === seriesId);

    if (!selectedSeries) {
      setError('Choose the series this category belongs to.');
      return;
    }
    if (!trimmed) {
      setError('Category name is required.');
      return;
    }

    setLoading(true);
    try {
      await axiosSecure.post('/admin/add-subCategory', {
        name: trimmed,
        categoryName: selectedSeries.name,
      });
      setName('');
      setSuccess(`"${trimmed}" was added to ${selectedSeries.name}.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add category.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleCreateForm
      title="Add category"
      description="Create a category inside an existing series."
      submitLabel="Add category"
      loading={loading}
      onSubmit={handleSubmit}
      error={error}
      success={success}
    >
      <Field label="Series" htmlFor="series" required>
        <Select
          id="series"
          value={seriesId}
          onValueChange={setSeriesId}
          width="w-full"
          disabled={isLoadingSeries}
        >
          <option value="">
            {isLoadingSeries ? 'Loading series...' : 'Select a series'}
          </option>
          {series.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {genderSuffix(item)}
            </option>
          ))}
        </Select>
      </Field>
      {!isLoadingSeries && series.length === 0 && (
        <Alert tone="warning">
          There are no series yet. Add a series first, then come back.
        </Alert>
      )}
      <Field label="Category name" htmlFor="name" required>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. T-Shirts"
          className="w-full"
        />
      </Field>
    </SimpleCreateForm>
  );
};

export default AddCategory;
