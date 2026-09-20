import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTag } from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useLoadSubSubCategories from '../../../Hooks/useLoadSubSubCategories';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Field,
  FormActions,
  Input,
  PageHeader,
  SearchInput,
  cx,
  getErrorMessage,
} from '../../../components/Admin';

const pathOf = (item) =>
  [item.category?.name, item.category?.category?.name]
    .filter(Boolean)
    .join(' · ');

const UpdateDiscount = () => {
  const axiosSecure = useAxiosSecure();
  const [productTypes, , isPending] = useLoadSubSubCategories();

  const [discount, setDiscount] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return productTypes;
    return productTypes.filter((item) =>
      `${item.name} ${pathOf(item)}`.toLowerCase().includes(term),
    );
  }, [productTypes, searchTerm]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((item) => selectedSet.has(item.id));

  const toggleOne = (id) => {
    setErrors((prev) => ({ ...prev, categories: undefined }));
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const toggleAllFiltered = () => {
    setErrors((prev) => ({ ...prev, categories: undefined }));
    const filteredIds = filtered.map((item) => item.id);
    setSelectedIds((prev) =>
      allFilteredSelected
        ? prev.filter((id) => !filteredIds.includes(id))
        : [...new Set([...prev, ...filteredIds])],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const next = {};
    const percentage = Number(discount);
    if (discount === '' || Number.isNaN(percentage)) {
      next.discount = 'Enter a discount percentage.';
    } else if (percentage < 0 || percentage > 100) {
      next.discount = 'Discount must be between 0 and 100.';
    }
    if (selectedIds.length === 0) {
      next.categories = 'Select at least one product type.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await axiosSecure.put('/admin/update-discount', {
        categoryIds: selectedIds,
        discountPercentage: percentage,
      });
      toast.success(
        `Discount set to ${percentage}% for ${selectedIds.length} product type${
          selectedIds.length === 1 ? '' : 's'
        }`,
      );
      setDiscount('');
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Could not update the discount.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage title="Update discount" width="form">
      <PageHeader
        title="Update discount"
        description="Set one discount percentage on every product in the product types you select."
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="space-y-5 p-5">
          <Field
            label="Discount percentage"
            htmlFor="discount"
            required
            hint="Replaces the current discount on every product in the selected types. Use 0 to remove discounts."
            error={errors.discount}
          >
            <div className="relative w-40">
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                step="any"
                value={discount}
                onChange={(e) => {
                  setDiscount(e.target.value);
                  setErrors((prev) => ({ ...prev, discount: undefined }));
                }}
                placeholder="0"
                className="w-full pr-8"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                %
              </span>
            </div>
          </Field>

          <Field
            label="Product types"
            required
            error={errors.categories}
          >
            <div
              className={cx(
                'rounded-lg border bg-white',
                errors.categories ? 'border-red-300' : 'border-gray-200',
              )}
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-3">
                <SearchInput
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  placeholder="Search product types..."
                />
                <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-700">
                  <Checkbox
                    checked={allFilteredSelected}
                    onChange={toggleAllFiltered}
                    disabled={filtered.length === 0}
                  />
                  {searchTerm ? 'Select results' : 'Select all'}
                </label>
                <Badge tone={selectedIds.length ? 'info' : 'neutral'}>
                  {selectedIds.length} selected
                </Badge>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {isPending ? (
                  <ul className="divide-y divide-gray-100" aria-busy="true">
                    {Array.from({ length: 6 }, (_, index) => (
                      <li key={index} className="px-4 py-3">
                        <div className="h-3.5 w-48 animate-pulse rounded bg-gray-100" />
                      </li>
                    ))}
                  </ul>
                ) : filtered.length === 0 ? (
                  <EmptyState
                    icon={<FiTag />}
                    title="No product types found"
                    description={
                      searchTerm
                        ? 'Try a different search.'
                        : 'Add a product type first.'
                    }
                  />
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filtered.map((item) => (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50">
                          <Checkbox
                            checked={selectedSet.has(item.id)}
                            onChange={() => toggleOne(item.id)}
                          />
                          <span className="font-medium text-gray-900">
                            {item.name}
                          </span>
                          <span className="truncate text-xs text-gray-500">
                            {pathOf(item)}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Field>

          <Alert tone="danger">{formError}</Alert>
        </div>

        <FormActions>
          <Button type="submit" variant="primary" loading={saving}>
            {saving ? 'Applying...' : 'Apply discount'}
          </Button>
        </FormActions>
      </form>
    </AdminPage>
  );
};

export default UpdateDiscount;
