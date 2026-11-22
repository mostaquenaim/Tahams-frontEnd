import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FiCheckCircle,
  FiKey,
  FiPauseCircle,
  FiPlayCircle,
  FiShield,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiUserCheck,
  FiRefreshCw,
} from 'react-icons/fi';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import {
  invalidateStaffAdmin,
  useRoles,
  useStaffList,
} from '../../../../Hooks/useStaffAdmin';
import { useAdminAccess } from '../../../../Contexts/AdminAccessContext';
import { P } from '../../../../utils/adminAccess';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  SkeletonRows,
  StatCard,
  StatGrid,
  Table,
  TableCard,
  TableEmpty,
  TBody,
  Td,
  Th,
  THead,
  Tr,
  getErrorMessage,
} from '../../../../components/Admin';

// Staff accounts and their roles. Listing needs staff:view; every change
// needs staff:manage (Owner only). The backend enforces all the rules -
// no self-changes, no granting above your own access, always one active
// Owner - so the UI only avoids offering what would be refused.

const PHONE_RE = /^01[356789][0-9]{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GUEST_EMAIL_RE = /^guest\d+@tahamsbd\.com$/i;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const LAST_OWNER_MESSAGE =
  'This is the last active Owner - make someone else an Owner first.';

const LOGIN_METHOD_LABEL = {
  google: 'Google',
  password: 'Password',
  other: 'Other',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (name, email) => {
  const source = name?.trim() || email || '?';
  const parts = source.split(/\s+/);
  if (parts.length === 1) return source.slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const roleTone = (role) =>
  role?.key === 'owner' ? 'warning' : role?.key ? 'info' : 'neutral';

const validatePassword = (password, confirm) => {
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password can't be longer than ${PASSWORD_MAX} characters.`;
  }
  if (password !== confirm) return "Passwords don't match.";
  return '';
};

/* ------------------------------------------------------------------ */

function RoleSelect({ id, roles, value, onChange, disabled }) {
  return (
    <Select
      id={id}
      value={value}
      onValueChange={onChange}
      width="w-full"
      disabled={disabled}
    >
      <option value="">Choose a role…</option>
      {roles.map((role) => (
        <option key={role.id} value={String(role.id)}>
          {role.name}
          {role.isOwner ? ' (full access)' : ` (${role.permissions.length} permissions)`}
        </option>
      ))}
    </Select>
  );
}

function RoleHint({ role }) {
  if (!role) return null;
  return (
    <p className="mt-1.5 text-xs text-gray-500">
      {role.description ||
        (role.isOwner
          ? 'Full access to everything, including staff and roles.'
          : `${role.permissions.length} permissions.`)}
    </p>
  );
}

function PromoteDialog({ open, onClose, roles, onDone }) {
  const axiosSecure = useAxiosSecure();
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setEmail('');
    setRoleId('');
    setError('');
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const submit = async (e) => {
    e?.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) return setError('Enter a valid email address.');
    if (GUEST_EMAIL_RE.test(trimmed)) {
      return setError('Guest checkout identities cannot be staff.');
    }
    if (!roleId) return setError('Choose a role.');

    setSaving(true);
    setError('');
    try {
      const res = await axiosSecure.post('/admin/staff/promote', {
        email: trimmed,
        roleId: Number(roleId),
      });
      toast.success(`${res.data?.email || trimmed} is now ${res.data?.role?.name || 'staff'}`);
      await onDone();
      reset();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add this person as staff.'));
    } finally {
      setSaving(false);
    }
  };

  const selected = roles.find((r) => String(r.id) === roleId);

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add an existing account"
      description="Give someone who already has a Tahams account (customer sign-up or Google) access to the admin panel. They keep signing in the way they do now."
      icon={<FiUserCheck />}
      footer={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={submit}>
            Add as staff
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Account email" htmlFor="promote-email" required>
          <Input
            id="promote-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full"
          />
        </Field>
        <Field label="Role" htmlFor="promote-role" required>
          <RoleSelect
            id="promote-role"
            roles={roles}
            value={roleId}
            onChange={setRoleId}
          />
          <RoleHint role={selected} />
        </Field>
        {selected?.isOwner && (
          <Alert tone="warning">
            Owners have full access, including adding and removing staff.
          </Alert>
        )}
        <Alert tone="danger">{error}</Alert>
        {/* lets Enter submit */}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

function CreateDialog({ open, onClose, roles, onDone }) {
  const axiosSecure = useAxiosSecure();
  const EMPTY = { name: '', email: '', mbl_no: '', password: '', confirm: '', roleId: '' };
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e?.target ? e.target.value : e }));

  const close = () => {
    if (saving) return;
    setForm(EMPTY);
    setError('');
    onClose();
  };

  const submit = async (e) => {
    e?.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.mbl_no.trim();
    if (name.length < 2) return setError('Enter their name.');
    if (name.length > 80) return setError("Name can't be longer than 80 characters.");
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');
    if (GUEST_EMAIL_RE.test(email)) {
      return setError('Guest checkout identities cannot be staff.');
    }
    if (phone && !PHONE_RE.test(phone)) {
      return setError('Enter an 11-digit Bangladeshi mobile number, e.g. 01712345678.');
    }
    const passwordError = validatePassword(form.password, form.confirm);
    if (passwordError) return setError(passwordError);
    if (!form.roleId) return setError('Choose a role.');

    setSaving(true);
    setError('');
    try {
      const body = {
        name,
        email,
        password: form.password,
        roleId: Number(form.roleId),
      };
      if (phone) body.mbl_no = phone;
      const res = await axiosSecure.post('/admin/staff', body);
      toast.success(`Staff account created for ${res.data?.email || email}`);
      await onDone();
      setForm(EMPTY);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create the staff account.'));
    } finally {
      setSaving(false);
    }
  };

  const selected = roles.find((r) => String(r.id) === form.roleId);

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create a staff account"
      description="A new account that signs in with this email and password. Share the password with them privately."
      icon={<FiUserPlus />}
      size="lg"
      footer={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={submit}>
            Create account
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="create-name" required>
            <Input
              id="create-name"
              autoComplete="off"
              value={form.name}
              onChange={set('name')}
              className="w-full"
            />
          </Field>
          <Field label="Mobile number" htmlFor="create-phone" optional>
            <Input
              id="create-phone"
              inputMode="numeric"
              autoComplete="off"
              value={form.mbl_no}
              onChange={set('mbl_no')}
              placeholder="01XXXXXXXXX"
              className="w-full"
            />
          </Field>
        </div>
        <Field label="Email" htmlFor="create-email" required>
          <Input
            id="create-email"
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={set('email')}
            className="w-full"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Password"
            htmlFor="create-password"
            required
            hint={`At least ${PASSWORD_MIN} characters.`}
          >
            <Input
              id="create-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              className="w-full"
            />
          </Field>
          <Field label="Confirm password" htmlFor="create-confirm" required>
            <Input
              id="create-confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
              className="w-full"
            />
          </Field>
        </div>
        <Field label="Role" htmlFor="create-role" required>
          <RoleSelect
            id="create-role"
            roles={roles}
            value={form.roleId}
            onChange={set('roleId')}
          />
          <RoleHint role={selected} />
        </Field>
        {selected?.isOwner && (
          <Alert tone="warning">
            Owners have full access, including adding and removing staff.
          </Alert>
        )}
        <Alert tone="danger">{error}</Alert>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

function ChangeRoleDialog({ member, onClose, roles, onDone }) {
  const axiosSecure = useAxiosSecure();
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const current = member?.role?.id ? String(member.role.id) : '';
  const value = roleId || current;
  const selected = roles.find((r) => String(r.id) === value);

  const close = () => {
    if (saving) return;
    setRoleId('');
    setError('');
    onClose();
  };

  const submit = async () => {
    if (!value || value === current) return close();
    setSaving(true);
    setError('');
    try {
      await axiosSecure.patch(`/admin/staff/${member.id}`, {
        roleId: Number(value),
      });
      toast.success(`${member.email} is now ${selected?.name || 'updated'}`);
      await onDone();
      setRoleId('');
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not change the role.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!member}
      onClose={close}
      title="Change role"
      description={member ? `For ${member.name || member.email}. Takes effect on their next click.` : undefined}
      icon={<FiShield />}
      footer={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={saving}
            disabled={!value || value === current}
            onClick={submit}
          >
            Save role
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Role" htmlFor="change-role" required>
          <RoleSelect
            id="change-role"
            roles={roles}
            value={value}
            onChange={setRoleId}
          />
          <RoleHint role={selected} />
        </Field>
        {selected?.isOwner && value !== current && (
          <Alert tone="warning">
            Owners have full access, including adding and removing staff.
          </Alert>
        )}
        <Alert tone="danger">{error}</Alert>
      </div>
    </Modal>
  );
}

function ResetPasswordDialog({ member, onClose, onDone }) {
  const axiosSecure = useAxiosSecure();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => {
    if (saving) return;
    setPassword('');
    setConfirm('');
    setError('');
    onClose();
  };

  const submit = async (e) => {
    e?.preventDefault();
    const problem = validatePassword(password, confirm);
    if (problem) return setError(problem);
    setSaving(true);
    setError('');
    try {
      await axiosSecure.post(`/admin/staff/${member.id}/password`, { password });
      toast.success(`Password reset for ${member.email}`);
      await onDone();
      setPassword('');
      setConfirm('');
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset the password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!member}
      onClose={close}
      title="Reset password"
      description={
        member
          ? `Set a new password for ${member.email}. They'll be signed out on every device.`
          : undefined
      }
      icon={<FiKey />}
      footer={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={submit}>
            Reset password
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field
          label="New password"
          htmlFor="reset-password"
          required
          hint={`At least ${PASSWORD_MIN} characters.`}
        >
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </Field>
        <Field label="Confirm password" htmlFor="reset-confirm" required>
          <Input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full"
          />
        </Field>
        <Alert tone="danger">{error}</Alert>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

// suspend / reactivate / remove
const CONFIRM_COPY = {
  suspend: {
    title: 'Suspend staff access',
    body: (m) =>
      `${m.name || m.email} will be signed out everywhere and can't open the admin panel until reactivated. Their role is kept.`,
    button: 'Suspend',
    variant: 'danger',
    icon: <FiPauseCircle />,
    tone: 'warning',
    done: (m) => `${m.email} is suspended`,
  },
  reactivate: {
    title: 'Reactivate staff access',
    body: (m) =>
      `${m.name || m.email} will be able to open the admin panel again as ${m.role?.name || 'staff'}.`,
    button: 'Reactivate',
    variant: 'primary',
    icon: <FiPlayCircle />,
    tone: 'success',
    done: (m) => `${m.email} is active again`,
  },
  remove: {
    title: 'Remove staff access',
    body: (m) =>
      `${m.name || m.email} will be signed out everywhere and lose admin access. Their account stays, as a regular customer account.`,
    button: 'Remove access',
    variant: 'danger',
    icon: <FiUserMinus />,
    tone: 'danger',
    done: (m) => `${m.email} is no longer staff`,
  },
};

function ConfirmDialog({ action, member, onClose, onDone }) {
  const axiosSecure = useAxiosSecure();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const copy = action ? CONFIRM_COPY[action] : null;

  const close = () => {
    if (saving) return;
    setError('');
    onClose();
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      if (action === 'remove') {
        await axiosSecure.delete(`/admin/staff/${member.id}`);
      } else {
        await axiosSecure.patch(`/admin/staff/${member.id}`, {
          active: action === 'reactivate',
        });
      }
      toast.success(copy.done(member));
      await onDone();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'That change was refused.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!(copy && member)}
      onClose={close}
      title={copy?.title}
      icon={copy?.icon}
      tone={copy?.tone}
      footer={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button variant={copy?.variant} loading={saving} onClick={submit}>
            {copy?.button}
          </Button>
        </>
      }
    >
      {copy && member && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{copy.body(member)}</p>
          <Alert tone="danger">{error}</Alert>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */

const StaffPage = () => {
  const queryClient = useQueryClient();
  const { access, can, isOwner } = useAdminAccess();
  const canManage = can(P.STAFF_MANAGE);

  const staffQuery = useStaffList();
  const rolesQuery = useRoles();
  const staff = useMemo(
    () => (Array.isArray(staffQuery.data) ? staffQuery.data : []),
    [staffQuery.data],
  );
  const roles = useMemo(
    () => (Array.isArray(rolesQuery.data) ? rolesQuery.data : []),
    [rolesQuery.data],
  );

  // Roles this actor may hand out: the server refuses the rest (only Owners
  // assign Owner; nobody grants permissions they don't hold).
  const assignableRoles = useMemo(() => {
    const held = new Set(access?.permissions || []);
    return roles.filter((role) =>
      role.isOwner
        ? isOwner
        : isOwner || role.permissions.every((p) => held.has(p)),
    );
  }, [roles, access, isOwner]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [dialog, setDialog] = useState(null); // { type, member }
  const closeDialog = () => setDialog(null);
  const refresh = () => invalidateStaffAdmin(queryClient);

  const activeOwners = staff.filter((m) => m.active && m.role?.key === 'owner');
  const isLastOwner = (m) =>
    m.active && m.role?.key === 'owner' && activeOwners.length <= 1;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((m) => {
      if (roleFilter && String(m.role?.id) !== roleFilter) return false;
      if (statusFilter === 'active' && !m.active) return false;
      if (statusFilter === 'suspended' && m.active) return false;
      if (!q) return true;
      return (
        m.email?.toLowerCase().includes(q) ||
        m.name?.toLowerCase().includes(q) ||
        m.mbl_no?.includes(q)
      );
    });
  }, [staff, search, roleFilter, statusFilter]);

  const loading = staffQuery.isPending;
  const loadError = staffQuery.error || rolesQuery.error;
  const activeCount = staff.filter((m) => m.active).length;

  return (
    <AdminPage title="Staff" width="narrow">
      <PageHeader
        title="Staff"
        description={
          canManage
            ? 'Who can open the admin panel, and what their role lets them do.'
            : 'Who can open the admin panel. Only an Owner can make changes.'
        }
        actions={
          <>
            <IconButton
              label="Refresh"
              icon={<FiRefreshCw />}
              onClick={refresh}
            />
            {canManage && (
              <Dropdown
                label="Add staff"
                icon={<FiUserPlus />}
                variant="primary"
                width="w-72"
                disabled={!assignableRoles.length}
              >
                <DropdownLabel>Add staff</DropdownLabel>
                <DropdownItem
                  icon={<FiUserCheck />}
                  onClick={() => setDialog({ type: 'promote' })}
                >
                  From an existing account
                </DropdownItem>
                <DropdownItem
                  icon={<FiUserPlus />}
                  onClick={() => setDialog({ type: 'create' })}
                >
                  Create a new account
                </DropdownItem>
              </Dropdown>
            )}
          </>
        }
      />

      {loadError && (
        <Alert tone="danger" className="mb-4">
          {getErrorMessage(loadError, 'Could not load staff.')}
        </Alert>
      )}

      <StatGrid cols={3}>
        <StatCard
          label="Staff members"
          value={loading ? '—' : staff.length}
          icon={<FiUsers />}
        />
        <StatCard
          label="Active"
          value={loading ? '—' : activeCount}
          icon={<FiCheckCircle />}
          tone="success"
        />
        <StatCard
          label="Suspended"
          value={loading ? '—' : staff.length - activeCount}
          icon={<FiPauseCircle />}
          tone="warning"
        />
      </StatGrid>

      <TableCard
        toolbar={
          <>
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search by name, email or phone..."
            />
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              width="w-full sm:w-44"
              aria-label="Role"
            >
              <option value="">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              width="w-full sm:w-36"
              aria-label="Status"
            >
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </>
        }
      >
        <Table>
          <THead>
            <Th>Member</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Signs in with</Th>
            <Th>Account since</Th>
            {canManage && <Th align="right">Actions</Th>}
          </THead>
          <TBody>
            {loading ? (
              <SkeletonRows rows={4} cols={canManage ? 6 : 5} />
            ) : filtered.length === 0 ? (
              <TableEmpty
                colSpan={canManage ? 6 : 5}
                icon={<FiUsers />}
                title={staff.length ? 'No staff match' : 'No staff yet'}
                description={
                  staff.length
                    ? 'Try a different search or filter.'
                    : canManage
                      ? 'Use "Add staff" to give someone access.'
                      : undefined
                }
              />
            ) : (
              filtered.map((member) => {
                const isSelf = member.id === access?.id;
                const lastOwner = isLastOwner(member);
                // Only act on staff whose role you fully cover.
                const canTouch =
                  canManage &&
                  !isSelf &&
                  (member.role?.key !== 'owner' || isOwner);
                return (
                  <Tr key={member.id}>
                    <Td>
                      <div className="flex min-w-[14rem] items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                          {getInitials(member.name, member.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-medium text-gray-900">
                            <span className="truncate">{member.name || '—'}</span>
                            {isSelf && <Badge>You</Badge>}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td nowrap>
                      <Badge tone={roleTone(member.role)}>
                        {member.role?.name || '—'}
                      </Badge>
                    </Td>
                    <Td nowrap>
                      {member.active ? (
                        <Badge tone="success" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge tone="warning" dot>
                          Suspended
                        </Badge>
                      )}
                    </Td>
                    <Td nowrap className="text-gray-600">
                      {LOGIN_METHOD_LABEL[member.loginMethod] || '—'}
                    </Td>
                    <Td nowrap className="text-gray-600">
                      {formatDate(member.createdAt)}
                    </Td>
                    {canManage && (
                      <Td nowrap align="right">
                        {canTouch ? (
                          <div className="flex justify-end gap-0.5">
                            <IconButton
                              label="Change role"
                              icon={<FiShield />}
                              onClick={() =>
                                lastOwner
                                  ? toast.error(LAST_OWNER_MESSAGE)
                                  : setDialog({ type: 'role', member })
                              }
                            />
                            {member.loginMethod === 'password' && (
                              <IconButton
                                label="Reset password"
                                icon={<FiKey />}
                                onClick={() =>
                                  setDialog({ type: 'password', member })
                                }
                              />
                            )}
                            {member.active ? (
                              <IconButton
                                label="Suspend"
                                icon={<FiPauseCircle />}
                                onClick={() =>
                                  lastOwner
                                    ? toast.error(LAST_OWNER_MESSAGE)
                                    : setDialog({ type: 'suspend', member })
                                }
                              />
                            ) : (
                              <IconButton
                                label="Reactivate"
                                icon={<FiPlayCircle />}
                                variant="ghost-success"
                                onClick={() =>
                                  setDialog({ type: 'reactivate', member })
                                }
                              />
                            )}
                            <IconButton
                              label="Remove staff access"
                              icon={<FiUserMinus />}
                              variant="ghost-danger"
                              onClick={() =>
                                lastOwner
                                  ? toast.error(LAST_OWNER_MESSAGE)
                                  : setDialog({ type: 'remove', member })
                              }
                            />
                          </div>
                        ) : (
                          <span
                            className="text-xs text-gray-400"
                            title={
                              isSelf
                                ? "You can't change your own access"
                                : 'Only an Owner can change an Owner'
                            }
                          >
                            {isSelf ? 'Your account' : '—'}
                          </span>
                        )}
                      </Td>
                    )}
                  </Tr>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>

      {canManage && (
        <>
          <PromoteDialog
            open={dialog?.type === 'promote'}
            onClose={closeDialog}
            roles={assignableRoles}
            onDone={refresh}
          />
          <CreateDialog
            open={dialog?.type === 'create'}
            onClose={closeDialog}
            roles={assignableRoles}
            onDone={refresh}
          />
          <ChangeRoleDialog
            member={dialog?.type === 'role' ? dialog.member : null}
            onClose={closeDialog}
            roles={assignableRoles}
            onDone={refresh}
          />
          <ResetPasswordDialog
            member={dialog?.type === 'password' ? dialog.member : null}
            onClose={closeDialog}
            onDone={refresh}
          />
          <ConfirmDialog
            action={
              ['suspend', 'reactivate', 'remove'].includes(dialog?.type)
                ? dialog.type
                : null
            }
            member={dialog?.member || null}
            onClose={closeDialog}
            onDone={refresh}
          />
        </>
      )}
    </AdminPage>
  );
};

export default StaffPage;
