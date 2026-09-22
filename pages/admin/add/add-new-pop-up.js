import { useState } from 'react';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  AdminPage,
  Alert,
  Button,
  CheckboxField,
  DevFillButton,
  Field,
  FormActions,
  ImageDropzone,
  Input,
  PageHeader,
  getErrorMessage,
} from '../../../components/Admin';
import {
  randomImageFile,
  randomLabel,
  toDateTimeLocal,
} from '../../../utils/devRandom';

const INITIAL_FORM = {
  title: '',
  url: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const AddNewPopUp = () => {
  const axiosSecure = useAxiosSecure();
  const [form, setForm] = useState(INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError('');
  };

  // Development only (see DevFillButton).
  const fillRandom = async () => {
    const now = new Date();
    const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setForm({
      title: randomLabel(['Sale', 'Offer', 'Promo']).replace(/\s+/g, '-'),
      url: '',
      startDate: toDateTimeLocal(now),
      endDate: toDateTimeLocal(inAWeek),
      isActive: true,
    });
    setFiles([await randomImageFile('Pop-up')]);
    setErrors({});
    setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    else if (/\s/.test(form.title)) next.title = 'Title cannot contain spaces.';
    if (!form.startDate) next.startDate = 'Choose a start date.';
    if (!form.endDate) next.endDate = 'Choose an end date.';
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      next.endDate = 'End date must be after the start date.';
    }
    if (files.length === 0) next.image = 'Choose an image for the pop-up.';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const data = new FormData();
    data.append('filename', files[0]);
    data.append('title', form.title.trim());
    data.append('url', form.url.trim());
    data.append('startDate', form.startDate);
    data.append('endDate', form.endDate);
    data.append('isActive', form.isActive);

    setSaving(true);
    setFormError('');
    try {
      await axiosSecure.post('/admin/add-new-pop-up', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Pop-up created');
      setForm(INITIAL_FORM);
      setFiles([]);
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Could not create the pop-up.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage title="Add pop-up" width="form">
      <PageHeader
        title="Add pop-up"
        description="Create a promotional pop-up to show on the storefront."
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="space-y-5 p-5">
          <Field
            label="Title"
            htmlFor="title"
            required
            hint="Used as the pop-up's identifier, so it can't contain spaces."
            error={errors.title}
          >
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. Eid-Sale"
              className="w-full"
            />
          </Field>

          <Field
            label="Link URL"
            htmlFor="url"
            optional
            hint="Where the pop-up sends visitors when clicked."
          >
            <Input
              id="url"
              value={form.url}
              onChange={(e) => setField('url', e.target.value)}
              placeholder="https://"
              className="w-full"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Start"
              htmlFor="startDate"
              required
              error={errors.startDate}
            >
              <Input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
                className="w-full"
              />
            </Field>
            <Field
              label="End"
              htmlFor="endDate"
              required
              error={errors.endDate}
            >
              <Input
                id="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
                className="w-full"
              />
            </Field>
          </div>

          <Field label="Image" htmlFor="image" required error={errors.image}>
            <ImageDropzone
              id="image"
              files={files}
              onChange={(next) => {
                setFiles(next);
                setErrors((prev) => ({ ...prev, image: undefined }));
              }}
              onInvalid={(message) =>
                setErrors((prev) => ({ ...prev, image: message }))
              }
              error={errors.image}
            />
          </Field>

          <CheckboxField
            label="Active"
            checked={form.isActive}
            onChange={(e) => setField('isActive', e.target.checked)}
          />

          <Alert tone="danger">{formError}</Alert>
        </div>

        <FormActions>
          <span className="mr-auto">
            <DevFillButton onFill={fillRandom} />
          </span>
          <Button type="submit" variant="primary" loading={saving}>
            {saving ? 'Creating...' : 'Create pop-up'}
          </Button>
        </FormActions>
      </form>
    </AdminPage>
  );
};

export default AddNewPopUp;
