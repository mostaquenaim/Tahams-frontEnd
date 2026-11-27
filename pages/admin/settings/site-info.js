import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiArrowDown,
  FiArrowUp,
  FiInfo,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiPlus,
  FiRotateCcw,
  FiShare2,
  FiTrash2,
} from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { SITE_SETTINGS_KEY } from '../../../Hooks/useSiteSettings';
import { SITE_DEFAULTS } from '../../../utils/siteDefaults';
import { SOCIAL_NETWORKS } from '../../../utils/siteSettings';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  Checkbox,
  Field,
  FormActions,
  IconButton,
  Input,
  PageHeader,
  Section,
  Spinner,
  Tabs,
  Textarea,
  getErrorMessage,
} from '../../../components/Admin';

// Public business details the storefront shows: contact info, showrooms,
// social links and the promo banner. Each tab saves on its own. Until a tab is
// saved, the storefront shows the built-in copy (utils/siteDefaults.js), and
// "Use built-in details" goes back to it. The backend checks every save
// (src/Admin/site-settings in the backend) and its message is shown as is.
//
// Payment numbers live on Payments > Payment Methods; delivery fees are in
// the backend code on purpose.

const ADMIN_KEY = ['admin', 'siteSettings'];

const TABS = [
  { value: 'contact', label: 'Contact', icon: <FiPhone /> },
  { value: 'showrooms', label: 'Showrooms', icon: <FiMapPin /> },
  { value: 'social', label: 'Social links', icon: <FiShare2 /> },
  { value: 'promoBanners', label: 'Promo banner', icon: <FiMessageSquare /> },
];

const DESCRIPTIONS = {
  contact: 'Head office phone, email and address. Shown in the footer, the contact page and the privacy policy.',
  showrooms:
    'Display centers, in the order shown. Shown in the footer and on the contact page; the ones with store pickup on are the pickup choices at checkout.',
  social: 'Leave a link empty to hide that icon everywhere.',
  promoBanners: 'The rotating notice above the navbar on every storefront page.',
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

// Showroom ids are never shown; they only keep a checkout choice stable.
const newShowroomId = () => `sr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

function ListControls({ index, count, onMove, onRemove, removeLabel }) {
  return (
    <div className="flex items-center gap-0.5">
      <IconButton size="sm" label="Move up" icon={<FiArrowUp />} disabled={index === 0} onClick={() => onMove(index, -1)} />
      <IconButton
        size="sm"
        label="Move down"
        icon={<FiArrowDown />}
        disabled={index === count - 1}
        onClick={() => onMove(index, 1)}
      />
      <IconButton size="sm" label={removeLabel} icon={<FiTrash2 />} onClick={() => onRemove(index)} />
    </div>
  );
}

const moveItem = (list, index, by) => {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + by, 0, item);
  return next;
};

/* ---------------------------- Contact ---------------------------- */

function ContactForm({ draft, onChange }) {
  const set = (field) => (e) => onChange({ ...draft, [field]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Phone" htmlFor="ct-phone" required hint="Bangladeshi mobile number, like 01712345678.">
        <Input id="ct-phone" value={draft.phone || ''} onChange={set('phone')} className="w-full" />
      </Field>
      <Field label="WhatsApp number" htmlFor="ct-wa" optional hint="Empty hides the “WhatsApp also available” note.">
        <Input id="ct-wa" value={draft.whatsapp || ''} onChange={set('whatsapp')} className="w-full" />
      </Field>
      <Field label="Email" htmlFor="ct-email" required>
        <Input id="ct-email" type="email" value={draft.email || ''} onChange={set('email')} className="w-full" />
      </Field>
      <Field label="Contact hours" htmlFor="ct-hours" optional>
        <Input
          id="ct-hours"
          value={draft.supportHours || ''}
          onChange={set('supportHours')}
          placeholder="Sat–Thu, 10 AM – 6 PM"
          className="w-full"
        />
      </Field>
      <Field
        label="Head office address"
        htmlFor="ct-address"
        required
        className="sm:col-span-2"
        hint="Line breaks are kept in the footer; elsewhere the lines are joined."
      >
        <Textarea id="ct-address" rows={3} value={draft.headOfficeAddress || ''} onChange={set('headOfficeAddress')} />
      </Field>
      <Field label="Head office map link" htmlFor="ct-map" optional className="sm:col-span-2" hint="https:// link, e.g. from Google Maps › Share.">
        <Input id="ct-map" value={draft.headOfficeMapUrl || ''} onChange={set('headOfficeMapUrl')} className="w-full" />
      </Field>
    </div>
  );
}

/* --------------------------- Showrooms --------------------------- */

function ShowroomsForm({ draft, onChange }) {
  const update = (index, field, value) =>
    onChange(draft.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  const add = () =>
    onChange([
      ...draft,
      { id: newShowroomId(), name: `Display Center ${draft.length + 1}`, pickupName: '', address: '', phone: '', mapUrl: '', pickup: false },
    ]);

  return (
    <div className="space-y-4">
      {draft.length === 0 && (
        <Alert tone="warning" title="No showrooms">
          Checkout will offer home delivery only.
        </Alert>
      )}
      {draft.map((s, index) => (
        <div key={s.id} className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{s.name || `Showroom ${index + 1}`}</p>
            <ListControls
              index={index}
              count={draft.length}
              onMove={(i, by) => onChange(moveItem(draft, i, by))}
              onRemove={(i) => onChange(draft.filter((_, j) => j !== i))}
              removeLabel="Remove showroom"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor={`sr-name-${s.id}`} required>
              <Input id={`sr-name-${s.id}`} value={s.name || ''} onChange={(e) => update(index, 'name', e.target.value)} className="w-full" />
            </Field>
            <Field label="Phone" htmlFor={`sr-phone-${s.id}`} optional>
              <Input id={`sr-phone-${s.id}`} value={s.phone || ''} onChange={(e) => update(index, 'phone', e.target.value)} className="w-full" />
            </Field>
            <Field label="Address" htmlFor={`sr-addr-${s.id}`} required className="sm:col-span-2">
              <Textarea id={`sr-addr-${s.id}`} rows={2} value={s.address || ''} onChange={(e) => update(index, 'address', e.target.value)} />
            </Field>
            <Field label="Map link" htmlFor={`sr-map-${s.id}`} optional className="sm:col-span-2">
              <Input id={`sr-map-${s.id}`} value={s.mapUrl || ''} onChange={(e) => update(index, 'mapUrl', e.target.value)} className="w-full" />
            </Field>
            <label className="flex items-center gap-2.5 text-sm text-gray-800 sm:col-span-2">
              <Checkbox checked={!!s.pickup} onChange={(e) => update(index, 'pickup', e.target.checked)} />
              Customers can pick up orders here
            </label>
            {s.pickup && (
              <Field
                label="Pickup name"
                htmlFor={`sr-pick-${s.id}`}
                required
                className="sm:col-span-2"
                hint="Shown at checkout and saved on the order, e.g. “DC1 - Shahabuddin Plaza”. Changing it doesn't change past orders."
              >
                <Input id={`sr-pick-${s.id}`} value={s.pickupName || ''} onChange={(e) => update(index, 'pickupName', e.target.value)} className="w-full" />
              </Field>
            )}
          </div>
        </div>
      ))}
      <Button icon={<FiPlus />} onClick={add}>
        Add showroom
      </Button>
    </div>
  );
}

/* ----------------------------- Social ----------------------------- */

const SOCIAL_HINTS = {
  facebook: 'https://www.facebook.com/…',
  instagram: 'https://www.instagram.com/…',
  tiktok: 'https://www.tiktok.com/@…',
  messenger: 'https://m.me/…',
};

function SocialForm({ draft, onChange }) {
  return (
    <div className="grid gap-4">
      {SOCIAL_NETWORKS.map(({ key, label }) => (
        <Field key={key} label={label} htmlFor={`so-${key}`} optional>
          <Input
            id={`so-${key}`}
            value={draft[key] || ''}
            placeholder={SOCIAL_HINTS[key]}
            onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
            className="w-full"
          />
        </Field>
      ))}
    </div>
  );
}

/* -------------------------- Promo banners ------------------------- */

function BannerPreview({ banner }) {
  return (
    <div
      className="rounded-md border border-gray-200 px-4 py-2 text-center text-sm font-medium"
      style={{ backgroundColor: banner.bgColor || '#ffffff', color: banner.textColor || '#000000' }}
    >
      <span>{banner.text || <span className="italic opacity-60">No text</span>}</span>
      {banner.links?.map((link, i) => (
        <span key={i} className="ml-2 font-semibold italic underline">
          {link.text}
        </span>
      ))}
    </div>
  );
}

function BannersForm({ draft, onChange }) {
  const update = (index, patch) => onChange(draft.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  const updateLink = (index, li, patch) =>
    update(index, { links: draft[index].links.map((l, j) => (j === li ? { ...l, ...patch } : l)) });

  return (
    <div className="space-y-4">
      {draft.length === 0 && <Alert tone="info">No banners: the notice bar is hidden.</Alert>}
      {draft.map((b, index) => (
        <div key={index} className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-900">
              <Checkbox checked={b.active !== false} onChange={(e) => update(index, { active: e.target.checked })} />
              Banner {index + 1}
              {b.active === false && <Badge>Hidden</Badge>}
            </label>
            <ListControls
              index={index}
              count={draft.length}
              onMove={(i, by) => onChange(moveItem(draft, i, by))}
              onRemove={(i) => onChange(draft.filter((_, j) => j !== i))}
              removeLabel="Remove banner"
            />
          </div>
          <div className="space-y-4">
            <Field label="Text" htmlFor={`bn-text-${index}`} required hint={`${(b.text || '').length}/200`}>
              <Input id={`bn-text-${index}`} value={b.text || ''} onChange={(e) => update(index, { text: e.target.value })} className="w-full" />
            </Field>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="color" value={b.bgColor || '#ffffff'} onChange={(e) => update(index, { bgColor: e.target.value })} />
                Background
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="color" value={b.textColor || '#000000'} onChange={(e) => update(index, { textColor: e.target.value })} />
                Text
              </label>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-700">Links</p>
              <div className="space-y-2">
                {(b.links || []).map((link, li) => (
                  <div key={li} className="flex items-center gap-2">
                    <Input
                      aria-label="Link text"
                      placeholder="Call Now"
                      value={link.text || ''}
                      onChange={(e) => updateLink(index, li, { text: e.target.value })}
                      className="w-32 shrink-0"
                    />
                    <Input
                      aria-label="Link address"
                      placeholder="https://… or tel:01XXXXXXXXX"
                      value={link.url || ''}
                      onChange={(e) => updateLink(index, li, { url: e.target.value })}
                      className="min-w-0 flex-1"
                    />
                    <IconButton
                      size="sm"
                      label="Remove link"
                      icon={<FiTrash2 />}
                      onClick={() => update(index, { links: b.links.filter((_, j) => j !== li) })}
                    />
                  </div>
                ))}
              </div>
              {(b.links || []).length < 5 && (
                <Button
                  size="sm"
                  className="mt-2"
                  icon={<FiPlus />}
                  onClick={() => update(index, { links: [...(b.links || []), { text: '', url: '' }] })}
                >
                  Add link
                </Button>
              )}
            </div>
            <BannerPreview banner={b} />
          </div>
        </div>
      ))}
      {draft.length < 10 && (
        <Button
          icon={<FiPlus />}
          onClick={() => onChange([...draft, { text: '', bgColor: '#ffffff', textColor: '#000000', active: true, links: [] }])}
        >
          Add banner
        </Button>
      )}
    </div>
  );
}

const FORMS = {
  contact: ContactForm,
  showrooms: ShowroomsForm,
  social: SocialForm,
  promoBanners: BannersForm,
};

/* ----------------------------- Editor ----------------------------- */

function SettingEditor({ settingKey, row, onSaved, onDirtyChange }) {
  const axiosSecure = useAxiosSecure();
  const isSaved = row?.value !== null && row?.value !== undefined;
  // Keyed on the content, not the object: a background refetch returns a new
  // object and must not wipe edits in progress.
  const savedJson = JSON.stringify(isSaved ? row.value : null);
  const initial = useMemo(
    () => (savedJson !== 'null' ? JSON.parse(savedJson) : clone(SITE_DEFAULTS[settingKey])),
    [savedJson, settingKey],
  );
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(null); // 'save' | 'reset'
  const [serverError, setServerError] = useState('');

  useEffect(() => setDraft(initial), [initial]);

  const dirty = !same(draft, initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const Form = FORMS[settingKey];
  const label = TABS.find((t) => t.value === settingKey).label;

  const handleSave = async () => {
    setBusy('save');
    setServerError('');
    try {
      await axiosSecure.put(`/admin/site-settings/${settingKey}`, { value: draft });
      toast.success(`${label} saved. The storefront shows it now.`);
      onSaved();
    } catch (error) {
      setServerError(getErrorMessage(error, `Could not save ${label.toLowerCase()}.`));
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Go back to the built-in ${label.toLowerCase()}? What is saved here will be removed.`)) return;
    setBusy('reset');
    setServerError('');
    try {
      await axiosSecure.delete(`/admin/site-settings/${settingKey}`);
      toast.success(`${label}: using the built-in details.`);
      onSaved();
    } catch (error) {
      setServerError(getErrorMessage(error, 'Could not reset.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Section
      title={label}
      icon={<FiInfo />}
      actions={
        isSaved ? (
          <Badge tone="success" dot>
            Saved {row.updatedAt ? formatDate(row.updatedAt) : ''}
          </Badge>
        ) : (
          <Badge tone="warning" dot>
            Built-in details
          </Badge>
        )
      }
      bodyClassName="p-0"
    >
      <div className="space-y-4 p-5">
        <p className="text-sm text-gray-500">{DESCRIPTIONS[settingKey]}</p>
        {!isSaved && (
          <Alert tone="info">
            Not saved yet, so the storefront shows the built-in details below. Saving makes these the live copy.
          </Alert>
        )}
        <Form draft={draft} onChange={(next) => { setDraft(next); setServerError(''); }} />
        <Alert tone="danger" title={serverError ? 'Not saved' : undefined}>{serverError}</Alert>
      </div>
      <FormActions>
        {isSaved && (
          <Button icon={<FiRotateCcw />} onClick={handleReset} loading={busy === 'reset'} disabled={!!busy} className="mr-auto">
            Use built-in details
          </Button>
        )}
        <Button onClick={() => { setDraft(initial); setServerError(''); }} disabled={!dirty || !!busy}>
          Discard changes
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={busy === 'save'}
          disabled={!!busy || (isSaved && !dirty)}
        >
          {isSaved ? 'Save changes' : 'Save'}
        </Button>
      </FormActions>
    </Section>
  );
}

/* ------------------------------ Page ------------------------------ */

const SiteInfoPage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('contact');
  const [dirty, setDirty] = useState(false);

  const { data: rows = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ADMIN_KEY,
    queryFn: async () => (await axiosSecure.get('/admin/site-settings/manage')).data,
  });

  // Leaving with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const changeTab = (next) => {
    if (dirty && !window.confirm('You have unsaved changes on this tab. Leave without saving?')) return;
    setDirty(false);
    setTab(next);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_KEY });
    queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_KEY });
  };

  const row = Array.isArray(rows) ? rows.find((r) => r.key === tab) : null;

  return (
    <AdminPage title="Site info" width="form">
      <PageHeader
        title="Site info"
        description="Contact details, showrooms, social links and the promo banner customers see. Changes go live on the storefront right away."
      />
      <Tabs value={tab} onChange={changeTab} tabs={TABS} />

      {isLoading ? (
        <div className="flex justify-center py-14 text-gray-400">
          <Spinner className="h-5 w-5" />
        </div>
      ) : isError ? (
        <Alert tone="danger" title="Could not load site info">
          {getErrorMessage(error, 'Please try again.')}{' '}
          <button type="button" className="font-medium underline" onClick={() => refetch()}>
            Try again
          </button>
        </Alert>
      ) : (
        <SettingEditor
          key={tab}
          settingKey={tab}
          row={row}
          onSaved={handleSaved}
          onDirtyChange={setDirty}
        />
      )}
    </AdminPage>
  );
};

export default SiteInfoPage;
