import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useLoadSubSubCategories from '../../../Hooks/useLoadSubSubCategories';
import { compressImage } from '../edit/product/[id]';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  Field,
  ImageDropzone,
  Input,
  Modal,
  PageHeader,
  Section,
  Select,
  Textarea,
  Thumb,
  getErrorMessage,
} from '../../../components/Admin';

// The storefront has a fixed number of "new arrival" slots. Saving a slot
// creates a new arrival at that position and retires whatever was there.
const MAX_SLOTS = 8;

const EMPTY_DRAFT = { name: '', description: '', category: '', file: null };

const describeType = (item) =>
  [item.name, item.category?.name, item.category?.category?.name]
    .filter(Boolean)
    .join(' › ');

const AddNewArrivals = () => {
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const [productTypes, , isLoadingTypes] = useLoadSubSubCategories();

  // Active arrivals keyed by slot number.
  const [live, setLive] = useState({});
  const [isPending, setIsPending] = useState(true);
  const [loadError, setLoadError] = useState('');
  // Unsaved edits keyed by slot number.
  const [drafts, setDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const [extraSlots, setExtraSlots] = useState(1);
  const [savingSlot, setSavingSlot] = useState(null);
  const [discontinueSlot, setDiscontinueSlot] = useState(null);
  const [discontinuing, setDiscontinuing] = useState(false);

  const loadArrivals = useCallback(async () => {
    try {
      const res = await axiosPublic.get('/admin/view-new-arrivals');
      const bySlot = {};
      (Array.isArray(res.data) ? res.data : [])
        .filter((item) => item.isActive)
        .forEach((item) => {
          const slot = parseInt(item.serial, 10);
          if (slot >= 1 && slot <= MAX_SLOTS && !bySlot[slot]) {
            bySlot[slot] = item;
          }
        });
      setLive(bySlot);
      setLoadError('');
    } catch (err) {
      console.error('Error fetching arrivals:', err);
      setLoadError(getErrorMessage(err, 'Could not load new arrivals.'));
    } finally {
      setIsPending(false);
    }
  }, [axiosPublic]);

  useEffect(() => {
    loadArrivals();
  }, [loadArrivals]);

  const liveSlots = useMemo(
    () => Object.keys(live).map(Number).sort((a, b) => a - b),
    [live],
  );

  // Occupied slots, plus the requested number of empty ones (lowest first).
  const visibleSlots = useMemo(() => {
    const empty = [];
    for (let slot = 1; slot <= MAX_SLOTS; slot += 1) {
      if (!live[slot]) empty.push(slot);
    }
    return [...liveSlots, ...empty.slice(0, extraSlots)].sort((a, b) => a - b);
  }, [live, liveSlots, extraSlots]);

  const emptyCount = MAX_SLOTS - liveSlots.length;
  const canAddSlot = extraSlots < emptyCount;

  const getValues = (slot) => {
    const current = live[slot];
    const base = current
      ? {
          name: current.name || '',
          description: current.description || '',
          category: current.subsub?.id ? String(current.subsub.id) : '',
          file: null,
        }
      : EMPTY_DRAFT;
    return { ...base, ...drafts[slot] };
  };

  const setValue = (slot, name, value) => {
    setDrafts((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], [name]: value },
    }));
    setErrors((prev) => ({ ...prev, [slot]: { ...prev[slot], [name]: '' } }));
  };

  const clearSlot = (slot) => {
    setDrafts((prev) => {
      const { [slot]: removed, ...rest } = prev;
      return rest;
    });
    setErrors((prev) => {
      const { [slot]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSave = async (slot) => {
    const values = getValues(slot);
    const found = {};
    if (!values.name.trim()) found.name = 'Name is required.';
    if (!values.description.trim()) {
      found.description = 'Description is required.';
    }
    if (!values.category) found.category = 'Choose a product type.';
    if (!values.file) {
      found.file = live[slot]
        ? 'Choose an image to save changes - saving replaces this arrival.'
        : 'Choose an image.';
    }
    if (Object.keys(found).length > 0) {
      setErrors((prev) => ({ ...prev, [slot]: found }));
      return;
    }

    setSavingSlot(slot);
    try {
      const body = new FormData();
      body.append('name', values.name.trim());
      body.append('description', values.description.trim());
      body.append('serial', slot);
      body.append('category', values.category);
      body.append('filename', await compressImage(values.file));

      await axiosSecure.post('/admin/add-new-arrivals', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`Slot ${slot} saved`);
      clearSlot(slot);
      await loadArrivals();
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(getErrorMessage(err, 'Could not save the new arrival.'));
    } finally {
      setSavingSlot(null);
    }
  };

  const handleDiscontinue = async () => {
    const arrival = live[discontinueSlot];
    if (!arrival) {
      setDiscontinueSlot(null);
      return;
    }

    setDiscontinuing(true);
    try {
      await axiosSecure.patch(
        `/admin/discontinue-new-arrival/${arrival.id}`,
        {},
      );
      toast.success('Arrival discontinued');
      clearSlot(discontinueSlot);
      setDiscontinueSlot(null);
      await loadArrivals();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Could not discontinue the arrival.'));
    } finally {
      setDiscontinuing(false);
    }
  };

  return (
    <AdminPage title="New arrivals" width="narrow">
      <PageHeader
        title="New arrivals"
        description={`Manage the ${MAX_SLOTS} featured slots shown as new arrivals on the storefront.`}
        badge={
          !isPending &&
          !loadError && (
            <Badge tone="neutral">
              {liveSlots.length} of {MAX_SLOTS} slots used
            </Badge>
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
              loadArrivals();
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
          {visibleSlots.map((slot) => {
            const arrival = live[slot];
            const values = getValues(slot);
            const slotErrors = errors[slot] || {};
            const isSaving = savingSlot === slot;
            const isEdited = Boolean(drafts[slot]);

            return (
              <Section
                key={slot}
                title={`Slot ${slot}`}
                actions={
                  arrival ? (
                    <Badge tone="success" dot>
                      Live
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Empty</Badge>
                  )
                }
                bodyClassName="p-0"
              >
                <div className="grid gap-5 p-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    <Field
                      label="Name"
                      htmlFor={`name-${slot}`}
                      required
                      error={slotErrors.name}
                    >
                      <Input
                        id={`name-${slot}`}
                        value={values.name}
                        maxLength={100}
                        onChange={(e) => setValue(slot, 'name', e.target.value)}
                        placeholder="Product name"
                        className="w-full"
                      />
                    </Field>
                    <Field
                      label="Description"
                      htmlFor={`description-${slot}`}
                      required
                      error={slotErrors.description}
                    >
                      <Textarea
                        id={`description-${slot}`}
                        rows={3}
                        maxLength={500}
                        value={values.description}
                        onChange={(e) =>
                          setValue(slot, 'description', e.target.value)
                        }
                        placeholder="Short description"
                      />
                    </Field>
                    <Field
                      label="Product type"
                      htmlFor={`category-${slot}`}
                      required
                      error={slotErrors.category}
                    >
                      <Select
                        id={`category-${slot}`}
                        value={values.category}
                        onValueChange={(value) =>
                          setValue(slot, 'category', value)
                        }
                        width="w-full"
                        disabled={isLoadingTypes}
                      >
                        <option value="">
                          {isLoadingTypes
                            ? 'Loading product types...'
                            : 'Select a product type'}
                        </option>
                        {productTypes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {describeType(item)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field
                    label="Image"
                    htmlFor={`image-${slot}`}
                    required
                    error={slotErrors.file}
                    hint={
                      arrival && !values.file
                        ? 'Current image shown below. Upload a new one to replace it.'
                        : undefined
                    }
                  >
                    <ImageDropzone
                      id={`image-${slot}`}
                      files={values.file ? [values.file] : []}
                      onChange={(files) => setValue(slot, 'file', files[0] || null)}
                      onInvalid={(message) =>
                        setErrors((prev) => ({
                          ...prev,
                          [slot]: { ...prev[slot], file: message },
                        }))
                      }
                      error={slotErrors.file}
                    />
                    {arrival?.filename && !values.file && (
                      <div className="mt-3 flex items-center gap-3">
                        <Thumb
                          src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${arrival.filename}`}
                          alt={arrival.name}
                          className="h-16 w-16"
                        />
                        <span className="text-xs text-gray-500">
                          Current image
                        </span>
                      </div>
                    )}
                  </Field>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-gray-200 bg-gray-50/60 px-5 py-3">
                  <div>
                    {arrival && (
                      <Button
                        variant="ghost-danger"
                        disabled={isSaving}
                        onClick={() => setDiscontinueSlot(slot)}
                      >
                        Discontinue
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEdited && (
                      <Button
                        variant="ghost"
                        disabled={isSaving}
                        onClick={() => clearSlot(slot)}
                      >
                        Discard changes
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      loading={isSaving}
                      disabled={!isEdited}
                      onClick={() => handleSave(slot)}
                    >
                      {isSaving
                        ? 'Saving...'
                        : arrival
                          ? 'Save changes'
                          : 'Save arrival'}
                    </Button>
                  </div>
                </div>
              </Section>
            );
          })}

          {canAddSlot && (
            <div className="flex justify-center pt-2">
              <Button
                icon={<FiPlus />}
                onClick={() => setExtraSlots((count) => count + 1)}
              >
                Add another slot
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={discontinueSlot !== null}
        onClose={() => !discontinuing && setDiscontinueSlot(null)}
        tone="danger"
        title="Discontinue this arrival?"
        description={
          discontinueSlot !== null && live[discontinueSlot]
            ? `"${live[discontinueSlot].name}" will be removed from the storefront and slot ${discontinueSlot} will be freed.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="ghost"
              disabled={discontinuing}
              onClick={() => setDiscontinueSlot(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={discontinuing}
              onClick={handleDiscontinue}
            >
              Discontinue
            </Button>
          </>
        }
      />
    </AdminPage>
  );
};

export default AddNewArrivals;
