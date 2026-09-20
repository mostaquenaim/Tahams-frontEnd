import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPackage, FiRotateCcw, FiX } from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useLoadSubSubCategories from '../../../Hooks/useLoadSubSubCategories';
import useLoadColors from '../../../Hooks/useLoadColors';
import useLoadSizes from '../../../Hooks/useLoadSizes';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Field,
  ImageDropzone,
  Input,
  PageHeader,
  SearchInput,
  Section,
  Select,
  Textarea,
  cx,
  getErrorMessage,
} from '../../../components/Admin';

const MAX_ADDITIONAL_IMAGES = 10;
const MAX_IMAGE_MB = 10;

const INITIAL_FORM = {
  name: '',
  serialNo: '',
  note: '',
  vatPercentage: '',
  discountPercentage: '',
  buyingPrice: '',
  sellingPrice: '',
  description: '',
  longDescription: '',
};

const DEFAULT_TAGS = ['cloth'];

const WHOLE_NUMBER = /^\d+$/;

// Order in which errors are focused when a submit fails.
const FIELD_ORDER = [
  'name',
  'serialNo',
  'vatPercentage',
  'discountPercentage',
  'buyingPrice',
  'sellingPrice',
  'description',
  'featured',
  'categories',
];

const genderSuffix = (series) => {
  if (!series?.isGenderVaried) return '';
  return series.isForMen ? ' (Men)' : ' (Women)';
};

const describeType = (item) =>
  [item.category?.name, item.category?.category?.name]
    .filter(Boolean)
    .join(', ') + genderSuffix(item.category?.category);

// Turns a product record (from the products list) into the form's state.
const fromProduct = (product) => {
  const form = { ...INITIAL_FORM };
  Object.keys(INITIAL_FORM).forEach((key) => {
    if (product[key] !== undefined && product[key] !== null) {
      form[key] = String(product[key]);
    }
  });

  const selection = {};
  (product.pscs || []).forEach((item) => {
    const categoryId = item.category?.id;
    if (!categoryId) return;
    const entry = selection[categoryId] || { hasSizes: false, quantities: {} };
    if (item.size) {
      entry.hasSizes = true;
      entry.quantities[item.size.id] = String(item.quantity ?? 0);
    } else {
      entry.quantities.none = String(item.quantity ?? 0);
    }
    selection[categoryId] = entry;
  });

  return {
    form,
    selection,
    color: product.color?.name || '',
    tags: product.tags
      ? product.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : DEFAULT_TAGS,
  };
};

function TagInput({ id, tags, onChange }) {
  const [draft, setDraft] = useState('');

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    if (!tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      onChange([...tags, tag]);
    }
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-[2.25rem] flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition-colors focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-900/10">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 py-0.5 pl-2.5 pr-1 text-xs font-medium text-gray-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((item) => item !== tag))}
            aria-label={`Remove tag ${tag}`}
            className="flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900"
          >
            <FiX className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={tags.length ? '' : 'Add tags...'}
        className="min-w-[8rem] flex-1 border-0 bg-transparent p-0.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
      />
    </div>
  );
}

export default function AddProduct() {
  const axiosSecure = useAxiosSecure();
  const [productTypes, , isLoadingTypes] = useLoadSubSubCategories();
  const colors = useLoadColors();
  const sizes = useLoadSizes();

  const [form, setForm] = useState(INITIAL_FORM);
  const [color, setColor] = useState('');
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [featured, setFeatured] = useState([]);
  const [additional, setAdditional] = useState([]);
  // categoryId -> { hasSizes, quantities: { [sizeId | 'none']: string } }
  const [selection, setSelection] = useState({});
  const [typeSearch, setTypeSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [duplicated, setDuplicated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // "Duplicate" on the products list stashes a product for this page.
  useEffect(() => {
    let stored;
    try {
      stored = localStorage.getItem('duplicate_product_data');
      if (stored) localStorage.removeItem('duplicate_product_data');
    } catch (error) {
      return;
    }
    if (!stored) return;

    try {
      const data = fromProduct(JSON.parse(stored));
      setForm(data.form);
      setSelection(data.selection);
      setColor(data.color);
      setTags(data.tags);
      setDuplicated(true);
    } catch (error) {
      console.error('Error parsing duplicate product data:', error);
    }
  }, []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError('');
  };

  const clearError = (name) =>
    setErrors((prev) => ({ ...prev, [name]: undefined }));

  const filteredTypes = useMemo(() => {
    const term = typeSearch.trim().toLowerCase();
    if (!term) return productTypes;
    return productTypes.filter((item) =>
      `${item.name} ${describeType(item)}`.toLowerCase().includes(term),
    );
  }, [productTypes, typeSearch]);

  const selectedColor = colors.find((item) => item.name === color);
  const selectedCount = Object.keys(selection).length;

  const toggleType = (id, checked) => {
    clearError('categories');
    setSelection((prev) => {
      if (!checked) {
        const { [id]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { hasSizes: false, quantities: {} } };
    });
  };

  const setHasSizes = (id, hasSizes) =>
    setSelection((prev) => ({
      ...prev,
      [id]: { hasSizes, quantities: {} },
    }));

  const setQuantity = (id, key, value) => {
    clearError('categories');
    setSelection((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantities: { ...prev[id].quantities, [key]: value },
      },
    }));
  };

  const handleAdditionalChange = (files) => {
    if (files.length > MAX_ADDITIONAL_IMAGES) {
      toast.error(`You can add up to ${MAX_ADDITIONAL_IMAGES} extra images.`);
      return;
    }
    setAdditional(files);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Product name is required.';
    if (!form.serialNo.trim()) next.serialNo = 'Serial number is required.';

    const checkNumber = (key, label, max) => {
      const value = form[key].trim();
      if (value === '') next[key] = `${label} is required.`;
      else if (!WHOLE_NUMBER.test(value)) {
        next[key] = `${label} must be a whole number.`;
      } else if (max !== undefined && Number(value) > max) {
        next[key] = `${label} can't be more than ${max}.`;
      }
    };
    checkNumber('vatPercentage', 'VAT', 100);
    checkNumber('discountPercentage', 'Discount', 100);
    checkNumber('buyingPrice', 'Buying price');
    checkNumber('sellingPrice', 'Selling price');

    if (!form.description.trim()) {
      next.description = 'Short description is required.';
    }
    if (featured.length === 0) next.featured = 'A featured image is required.';

    if (selectedCount === 0) {
      next.categories = 'Select at least one product type.';
    } else {
      for (const entry of Object.values(selection)) {
        const values = entry.hasSizes
          ? sizes.map((size) => entry.quantities[size.id])
          : [entry.quantities.none];
        const entered = values.filter((value) => value !== undefined && value !== '');
        if (entry.hasSizes && entered.length === 0) {
          next.categories = 'Enter a quantity for at least one size in each product type with sizes.';
          break;
        }
        if (entered.some((value) => !WHOLE_NUMBER.test(value))) {
          next.categories = 'Quantities must be whole numbers, 0 or more.';
          break;
        }
      }
    }

    return next;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setColor('');
    setTags(DEFAULT_TAGS);
    setFeatured([]);
    setAdditional([]);
    setSelection({});
    setTypeSearch('');
    setErrors({});
    setFormError('');
    setDuplicated(false);
  };

  const focusFirstError = (found) => {
    const first = FIELD_ORDER.find((key) => found[key]);
    if (!first) return;
    const target = document.getElementById(`field-${first}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus?.({ preventScroll: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    const catsInfo = [];
    Object.entries(selection).forEach(([id, entry]) => {
      catsInfo.push(Number(id));
      if (entry.hasSizes) {
        sizes.forEach((size) => {
          const quantity = entry.quantities[size.id];
          if (quantity !== undefined && quantity !== '') {
            catsInfo.push([size.id, parseInt(quantity, 10)]);
          }
        });
      } else {
        catsInfo.push([null, parseInt(entry.quantities.none || '0', 10)]);
      }
    });

    const body = new FormData();
    body.append('subCategories', Object.keys(selection).join(','));
    body.append('catsInfo', JSON.stringify(catsInfo));
    body.append('name', form.name.trim());
    body.append('serialNo', form.serialNo.trim());
    body.append('note', form.note.trim());
    body.append('vatPercentage', form.vatPercentage.trim());
    body.append('discountPercentage', form.discountPercentage.trim());
    body.append('buyingPrice', form.buyingPrice.trim());
    body.append('sellingPrice', form.sellingPrice.trim());
    body.append('tags', tags.join(','));
    body.append('description', form.description.trim());
    body.append('myfile', featured[0]);
    body.append('color', color);
    body.append('longDescription', form.longDescription.trim());

    setSubmitting(true);
    try {
      await axiosSecure.post('/admin/add-product', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Failed to add the product.'));
      setSubmitting(false);
      return;
    }

    toast.success('Product added');

    if (additional.length > 0) {
      const pictures = new FormData();
      additional.forEach((file) => pictures.append('myfiles', file));
      try {
        await axiosSecure.post('/admin/add-product-pictures', pictures, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Extra images uploaded');
      } catch (err) {
        console.error(err);
        toast.error(
          'The product was saved, but the extra images could not be uploaded. Add them from the product page.',
          { duration: 8000 },
        );
      }
    }

    resetForm();
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminPage title="Add product" width="narrow">
      <PageHeader
        title="Add product"
        description="Fill in the details to add a new product to the catalog."
      />

      {duplicated && (
        <Alert tone="info" title="Started from an existing product" className="mb-5">
          Details were copied over. Add a featured image and check the stock
          quantities before saving.
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Section title="Basic information">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Product name"
              htmlFor="field-name"
              required
              error={errors.name}
            >
              <Input
                id="field-name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full"
              />
            </Field>
            <Field
              label="Serial number"
              htmlFor="field-serialNo"
              required
              error={errors.serialNo}
            >
              <Input
                id="field-serialNo"
                value={form.serialNo}
                onChange={(e) => setField('serialNo', e.target.value)}
                className="w-full"
              />
            </Field>
            <Field
              label="Note"
              htmlFor="field-note"
              optional
              hint="Internal note, not shown to customers."
              className="md:col-span-2"
            >
              <Input
                id="field-note"
                value={form.note}
                onChange={(e) => setField('note', e.target.value)}
                className="w-full"
              />
            </Field>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['buyingPrice', 'Buying price', '৳'],
              ['sellingPrice', 'Selling price', '৳'],
              ['vatPercentage', 'VAT', '%'],
              ['discountPercentage', 'Discount', '%'],
            ].map(([key, label, unit]) => (
              <Field
                key={key}
                label={label}
                htmlFor={`field-${key}`}
                required
                error={errors[key]}
              >
                <div className="relative">
                  <Input
                    id={`field-${key}`}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder="0"
                    className="w-full pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {unit}
                  </span>
                </div>
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Descriptions">
          <div className="space-y-5">
            <Field
              label="Short description"
              htmlFor="field-description"
              required
              hint="Shown on product cards."
              error={errors.description}
            >
              <Textarea
                id="field-description"
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </Field>
            <Field
              label="Full description"
              htmlFor="field-longDescription"
              optional
              hint="Shown on the product page."
            >
              <Textarea
                id="field-longDescription"
                rows={6}
                value={form.longDescription}
                onChange={(e) => setField('longDescription', e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section title="Attributes">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Color" htmlFor="field-color" optional>
              <div className="flex items-center gap-2">
                <span
                  className="h-9 w-9 shrink-0 rounded-lg border border-gray-200"
                  style={{
                    backgroundColor: selectedColor?.colorCode || 'transparent',
                  }}
                  aria-hidden="true"
                />
                <Select
                  id="field-color"
                  value={color}
                  onValueChange={setColor}
                  width="w-full"
                >
                  <option value="">No color</option>
                  {colors.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </div>
            </Field>
            <Field
              label="Tags"
              htmlFor="field-tags"
              hint="Press Enter or comma to add a tag. Tags help customers find the product."
            >
              <TagInput id="field-tags" tags={tags} onChange={setTags} />
            </Field>
          </div>
        </Section>

        <Section title="Images">
          <div className="space-y-5">
            <Field
              label="Featured image"
              htmlFor="field-featured"
              required
              error={errors.featured}
            >
              <ImageDropzone
                id="field-featured"
                files={featured}
                maxMb={MAX_IMAGE_MB}
                error={errors.featured}
                onChange={(files) => {
                  setFeatured(files);
                  clearError('featured');
                }}
                onInvalid={(message) =>
                  setErrors((prev) => ({ ...prev, featured: message }))
                }
              />
            </Field>
            <Field
              label="Additional images"
              htmlFor="field-additional"
              optional
              hint={`Up to ${MAX_ADDITIONAL_IMAGES} images.`}
            >
              <ImageDropzone
                id="field-additional"
                multiple
                files={additional}
                maxMb={MAX_IMAGE_MB}
                label="Click to add images"
                onChange={handleAdditionalChange}
                onInvalid={(message) => toast.error(message)}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Categories & stock"
          actions={
            <Badge tone={selectedCount ? 'info' : 'neutral'}>
              {selectedCount} selected
            </Badge>
          }
          bodyClassName="p-0"
        >
          <div className="border-b border-gray-200 p-4">
            <SearchInput
              value={typeSearch}
              onValueChange={setTypeSearch}
              placeholder="Search product types..."
            />
          </div>

          <div
            id="field-categories"
            tabIndex={-1}
            className="p-4 focus:outline-none"
          >
            {errors.categories && (
              <Alert tone="danger" className="mb-4">
                {errors.categories}
              </Alert>
            )}

            {isLoadingTypes ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            ) : filteredTypes.length === 0 ? (
              <EmptyState
                icon={<FiPackage />}
                title="No product types found"
                description={
                  typeSearch
                    ? 'Try a different search.'
                    : 'Add a product type first.'
                }
              />
            ) : (
              <div className="grid items-start gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredTypes.map((item) => {
                  const entry = selection[item.id];
                  const isSelected = Boolean(entry);

                  return (
                    <div
                      key={item.id}
                      className={cx(
                        'rounded-lg border p-3 transition-colors',
                        isSelected
                          ? 'border-gray-900/30 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300',
                      )}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                          className="mt-0.5"
                          checked={isSelected}
                          onChange={(e) => toggleType(item.id, e.target.checked)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-gray-900">
                            {item.name}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {describeType(item)}
                          </span>
                        </span>
                      </label>

                      {isSelected && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                            <Checkbox
                              checked={entry.hasSizes}
                              onChange={(e) =>
                                setHasSizes(item.id, e.target.checked)
                              }
                            />
                            This product has sizes
                          </label>

                          <div className="mt-3 space-y-2">
                            {entry.hasSizes ? (
                              sizes.map((size) => (
                                <div
                                  key={size.id}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <label
                                    htmlFor={`qty-${item.id}-${size.id}`}
                                    className="text-sm text-gray-700"
                                  >
                                    {size.name}
                                  </label>
                                  <Input
                                    id={`qty-${item.id}-${size.id}`}
                                    size="sm"
                                    type="number"
                                    min={0}
                                    step={1}
                                    inputMode="numeric"
                                    value={entry.quantities[size.id] ?? ''}
                                    onChange={(e) =>
                                      setQuantity(item.id, size.id, e.target.value)
                                    }
                                    placeholder="Qty"
                                    className="w-24"
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <label
                                  htmlFor={`qty-${item.id}`}
                                  className="text-sm text-gray-700"
                                >
                                  Quantity
                                </label>
                                <Input
                                  id={`qty-${item.id}`}
                                  size="sm"
                                  type="number"
                                  min={0}
                                  step={1}
                                  inputMode="numeric"
                                  value={entry.quantities.none ?? ''}
                                  onChange={(e) =>
                                    setQuantity(item.id, 'none', e.target.value)
                                  }
                                  placeholder="Qty"
                                  className="w-24"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Section>

        <Alert tone="danger">{formError}</Alert>

        <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-end gap-2 rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
          <Button
            variant="ghost"
            icon={<FiRotateCcw />}
            onClick={resetForm}
            disabled={submitting}
          >
            Clear form
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {submitting ? 'Saving...' : 'Save product'}
          </Button>
        </div>
      </form>
    </AdminPage>
  );
}
