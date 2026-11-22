import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FiCheck,
  FiLock,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import {
  invalidateStaffAdmin,
  usePermissionCatalog,
  useRoles,
} from '../../../../Hooks/useStaffAdmin';
import { useAdminAccess } from '../../../../Contexts/AdminAccessContext';
import {
  OWNER_ONLY_PERMISSIONS,
  P,
  PERMISSION_GROUPS,
  PERMISSION_INFO,
  permissionLabel,
} from '../../../../utils/adminAccess';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Section,
  Spinner,
  Textarea,
  cx,
  getErrorMessage,
} from '../../../../components/Admin';

// Roles are named bundles of permissions. Viewing needs roles:manage or
// staff:view (Managers see them read-only); any change needs roles:manage,
// which only the Owner role has. The backend enforces the rules - Owner
// role locked, built-ins can't be renamed or deleted, owner-only
// permissions can't be granted, a role in use can't be deleted.

const NAME_MIN = 2;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 300;
const NEW = 'new';

const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

function RoleListItem({ role, selected, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className={cx(
          'flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20',
          selected ? 'bg-gray-900 text-white' : 'hover:bg-gray-50',
        )}
      >
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            {role.locked && <FiLock className="h-3.5 w-3.5 shrink-0 opacity-70" />}
            <span className="truncate">{role.name}</span>
          </span>
          <span
            className={cx(
              'mt-0.5 block text-xs',
              selected ? 'text-gray-300' : 'text-gray-500',
            )}
          >
            {role.isOwner
              ? 'Full access'
              : `${role.permissions.length} permission${role.permissions.length === 1 ? '' : 's'}`}
            {' · '}
            {role.isSystem ? 'Built-in' : 'Custom'}
          </span>
        </span>
        <span
          className={cx(
            'mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs tabular-nums',
            selected ? 'text-gray-300' : 'text-gray-500',
          )}
          title={`${role.memberCount} staff member${role.memberCount === 1 ? '' : 's'}`}
        >
          <FiUsers className="h-3.5 w-3.5" />
          {role.memberCount}
        </span>
      </button>
    </li>
  );
}

function PermissionGroup({ group, selected, editable, ownerOnly, onToggle, onToggleGroup }) {
  const grantable = group.permissions.filter((p) => !ownerOnly.has(p));
  const checkedCount = grantable.filter((p) => selected.has(p)).length;
  const allChecked = grantable.length > 0 && checkedCount === grantable.length;

  return (
    <fieldset className="rounded-lg border border-gray-200">
      <legend className="sr-only">{group.label}</legend>
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
        <p className="text-sm font-semibold text-gray-900">{group.label}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-gray-500">
            {checkedCount}/{grantable.length}
          </span>
          {editable && grantable.length > 0 && (
            <button
              type="button"
              onClick={() => onToggleGroup(grantable, !allChecked)}
              className="text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              {allChecked ? 'Clear' : 'Select all'}
            </button>
          )}
        </div>
      </div>
      <ul className="divide-y divide-gray-100">
        {group.permissions.map((permission) => {
          const locked = ownerOnly.has(permission);
          const checked = !locked && selected.has(permission);
          const info = PERMISSION_INFO[permission];
          const id = `perm-${permission}`;
          return (
            <li key={permission}>
              <label
                htmlFor={id}
                className={cx(
                  'flex items-start gap-3 px-4 py-2.5',
                  editable && !locked ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default',
                )}
              >
                <span className="pt-0.5">
                  {editable && !locked ? (
                    <Checkbox
                      id={id}
                      checked={checked}
                      onChange={() => onToggle(permission)}
                    />
                  ) : (
                    <span
                      className={cx(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        checked
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-gray-50',
                      )}
                    >
                      {checked && <FiCheck className="h-3 w-3" />}
                      {locked && <FiLock className="h-2.5 w-2.5 text-gray-400" />}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cx(
                      'block text-sm',
                      locked ? 'text-gray-400' : 'text-gray-900',
                    )}
                  >
                    {permissionLabel(permission)}
                    {locked && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        Owner only
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {info?.hint && !locked ? `${info.hint} ` : ''}
                    <code className="text-[11px] text-gray-400">{permission}</code>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function DeleteRoleDialog({ role, onClose, onDeleted }) {
  const axiosSecure = useAxiosSecure();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => {
    if (saving) return;
    setError('');
    onClose();
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await axiosSecure.delete(`/admin/roles/${role.id}`);
      toast.success(`Role "${role.name}" deleted`);
      await onDeleted();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this role.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!role}
      onClose={close}
      title="Delete role"
      icon={<FiTrash2 />}
      tone="danger"
      footer={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button variant="danger" loading={saving} onClick={submit}>
            Delete role
          </Button>
        </>
      }
    >
      {role && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Delete the role <span className="font-medium text-gray-900">{role.name}</span>?
            This can&apos;t be undone.
          </p>
          <Alert tone="danger">{error}</Alert>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */

const RolesPage = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { can } = useAdminAccess();
  const canManage = can(P.ROLES_MANAGE);

  const rolesQuery = useRoles();
  const catalogQuery = usePermissionCatalog({ enabled: canManage });
  const roles = useMemo(
    () => (Array.isArray(rolesQuery.data) ? rolesQuery.data : []),
    [rolesQuery.data],
  );

  // The backend's catalog wins when we have it (it's what the server will
  // accept); otherwise the local copy.
  const groups = catalogQuery.data?.groups?.length
    ? catalogQuery.data.groups
    : PERMISSION_GROUPS;
  const ownerOnly = useMemo(
    () => new Set(catalogQuery.data?.ownerOnly || OWNER_ONLY_PERMISSIONS),
    [catalogQuery.data],
  );

  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null); // { name, description, permissions: Set }
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const isNew = selectedId === NEW;
  const role = isNew ? null : roles.find((r) => r.id === selectedId) || null;

  // Pick the first role once loaded, and recover if the selected one vanishes.
  useEffect(() => {
    if (!roles.length) return;
    if (selectedId === null || (!isNew && !roles.some((r) => r.id === selectedId))) {
      setSelectedId(roles[0].id);
    }
  }, [roles, selectedId, isNew]);

  // Reset the editor whenever the selected role (or its saved data) changes.
  useEffect(() => {
    setError('');
    if (isNew) return; // the draft was set when "New role" was clicked
    if (!role) return setDraft(null);
    setDraft({
      name: role.name,
      description: role.description || '',
      permissions: new Set(role.permissions),
    });
  }, [role, isNew]);

  const original = useMemo(
    () =>
      role
        ? {
            name: role.name,
            description: role.description || '',
            permissions: new Set(role.permissions),
          }
        : { name: '', description: '', permissions: new Set() },
    [role],
  );

  const editable = canManage && (isNew || (role && !role.locked));
  const nameEditable = editable && (isNew || !role?.isSystem);

  const added = draft ? [...draft.permissions].filter((p) => !original.permissions.has(p)) : [];
  const removed = draft ? [...original.permissions].filter((p) => !draft.permissions.has(p)) : [];
  const dirty =
    !!draft &&
    (isNew ||
      draft.name.trim() !== original.name ||
      draft.description.trim() !== original.description ||
      !sameSet(draft.permissions, original.permissions));

  const confirmDiscard = () =>
    !dirty || window.confirm('Discard your unsaved changes to this role?');

  const select = (id) => {
    if (id === selectedId || !confirmDiscard()) return;
    setSelectedId(id);
  };

  const startNew = () => {
    if (!confirmDiscard()) return;
    setSelectedId(NEW);
    setDraft({ name: '', description: '', permissions: new Set() });
    setError('');
  };

  const toggle = (permission) =>
    setDraft((prev) => {
      const next = new Set(prev.permissions);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return { ...prev, permissions: next };
    });

  const toggleGroup = (permissions, on) =>
    setDraft((prev) => {
      const next = new Set(prev.permissions);
      permissions.forEach((p) => (on ? next.add(p) : next.delete(p)));
      return { ...prev, permissions: next };
    });

  const discard = () => {
    if (isNew) {
      setSelectedId(roles[0]?.id ?? null);
      setDraft(null);
    } else {
      setDraft({
        name: original.name,
        description: original.description,
        permissions: new Set(original.permissions),
      });
    }
    setError('');
  };

  const save = async () => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    if (nameEditable && (name.length < NAME_MIN || name.length > NAME_MAX)) {
      return setError(`Role name must be ${NAME_MIN}-${NAME_MAX} characters.`);
    }
    if (description.length > DESCRIPTION_MAX) {
      return setError(`Description can't be longer than ${DESCRIPTION_MAX} characters.`);
    }
    const permissions = [...draft.permissions].filter((p) => !ownerOnly.has(p));

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const res = await axiosSecure.post('/admin/roles', {
          name,
          description,
          permissions,
        });
        toast.success(`Role "${res.data?.name || name}" created`);
        await invalidateStaffAdmin(queryClient);
        setSelectedId(res.data?.id ?? null);
      } else {
        // Send only what changed: built-in roles refuse a name in the body
        // only if it differs, but there's no reason to send it at all.
        const body = {};
        if (nameEditable && name !== original.name) body.name = name;
        if (description !== original.description) body.description = description;
        if (!sameSet(draft.permissions, original.permissions)) body.permissions = permissions;
        await axiosSecure.patch(`/admin/roles/${role.id}`, body);
        toast.success(`Role "${name || role.name}" saved`);
        await invalidateStaffAdmin(queryClient);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this role.'));
    } finally {
      setSaving(false);
    }
  };

  const loadError = rolesQuery.error;

  return (
    <AdminPage title="Roles & permissions">
      <PageHeader
        title="Roles & permissions"
        description={
          canManage
            ? 'Decide what each role can see and do. Changes apply to everyone with that role on their next click.'
            : 'What each role can see and do. Only an Owner can change roles.'
        }
        actions={
          <>
            <IconButton
              label="Refresh"
              icon={<FiRefreshCw />}
              onClick={() => invalidateStaffAdmin(queryClient)}
            />
            {canManage && (
              <Button variant="primary" icon={<FiPlus />} onClick={startNew}>
                New role
              </Button>
            )}
          </>
        }
      />

      {loadError && (
        <Alert tone="danger" className="mb-4">
          {getErrorMessage(loadError, 'Could not load roles.')}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Section title="Roles" icon={<FiShield />} bodyClassName="p-2">
          {rolesQuery.isPending ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="h-5 w-5 text-gray-300" />
            </div>
          ) : (
            <ul className="space-y-0.5">
              {roles.map((r) => (
                <RoleListItem
                  key={r.id}
                  role={r}
                  selected={r.id === selectedId}
                  onSelect={() => select(r.id)}
                />
              ))}
              {isNew && (
                <li>
                  <div className="rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white">
                    {draft?.name.trim() || 'New role'}
                    <span className="mt-0.5 block text-xs font-normal text-gray-300">
                      Not saved yet
                    </span>
                  </div>
                </li>
              )}
            </ul>
          )}
        </Section>

        <div className="min-w-0">
          {!draft ? (
            <Section bodyClassName="p-0">
              <EmptyState
                icon={<FiShield />}
                title={rolesQuery.isPending ? 'Loading roles…' : 'Pick a role'}
              />
            </Section>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="space-y-4 border-b border-gray-200 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isNew ? 'New role' : role?.name}
                  </h2>
                  {role?.isOwner && (
                    <Badge tone="warning">
                      <FiLock className="h-3 w-3" />
                      Locked
                    </Badge>
                  )}
                  {role && !role.isOwner && (
                    <Badge>{role.isSystem ? 'Built-in' : 'Custom'}</Badge>
                  )}
                  {role && (
                    <Badge tone="info">
                      <FiUsers className="h-3 w-3" />
                      {role.memberCount} member{role.memberCount === 1 ? '' : 's'}
                    </Badge>
                  )}
                </div>

                {editable ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Name"
                      htmlFor="role-name"
                      required={nameEditable}
                      hint={!nameEditable ? "Built-in roles can't be renamed." : undefined}
                    >
                      <Input
                        id="role-name"
                        value={draft.name}
                        disabled={!nameEditable}
                        maxLength={NAME_MAX}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="Description" htmlFor="role-description" optional>
                      <Textarea
                        id="role-description"
                        rows={2}
                        maxLength={DESCRIPTION_MAX}
                        value={draft.description}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {role?.description || 'No description.'}
                  </p>
                )}

                {role?.isOwner && (
                  <Alert tone="info">
                    Owners have every permission, including managing staff and
                    roles. This role can&apos;t be changed.
                  </Alert>
                )}
                {editable && !isNew && role?.memberCount > 0 && (
                  <Alert tone="warning">
                    {role.memberCount} staff member{role.memberCount === 1 ? '' : 's'}{' '}
                    {role.memberCount === 1 ? 'has' : 'have'} this role. Saved
                    changes apply to them right away.
                  </Alert>
                )}
              </div>

              {!role?.isOwner && (
                <div className="grid gap-4 p-5 xl:grid-cols-2">
                  {groups.map((group) => (
                    <PermissionGroup
                      key={group.label}
                      group={group}
                      selected={draft.permissions}
                      editable={editable}
                      ownerOnly={ownerOnly}
                      onToggle={toggle}
                      onToggleGroup={toggleGroup}
                    />
                  ))}
                </div>
              )}

              {editable && (
                <div className="sticky bottom-0 flex flex-col gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 text-sm">
                    {error ? (
                      <Alert tone="danger">{error}</Alert>
                    ) : dirty && !isNew ? (
                      <span className="text-gray-600">
                        Unsaved changes
                        {added.length > 0 && (
                          <span className="ml-2 text-emerald-700">+{added.length} added</span>
                        )}
                        {removed.length > 0 && (
                          <span className="ml-2 text-red-600">−{removed.length} removed</span>
                        )}
                      </span>
                    ) : isNew ? (
                      <span className="text-gray-600">
                        {draft.permissions.size} permission
                        {draft.permissions.size === 1 ? '' : 's'} selected
                      </span>
                    ) : (
                      <span className="text-gray-400">No changes</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {role && !role.isSystem && (
                      <Button
                        variant="ghost-danger"
                        icon={<FiTrash2 />}
                        disabled={saving || role.memberCount > 0}
                        title={
                          role.memberCount > 0
                            ? 'Reassign its staff members before deleting this role'
                            : undefined
                        }
                        onClick={() => setDeleting(role)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button onClick={discard} disabled={saving || (!dirty && !isNew)}>
                      {isNew ? 'Cancel' : 'Discard'}
                    </Button>
                    <Button
                      variant="primary"
                      loading={saving}
                      disabled={!dirty}
                      onClick={save}
                    >
                      {isNew ? 'Create role' : 'Save changes'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteRoleDialog
        role={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={async () => {
          setDraft(null);
          setSelectedId(null);
          await invalidateStaffAdmin(queryClient);
        }}
      />
    </AdminPage>
  );
};

export default RolesPage;
