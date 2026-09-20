import { useEffect, useState } from 'react';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
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

const describeCategory = (category) =>
  `${category.name}${
    category.category
      ? ` - ${category.category.name}${genderSuffix(category.category)}`
      : ''
  }`;

const AddProductType = () => {
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const result = await axiosPublic.get(
          '/admin/view-product-sub-categories',
        );
        if (!cancelled) {
          setCategories(
            [...result.data].sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Could not load categories.'));
        }
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [axiosPublic]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = name.trim();
    if (!categoryId) {
      setError('Choose the category this product type belongs to.');
      return;
    }
    if (!trimmed) {
      setError('Product type name is required.');
      return;
    }

    setLoading(true);
    try {
      await axiosSecure.post('/admin/add-sub-subCategory', {
        name: trimmed,
        categoryId: Number(categoryId),
      });
      setName('');
      setSuccess(`"${trimmed}" was added.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add product type.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleCreateForm
      title="Add product type"
      description="Create a product type inside an existing category."
      submitLabel="Add product type"
      loading={loading}
      onSubmit={handleSubmit}
      error={error}
      success={success}
    >
      <Field label="Category" htmlFor="category" required>
        <Select
          id="category"
          value={categoryId}
          onValueChange={setCategoryId}
          width="w-full"
          disabled={isLoadingCategories}
        >
          <option value="">
            {isLoadingCategories ? 'Loading categories...' : 'Select a category'}
          </option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {describeCategory(item)}
            </option>
          ))}
        </Select>
      </Field>
      {!isLoadingCategories && categories.length === 0 && (
        <Alert tone="warning">
          There are no categories yet. Add a category first, then come back.
        </Alert>
      )}
      <Field label="Product type name" htmlFor="name" required>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Polo Shirt"
          className="w-full"
        />
      </Field>
    </SimpleCreateForm>
  );
};

export default AddProductType;
