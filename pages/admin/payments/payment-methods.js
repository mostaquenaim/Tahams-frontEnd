import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiAlertTriangle, FiCreditCard, FiEdit2, FiPlus } from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Section,
  Select,
  Spinner,
  Textarea,
  Thumb,
  getErrorMessage,
} from '../../../components/Admin';

// Checkout payment details (numbers, instructions, icons). The backend is the
// only copy and re-checks every save (src/Admin/payment-methods in the
// backend); the checks here only give feedback before saving.

const ADMIN_KEY = ['admin', 'paymentMethods'];
const CHECKOUT_KEY = ['checkout', 'paymentMethods'];

// Images in the storefront's public folder that make sense as payment icons.
const ICON_CHOICES = [
  { value: '/cod.png', label: 'Cash on delivery' },
  { value: '/cop-bnw.png', label: 'Pick-up point' },
  { value: '/bkash-bnw.png', label: 'bKash (grey)' },
  { value: '/bkash.png', label: 'bKash (colour)' },
  { value: '/nagad-bnw.png', label: 'Nagad (grey)' },
  { value: '/nagad.png', label: 'Nagad (colour)' },
  { value: '/rocket-bnw.png', label: 'Rocket (grey)' },
  { value: '/rocket.png', label: 'Rocket (colour)' },
  { value: '/bank-transfer.jpg', label: 'Bank transfer' },
  { value: '/visa.png', label: 'Visa' },
  { value: '/mastercard.png', label: 'Mastercard' },
  { value: '/amex.png', label: 'Amex' },
];

const ACCOUNT_NUMBER_PATTERN = /^\d{6,20}$/;
const MAX_INSTRUCTIONS = 1000;

const toDraft = (method) => ({
  instructions: method.instructions || '',
  accountNumber: method.accountNumber || '',
  icon: method.icon || '',
  payOnline: !!method.payOnline,
  isActive: method.isActive !== false,
  sortOrder: String(method.sortOrder ?? 0),
});

// What the server would store - also used to find what changed.
const toValues = (draft) => ({
  instructions: draft.instructions.replace(/\r\n?/g, '\n').trim() || null,
  accountNumber: draft.accountNumber.trim() || null,
  icon: draft.icon || null,
  payOnline: draft.payOnline,
  isActive: draft.isActive,
  sortOrder: Number(draft.sortOrder),
});

// Same rules as checkMethod() on the backend, worded the same.
const findProblems = (method, values) => {
  const problems = [];
  if (values.accountNumber && !ACCOUNT_NUMBER_PATTERN.test(values.accountNumber)) {
    problems.push('Account number must be 6-20 digits, with no spaces or dashes.');
  }
  if (values.instructions && values.instructions.length > MAX_INSTRUCTIONS) {
    problems.push(`Instructions must be at most ${MAX_INSTRUCTIONS} characters.`);
  }
  if (!Number.isInteger(values.sortOrder) || values.sortOrder < 0 || values.sortOrder > 1000) {
    problems.push('Order must be a whole number from 0 to 1000.');
  }
  if (method.payLater && values.payOnline) {
    problems.push(`${method.name} is paid on delivery or at pickup, so it can't be an online payment.`);
  }
  if (method.payLater && !values.isActive) {
    problems.push(`${method.name} is part of checkout and can't be switched off here.`);
  }
  if (values.payOnline && values.isActive) {
    if (!values.instructions) problems.push('Online payment methods need instructions telling the customer how to pay.');
    if (!values.accountNumber) problems.push('Online payment methods need the number or account the customer pays to.');
  }
  if (values.accountNumber && values.instructions && !values.instructions.includes(values.accountNumber)) {
    problems.push(
      `The instructions must show the same number as the account number (${values.accountNumber}), so customers don't copy one number and read another.`,
    );
  }
  return problems;
};

const statusOf = (method) => {
  if (!method.isActive) return { tone: 'neutral', label: 'Off' };
  if (method.payLater) return { tone: 'info', label: 'At checkout' };
  if (method.payOnline) return { tone: 'success', label: 'Pay online' };
  return { tone: 'warning', label: 'Not offered' };
};

// The box customers see on the pay-online page.
function CustomerPreview({ name, values }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Customers see
      </p>
      <p className="text-sm font-semibold text-gray-900">How to pay with {name}</p>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-gray-600">
        {values.instructions || <span className="italic text-gray-400">No instructions</span>}
      </p>
      {values.accountNumber && (
        <span className="mt-2.5 inline-flex rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium">
          Copy {values.accountNumber}
        </span>
      )}
    </div>
  );
}

function EditModal({ method, onClose, onSaved }) {
  const axiosSecure = useAxiosSecure();
  const [draft, setDraft] = useState(() => toDraft(method));
  const [confirmedNumber, setConfirmedNumber] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const original = useMemo(() => toValues(toDraft(method)), [method]);
  const values = toValues(draft);
  const problems = findProblems(method, values);
  const changed = Object.keys(values).filter((key) => values[key] !== original[key]);

  // A new number customers will send money to deserves a second look.
  const numberChanged =
    values.accountNumber !== original.accountNumber && !!values.accountNumber;
  const needsNumberCheck = numberChanged && values.isActive && values.payOnline;

  useEffect(() => setConfirmedNumber(false), [values.accountNumber]);

  const set = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setServerError('');
  };

  const canSave =
    changed.length > 0 &&
    problems.length === 0 &&
    (!needsNumberCheck || confirmedNumber) &&
    !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setServerError('');
    try {
      const body = Object.fromEntries(changed.map((key) => [key, values[key]]));
      await axiosSecure.patch(`/admin/payment-methods/${method.id}`, body);
      toast.success(`${method.name} saved.`);
      onSaved();
    } catch (error) {
      setServerError(getErrorMessage(error, 'Could not save the payment method.'));
      setSaving(false);
    }
  };

  const iconChoices = ICON_CHOICES.some((choice) => choice.value === draft.icon) || !draft.icon
    ? ICON_CHOICES
    : [{ value: draft.icon, label: draft.icon }, ...ICON_CHOICES];

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title={`Edit ${method.name}`}
      size="xl"
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!canSave} loading={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-sm text-gray-800">
            <Checkbox
              checked={draft.isActive}
              disabled={method.payLater}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            Shown to customers
          </label>
          <label className="flex items-center gap-2.5 text-sm text-gray-800">
            <Checkbox
              checked={draft.payOnline}
              disabled={method.payLater}
              onChange={(e) => set('payOnline', e.target.checked)}
            />
            Offered on the pay-online page (customer sends money and uploads a screenshot)
          </label>
          {method.payLater && (
            <p className="text-xs text-gray-500">
              {method.name} is chosen at checkout, so it is always on and never an online payment.
            </p>
          )}
        </div>

        <Field
          label="Account / merchant number"
          htmlFor="pm-account"
          optional={!(values.payOnline && values.isActive)}
          hint="Digits only. Customers get a Copy button for it, so it must also appear in the instructions."
        >
          <Input
            id="pm-account"
            inputMode="numeric"
            value={draft.accountNumber}
            onChange={(e) => set('accountNumber', e.target.value.replace(/\s/g, ''))}
            placeholder="e.g. 01XXXXXXXXX"
            className="w-full"
          />
        </Field>

        {numberChanged && original.accountNumber && (
          <Alert tone="warning" title="The payment number is changing">
            From <strong>{original.accountNumber}</strong> to <strong>{values.accountNumber}</strong>.
          </Alert>
        )}

        <Field
          label="Instructions"
          htmlFor="pm-instructions"
          optional={!(values.payOnline && values.isActive)}
          hint={`Shown to the customer exactly as written, line breaks included. ${draft.instructions.length}/${MAX_INSTRUCTIONS}`}
        >
          <Textarea
            id="pm-instructions"
            rows={5}
            value={draft.instructions}
            onChange={(e) => set('instructions', e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field label="Icon" htmlFor="pm-icon">
            <div className="flex items-center gap-3">
              <Thumb src={draft.icon} alt="" fit="contain" className="h-9 w-9" />
              <Select
                id="pm-icon"
                value={draft.icon}
                onValueChange={(value) => set('icon', value)}
                width="w-full"
              >
                <option value="">No icon</option>
                {iconChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </Select>
            </div>
          </Field>
          <Field label="Order" htmlFor="pm-sort" hint="Lower first">
            <Input
              id="pm-sort"
              type="number"
              min={0}
              max={1000}
              step={1}
              value={draft.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
              className="w-full"
            />
          </Field>
        </div>

        {values.payOnline && values.isActive && (
          <CustomerPreview name={method.name} values={values} />
        )}

        {problems.length > 0 && (
          <Alert tone="danger" title="Fix before saving">
            <ul className="list-disc space-y-0.5 pl-4">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </Alert>
        )}

        {needsNumberCheck && problems.length === 0 && (
          <label className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
            <Checkbox
              className="mt-0.5"
              checked={confirmedNumber}
              onChange={(e) => setConfirmedNumber(e.target.checked)}
            />
            <span>
              I have checked that <strong>{values.accountNumber}</strong> is the right number.
              Customers will send money to it as soon as this is saved.
            </span>
          </label>
        )}

        <Alert tone="danger">{serverError}</Alert>
      </div>
    </Modal>
  );
}

const PaymentMethodsPage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: methods = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ADMIN_KEY,
    queryFn: async () => (await axiosSecure.get('/admin/payment-methods')).data,
  });

  const handleSaved = () => {
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ADMIN_KEY });
    queryClient.invalidateQueries({ queryKey: CHECKOUT_KEY });
  };

  const onlineCount = methods.filter((m) => m.isActive && m.payOnline).length;

  return (
    <AdminPage title="Payment methods" width="narrow">
      <PageHeader
        title="Payment methods"
        description="The numbers and instructions customers see when they pay. Changes go live on the storefront right away."
        actions={
          <Button href="/admin/add/add-payment-method" icon={<FiPlus />}>
            Add payment method
          </Button>
        }
      />

      {!isLoading && !isError && onlineCount === 0 && methods.length > 0 && (
        <Alert tone="warning" title="No online payment method is on" className="mb-4">
          Customers who choose &quot;Pay online now&quot; at checkout will see no way to pay.
        </Alert>
      )}

      <Section title="Methods" icon={<FiCreditCard />} bodyClassName="p-0">
        {isLoading ? (
          <div className="flex justify-center py-14 text-gray-400">
            <Spinner className="h-5 w-5" />
          </div>
        ) : isError ? (
          <div className="p-5">
            <Alert tone="danger" title="Could not load payment methods">
              {getErrorMessage(error, 'Please try again.')}{' '}
              <button type="button" className="font-medium underline" onClick={() => refetch()}>
                Try again
              </button>
            </Alert>
          </div>
        ) : methods.length === 0 ? (
          <EmptyState icon={<FiCreditCard />} title="No payment methods yet" />
        ) : (
          <ul className="divide-y divide-gray-100">
            {methods.map((method) => {
              const status = statusOf(method);
              const incomplete =
                method.isActive && method.payOnline && (!method.instructions || !method.accountNumber);
              return (
                <li key={method.id} className="flex items-start gap-4 px-5 py-4">
                  <Thumb src={method.icon} alt="" fit="contain" className="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{method.name}</p>
                      <Badge tone={status.tone} dot>
                        {status.label}
                      </Badge>
                      {!method.configuredAt && <Badge tone="warning">Not set up</Badge>}
                    </div>
                    {method.accountNumber && (
                      <p className="mt-1 font-mono text-sm text-gray-800">{method.accountNumber}</p>
                    )}
                    {method.instructions && (
                      <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-gray-500">
                        {method.instructions}
                      </p>
                    )}
                    {incomplete && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <FiAlertTriangle className="h-3.5 w-3.5" />
                        Missing details
                      </p>
                    )}
                  </div>
                  <Button size="sm" icon={<FiEdit2 />} onClick={() => setEditing(method)}>
                    Edit
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {editing && (
        <EditModal method={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </AdminPage>
  );
};

export default PaymentMethodsPage;
