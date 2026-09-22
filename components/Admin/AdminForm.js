import React, { useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiInfo,
  FiShuffle,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';
import {
  AdminPage,
  Button,
  EmptyState,
  PageHeader,
  Section,
  cx,
} from './AdminUI';
import { IS_DEV } from '../../utils/devRandom';

// Form building blocks for admin create/edit pages. They compose the
// primitives in AdminUI so forms look like the list pages.

// Best human-readable message from an axios (or plain) error. Nest returns
// `message` as a string or, for validation failures, an array of strings.
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message) return message;
  return fallback;
};

const ALERT_TONES = {
  success: {
    box: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: FiCheckCircle,
  },
  danger: {
    box: 'border-red-200 bg-red-50 text-red-800',
    icon: FiAlertCircle,
  },
  warning: {
    box: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: FiAlertTriangle,
  },
  info: {
    box: 'border-sky-200 bg-sky-50 text-sky-800',
    icon: FiInfo,
  },
};

// Inline message box. Renders nothing when there are no children, so callers
// can pass `{error}` directly.
export function Alert({ tone = 'info', title, className, children }) {
  if (!children && !title) return null;
  const { box, icon: Icon } = ALERT_TONES[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        box,
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : undefined}>{children}</div>}
      </div>
    </div>
  );
}

// Label + control + hint/error. Pass the control as children and give it the
// same `id` as `htmlFor`.
export function Field({
  label,
  htmlFor,
  required = false,
  optional = false,
  hint,
  error,
  className,
  children,
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          )}
          {optional && (
            <span className="text-xs font-normal text-gray-400">Optional</span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

// Footer row of a form card: secondary actions on the left of primary ones.
export function FormActions({ children }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-gray-200 bg-gray-50/60 px-5 py-3">
      {children}
    </div>
  );
}

// Development-only shortcut for add pages: fills the form with random values so
// it can be submitted quickly. Renders nothing in production builds. `onFill`
// may be async (e.g. when it generates an image).
export function DevFillButton({ onFill, label = 'Fill with random data' }) {
  const [busy, setBusy] = useState(false);
  if (!IS_DEV) return null;

  const handleClick = async () => {
    setBusy(true);
    try {
      await onFill();
    } catch (error) {
      console.error('Random fill failed:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      icon={<FiShuffle />}
      loading={busy}
      onClick={handleClick}
      title="Development only"
      className="border-dashed"
    >
      {label}
    </Button>
  );
}

// A single-card create form: header, body fields, feedback and submit button.
// Used by the one-field "add X" pages.
export function SimpleCreateForm({
  title,
  description,
  submitLabel = 'Add',
  loading,
  onSubmit,
  error,
  success,
  onFillRandom,
  children,
}) {
  return (
    <AdminPage title={title} width="form">
      <PageHeader title={title} description={description} />
      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="space-y-4 p-5">
          {children}
          <Alert tone="danger">{error}</Alert>
          <Alert tone="success">{success}</Alert>
        </div>
        <FormActions>
          {onFillRandom && (
            <span className="mr-auto">
              <DevFillButton onFill={onFillRandom} />
            </span>
          )}
          <Button type="submit" variant="primary" loading={loading}>
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </FormActions>
      </form>
    </AdminPage>
  );
}

// A page whose whole job is one action button (e.g. "sync counts"). Shows the
// outcome of the last run inline.
export function ActionPage({
  title,
  description,
  sectionTitle,
  sectionText,
  buttonLabel,
  icon,
  loading,
  onRun,
  error,
  success,
}) {
  return (
    <AdminPage title={title} width="form">
      <PageHeader title={title} description={description} />
      <Section title={sectionTitle} icon={icon}>
        <p className="text-sm text-gray-600">{sectionText}</p>
        <div className="mt-4 space-y-3">
          <Alert tone="danger">{error}</Alert>
          <Alert tone="success">{success}</Alert>
          <Button
            variant="primary"
            icon={icon}
            loading={loading}
            onClick={onRun}
          >
            {loading ? 'Working...' : buttonLabel}
          </Button>
        </div>
      </Section>
    </AdminPage>
  );
}

// Placeholder for sections that are planned but not built yet.
export function ComingSoon({ title, description, icon }) {
  return (
    <AdminPage title={title} width="narrow">
      <PageHeader title={title} description={description} />
      <Section bodyClassName="p-0">
        <EmptyState
          icon={icon || <FiClock />}
          title="Coming soon"
          description="This section isn't available yet. It will show up here once it's ready."
          action={
            <Button href="/admin" variant="secondary">
              Back to dashboard
            </Button>
          }
        />
      </Section>
    </AdminPage>
  );
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Returns an error string for an unacceptable image file, otherwise ''.
export const validateImageFile = (file, maxMb = 5) => {
  if (!file) return '';
  if (!IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a PNG, JPG, GIF or WebP image.';
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `Image must be smaller than ${maxMb}MB.`;
  }
  return '';
};

// Keeps the previous array while its items are unchanged, so callers can pass
// a fresh array literal each render without retriggering effects.
function useStableArray(items) {
  const ref = useRef(items);
  const current = ref.current;
  if (
    current.length !== items.length ||
    items.some((item, index) => item !== current[index])
  ) {
    ref.current = items;
  }
  return ref.current;
}

// Object-URL previews for a list of File objects, revoked when the files change
// or the component unmounts.
export function useObjectUrls(files) {
  const stableFiles = useStableArray(files || []);
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const created = stableFiles.map((file) => URL.createObjectURL(file));
    setUrls(created);
    return () => created.forEach((url) => URL.revokeObjectURL(url));
  }, [stableFiles]);

  return urls;
}

// Dashed click-to-upload area with previews. `files` is an array of File
// objects (controlled); `onChange` receives the new array.
export function ImageDropzone({
  id,
  files,
  onChange,
  multiple = false,
  maxMb = 5,
  label,
  error,
  onInvalid,
}) {
  const previews = useObjectUrls(files);

  const handleSelect = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    if (!picked.length) return;

    for (const file of picked) {
      const problem = validateImageFile(file, maxMb);
      if (problem) {
        onInvalid?.(problem);
        return;
      }
    }
    onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));
  };

  const removeAt = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <label
        htmlFor={id}
        className={cx(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50/60 px-4 text-center transition-colors hover:border-gray-400 hover:bg-gray-50',
          error ? 'border-red-300' : 'border-gray-300',
          previews.length && !multiple ? 'py-3' : 'py-6',
        )}
      >
        {previews.length > 0 && !multiple ? (
          <img
            src={previews[0]}
            alt="Selected preview"
            className="max-h-56 rounded-md object-contain"
          />
        ) : (
          <>
            <FiUploadCloud className="mb-2 h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {label || 'Click to upload'}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              PNG, JPG, GIF or WebP, up to {maxMb}MB{multiple && ' each'}
            </p>
          </>
        )}
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple={multiple}
          onChange={handleSelect}
          className="sr-only"
        />
      </label>

      {multiple && previews.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {previews.map((src, index) => (
            <li
              key={src}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <img
                src={src}
                alt={`Selected ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 transition-opacity hover:bg-gray-900 focus:opacity-100 group-hover:opacity-100"
              >
                <FiX className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!multiple && files.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-2 text-xs text-gray-500 transition-colors hover:text-red-600"
        >
          Remove image
        </button>
      )}
    </div>
  );
}

// Small square thumbnail with an image-icon fallback.
export function Thumb({ src, alt, fit = 'cover', className = 'h-12 w-12' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <span
        className={cx(
          'flex shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400',
          className,
        )}
      >
        <FiImage className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cx(
        'shrink-0 rounded-lg border border-gray-200',
        fit === 'contain' ? 'object-contain' : 'object-cover',
        className,
      )}
    />
  );
}
