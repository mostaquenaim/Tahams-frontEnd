import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiArrowDown,
  FiArrowUp,
  FiLayout,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { formatBDT } from '../../../utils/pricing';
import { imageUrl } from '../../../components/Storefront/StorefrontUI';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  CheckboxField,
  EmptyState,
  Field,
  IconButton,
  Input,
  PageHeader,
  SearchInput,
  Section,
  Spinner,
  Thumb,
  getErrorMessage,
} from '../../../components/Admin';

// Keep in step with HOME_SECTION_LIMITS in the backend admin.service.
const MAX_SECTIONS = 20;
const MAX_PRODUCTS = 60;
const MAX_TEXT = 80;

let nextKey = 0;
const newKey = () => `section-${(nextKey += 1)}`;

const toDraft = (sections) =>
  sections.map((section) => ({
    key: newKey(),
    eyebrow: section.eyebrow || '',
    title: section.title || '',
    isActive: section.isActive !== false,
    products: section.products || [],
  }));

// What the server stores; also used to tell whether anything changed.
const toPayload = (draft) =>
  draft.map((section) => ({
    eyebrow: section.eyebrow.trim(),
    title: section.title.trim(),
    isActive: section.isActive,
    productIds: section.products.map((product) => product.id),
  }));

const move = (list, from, to) => {
  if (to < 0 || to >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

const productImage = (product) => {
  const file = product.thumbImage || product.filename;
  return file ? imageUrl(file) : '';
};

// Search-as-you-type product finder. Only published products can be added,
// because the storefront hides everything else.
function ProductPicker({ selectedIds, disabled, onAdd }) {
  const axiosPublic = useAxiosPublic();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      setFailed(false);
      return undefined;
    }

    setSearching(true);
    const id = (requestId.current += 1);
    const timer = setTimeout(async () => {
      try {
        const res = await axiosPublic.get('/admin/search-products', {
          params: { q: query },
        });
        if (id !== requestId.current) return;
        setResults(Array.isArray(res.data) ? res.data : []);
        setFailed(false);
      } catch (err) {
        if (id !== requestId.current) return;
        console.error('Product search failed:', err);
        setResults([]);
        setFailed(true);
      } finally {
        if (id === requestId.current) setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [term, axiosPublic]);

  const available = useMemo(
    () =>
      results.filter(
        (product) => product.publishable && !selectedIds.includes(product.id),
      ),
    [results, selectedIds],
  );
  const hiddenCount = results.length - available.length;
  const query = term.trim();

  return (
    <div className="space-y-2">
      <SearchInput
        value={term}
        onValueChange={setTerm}
        placeholder="Search products by name to add..."
        className="sm:max-w-full lg:max-w-full"
      />

      {query.length >= 2 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/60">
          {searching ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
              <Spinner /> Searching...
            </div>
          ) : failed ? (
            <p className="px-3 py-3 text-sm text-red-600">
              Search failed. Try again.
            </p>
          ) : available.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-500">
              {results.length === 0
                ? `No products match "${query}".`
                : 'Everything that matches is already here or unpublished.'}
            </p>
          ) : (
            <ul className="max-h-72 divide-y divide-gray-200 overflow-y-auto">
              {available.slice(0, 20).map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Thumb
                    src={productImage(product)}
                    alt={product.name}
                    className="h-10 w-10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBDT(product.sellingPrice)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    icon={<FiPlus />}
                    disabled={disabled}
                    onClick={() => onAdd(product)}
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {!searching && !failed && available.length > 20 && (
            <p className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
              Showing 20 of {available.length}. Type more to narrow it down.
            </p>
          )}
          {!searching && !failed && available.length > 0 && hiddenCount > 0 && (
            <p className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
              {hiddenCount} more match{hiddenCount === 1 ? '' : 'es'} hidden
              (already added or unpublished).
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const HomeSections = () => {
  const axiosSecure = useAxiosSecure();

  const [saved, setSaved] = useState([]);
  const [draft, setDraft] = useState([]);
  const [isPending, setIsPending] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axiosSecure.get('/admin/manage-home-sections');
      const sections = Array.isArray(res.data) ? res.data : [];
      setSaved(toPayload(toDraft(sections)));
      setDraft(toDraft(sections));
      setLoadError('');
    } catch (err) {
      console.error('Error loading home sections:', err);
      setLoadError(getErrorMessage(err, 'Could not load home page sections.'));
    } finally {
      setIsPending(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    load();
  }, [load]);

  const isDirty = useMemo(
    () => JSON.stringify(toPayload(draft)) !== JSON.stringify(saved),
    [draft, saved],
  );

  // Don't lose edits to an accidental refresh or navigation.
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const updateSection = (key, changes) =>
    setDraft((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...changes } : s)),
    );

  const addProduct = (key, product) =>
    setDraft((prev) =>
      prev.map((s) =>
        s.key === key && s.products.length < MAX_PRODUCTS
          ? { ...s, products: [...s.products, product] }
          : s,
      ),
    );

  const removeProduct = (key, productId) =>
    setDraft((prev) =>
      prev.map((s) =>
        s.key === key
          ? { ...s, products: s.products.filter((p) => p.id !== productId) }
          : s,
      ),
    );

  const moveProduct = (key, index, direction) =>
    setDraft((prev) =>
      prev.map((s) =>
        s.key === key
          ? { ...s, products: move(s.products, index, index + direction) }
          : s,
      ),
    );

  const addSection = () =>
    setDraft((prev) => [
      ...prev,
      { key: newKey(), eyebrow: '', title: '', isActive: true, products: [] },
    ]);

  const removeSection = (key) =>
    setDraft((prev) => prev.filter((s) => s.key !== key));

  const moveSection = (index, direction) =>
    setDraft((prev) => move(prev, index, index + direction));

  const hasMissingTitle = draft.some((s) => !s.title.trim());
  const canSave = draft.length > 0 && !hasMissingTitle;

  const handleSave = async () => {
    if (!canSave) {
      setShowErrors(true);
      return;
    }

    setSaving(true);
    try {
      const res = await axiosSecure.put('/admin/home-sections', {
        sections: toPayload(draft),
      });
      const sections = Array.isArray(res.data) ? res.data : [];
      setSaved(toPayload(toDraft(sections)));
      setDraft(toDraft(sections));
      setShowErrors(false);
      toast.success('Home page updated');
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(getErrorMessage(err, 'Could not save home page sections.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setShowErrors(false);
    setIsPending(true);
    load();
  };

  return (
    <AdminPage title="Home page sections" width="narrow">
      <PageHeader
        title="Home page sections"
        description="Choose the product rows shown on the storefront home page, and which products appear in each."
        actions={
          !isPending &&
          !loadError && (
            <>
              {isDirty && (
                <Button variant="ghost" disabled={saving} onClick={handleDiscard}>
                  Discard changes
                </Button>
              )}
              <Button
                variant="primary"
                loading={saving}
                disabled={!isDirty}
                onClick={handleSave}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </>
          )
        }
      />

      {loadError ? (
        <Section bodyClassName="p-5">
          <Alert tone="danger">{loadError}</Alert>
          <Button
            className="mt-3"
            onClick={() => {
              setIsPending(true);
              load();
            }}
          >
            Try again
          </Button>
        </Section>
      ) : isPending ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1].map((key) => (
            <div
              key={key}
              className="h-64 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {isDirty && (
            <Alert tone="warning">
              You have unsaved changes. The storefront only updates after you
              press Save changes.
            </Alert>
          )}
          {showErrors && hasMissingTitle && (
            <Alert tone="danger">Every section needs a title.</Alert>
          )}

          {draft.length === 0 && (
            <Section bodyClassName="p-0">
              <EmptyState
                icon={<FiLayout />}
                title="No sections"
                description="Add a section, or reload to go back to the saved layout. At least one section is required - hide it if you don't want it shown."
              />
            </Section>
          )}

          {draft.map((section, index) => {
            const selectedIds = section.products.map((p) => p.id);
            const titleError =
              showErrors && !section.title.trim() ? 'Title is required.' : '';
            const atLimit = section.products.length >= MAX_PRODUCTS;

            return (
              <Section
                key={section.key}
                title={`Section ${index + 1}`}
                actions={
                  <>
                    <Badge tone={section.isActive ? 'success' : 'neutral'} dot>
                      {section.isActive ? 'Shown' : 'Hidden'}
                    </Badge>
                    <IconButton
                      label="Move section up"
                      icon={<FiArrowUp />}
                      disabled={index === 0}
                      onClick={() => moveSection(index, -1)}
                    />
                    <IconButton
                      label="Move section down"
                      icon={<FiArrowDown />}
                      disabled={index === draft.length - 1}
                      onClick={() => moveSection(index, 1)}
                    />
                    <IconButton
                      label="Remove section"
                      variant="ghost-danger"
                      icon={<FiTrash2 />}
                      disabled={draft.length === 1}
                      onClick={() => removeSection(section.key)}
                    />
                  </>
                }
                bodyClassName="p-0"
              >
                <div className="space-y-5 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Small heading"
                      htmlFor={`eyebrow-${section.key}`}
                      optional
                      hint='Shown above the title, e.g. "ZIPPER".'
                    >
                      <Input
                        id={`eyebrow-${section.key}`}
                        value={section.eyebrow}
                        maxLength={MAX_TEXT}
                        onChange={(e) =>
                          updateSection(section.key, { eyebrow: e.target.value })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field
                      label="Title"
                      htmlFor={`title-${section.key}`}
                      required
                      error={titleError}
                      hint='The main heading, e.g. "HOODIE".'
                    >
                      <Input
                        id={`title-${section.key}`}
                        value={section.title}
                        maxLength={MAX_TEXT}
                        onChange={(e) =>
                          updateSection(section.key, { title: e.target.value })
                        }
                        className="w-full"
                      />
                    </Field>
                  </div>

                  <CheckboxField
                    label="Show this section on the home page"
                    checked={section.isActive}
                    onChange={(e) =>
                      updateSection(section.key, { isActive: e.target.checked })
                    }
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">
                        Products
                      </h3>
                      <span className="text-xs text-gray-500">
                        {section.products.length} of {MAX_PRODUCTS}
                      </span>
                    </div>

                    {section.products.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
                        No products yet. This section stays off the storefront
                        until it has at least one.
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                        {section.products.map((product, productIndex) => (
                          <li
                            key={product.id}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <span className="w-5 text-center text-xs text-gray-400">
                              {productIndex + 1}
                            </span>
                            <Thumb
                              src={productImage(product)}
                              alt={product.name}
                              className="h-10 w-10"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatBDT(product.sellingPrice)}
                              </p>
                            </div>
                            {!product.publishable && (
                              <Badge tone="warning">Unpublished</Badge>
                            )}
                            <IconButton
                              size="sm"
                              label="Move up"
                              icon={<FiArrowUp />}
                              disabled={productIndex === 0}
                              onClick={() =>
                                moveProduct(section.key, productIndex, -1)
                              }
                            />
                            <IconButton
                              size="sm"
                              label="Move down"
                              icon={<FiArrowDown />}
                              disabled={
                                productIndex === section.products.length - 1
                              }
                              onClick={() =>
                                moveProduct(section.key, productIndex, 1)
                              }
                            />
                            <IconButton
                              size="sm"
                              label="Remove product"
                              variant="ghost-danger"
                              icon={<FiX />}
                              onClick={() =>
                                removeProduct(section.key, product.id)
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3">
                      {atLimit ? (
                        <p className="text-xs text-gray-500">
                          This section is full. Remove a product to add another.
                        </p>
                      ) : (
                        <ProductPicker
                          selectedIds={selectedIds}
                          onAdd={(product) => addProduct(section.key, product)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Section>
            );
          })}

          {draft.length < MAX_SECTIONS && (
            <div className="flex justify-center pt-2">
              <Button icon={<FiPlus />} onClick={addSection}>
                Add section
              </Button>
            </div>
          )}
        </div>
      )}
    </AdminPage>
  );
};

export default HomeSections;
