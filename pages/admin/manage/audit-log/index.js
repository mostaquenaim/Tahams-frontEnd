import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FiActivity,
  FiChevronDown,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AUDIT_LOGS_KEY,
  useAuditLogs,
  useRoles,
  useStaffList,
} from '../../../../Hooks/useStaffAdmin';
import { useAdminAccess } from '../../../../Contexts/AdminAccessContext';
import { P, permissionLabel } from '../../../../utils/adminAccess';
import {
  AdminPage,
  Alert,
  Badge,
  Button,
  IconButton,
  Input,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  SkeletonRows,
  Table,
  TableCard,
  TableEmpty,
  TBody,
  Td,
  Th,
  THead,
  Tr,
  cx,
  getErrorMessage,
} from '../../../../components/Admin';

// Every write a staff member makes (successful or refused), newest first.
// Needs audit:view (Owner). Rows older than 180 days are purged by the
// backend.

const PAGE_SIZE = 25;
const DHAKA_OFFSET = '+06:00';

const NAMED_ACTIONS = {
  'staff.promote': 'Added staff (existing account)',
  'staff.create': 'Created staff account',
  'staff.update': 'Changed staff access',
  'staff.remove': 'Removed staff access',
  'staff.password_reset': 'Reset staff password',
  'role.create': 'Created role',
  'role.update': 'Edited role',
  'role.delete': 'Deleted role',
};

const ENTITY_OPTIONS = [
  { value: '', label: 'Anything' },
  { value: 'user', label: 'Staff members' },
  { value: 'role', label: 'Roles' },
];

const METHOD_TONES = {
  POST: 'success',
  PUT: 'info',
  PATCH: 'info',
  DELETE: 'danger',
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: '—', time: '' };
  return {
    day: date.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
};

// '/api/admin/order-note/:historyId' -> 'order-note/:historyId'
const shortRoute = (route) => String(route || '').replace(/^\/?api\/admin\/?/, '');

const describe = (row) => NAMED_ACTIONS[row.action] || null;

const isFromTo = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) && ('from' in v || 'to' in v);
const isAddedRemoved = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) && ('added' in v || 'removed' in v);

const fmt = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const KEY_LABELS = {
  active: 'Active',
  role: 'Role',
  name: 'Name',
  description: 'Description',
  permissions: 'Permissions',
  email: 'Email',
  sessionsRevoked: 'Signed out everywhere',
};

function PermissionChips({ items, tone }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((p) => (
        <Badge key={p} tone={tone} className="font-normal">
          {tone === 'success' ? '+' : tone === 'danger' ? '−' : ''}
          {permissionLabel(p)}
        </Badge>
      ))}
    </div>
  );
}

// Readable before/after for the named staff/role actions; anything else
// falls back to raw JSON below.
function ChangeSummary({ changes }) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    return null;
  }
  const entries = Object.entries(changes);
  if (!entries.length) {
    return <p className="text-sm text-gray-500">Nothing changed.</p>;
  }
  return (
    <dl className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <dt className="text-xs font-medium text-gray-500">
            {KEY_LABELS[key] || key}
          </dt>
          <dd className="min-w-0 text-sm text-gray-900">
            {isAddedRemoved(value) ? (
              <div className="space-y-1">
                <PermissionChips items={value.added} tone="success" />
                <PermissionChips items={value.removed} tone="danger" />
                {!value.added?.length && !value.removed?.length && '—'}
              </div>
            ) : isFromTo(value) ? (
              <span>
                {'from' in value && (
                  <>
                    <span className="text-gray-500 line-through decoration-gray-300">
                      {fmt(value.from)}
                    </span>
                    <span className="mx-1.5 text-gray-400">→</span>
                  </>
                )}
                <span className="font-medium">{fmt(value.to)}</span>
              </span>
            ) : key === 'permissions' && Array.isArray(value) ? (
              <PermissionChips items={value} tone="neutral" />
            ) : (
              <span className="break-words">{fmt(value)}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function JsonBlock({ label, value }) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && !Object.keys(value).length) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-3 text-xs leading-relaxed text-gray-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function RowDetails({ row }) {
  return (
    <div className="space-y-4 bg-gray-50/70 px-4 py-4 sm:px-6">
      {row.error && (
        <Alert tone="danger" title={`Refused (${row.statusCode || 'error'})`}>
          {row.error}
        </Alert>
      )}
      {row.changes && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Changes
          </p>
          <ChangeSummary changes={row.changes} />
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonBlock label="Request body (secrets redacted)" value={row.body} />
        <JsonBlock label="Route parameters" value={row.params} />
      </div>
      <dl className="grid gap-x-6 gap-y-1 text-xs text-gray-500 sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="shrink-0">Request</dt>
          <dd className="min-w-0 break-all font-mono text-gray-700">
            {row.method} {row.route}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">IP</dt>
          <dd className="font-mono text-gray-700">{row.ip || '—'}</dd>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <dt className="shrink-0">Browser</dt>
          <dd className="min-w-0 break-words text-gray-700">{row.userAgent || '—'}</dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const AuditLogPage = () => {
  const queryClient = useQueryClient();
  const { can } = useAdminAccess();

  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [actorId, setActorId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expanded, setExpanded] = useState(null);

  // The actor filter lists staff; needs staff:view (Owners have it).
  const staffQuery = useStaffList({ enabled: can(P.STAFF_VIEW) });
  const staff = Array.isArray(staffQuery.data) ? staffQuery.data : [];
  // to show "Manager" rather than "role #2" on role edits
  const rolesQuery = useRoles({ enabled: can(P.STAFF_VIEW) || can(P.ROLES_MANAGE) });
  const roleNames = useMemo(
    () =>
      new Map(
        (Array.isArray(rolesQuery.data) ? rolesQuery.data : []).map((r) => [
          String(r.id),
          r.name,
        ]),
      ),
    [rolesQuery.data],
  );

  // search as you type, but one request per pause rather than per key
  const [debouncedAction, setDebouncedAction] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedAction(action.trim()), 350);
    return () => clearTimeout(id);
  }, [action]);

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      action: debouncedAction || undefined,
      entity: entity || undefined,
      actorId: actorId || undefined,
      // whole days in Bangladesh time
      from: fromDate ? `${fromDate}T00:00:00${DHAKA_OFFSET}` : undefined,
      to: toDate ? `${toDate}T23:59:59.999${DHAKA_OFFSET}` : undefined,
    }),
    [page, debouncedAction, entity, actorId, fromDate, toDate],
  );

  const { data, error, isPending, isFetching } = useAuditLogs(filters);
  const rows = Array.isArray(data?.data) ? data.data : [];

  // any filter change starts again from page 1
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
    setExpanded(null);
  };

  const hasFilters = action || entity || actorId || fromDate || toDate;
  const clearFilters = () => {
    setAction('');
    setEntity('');
    setActorId('');
    setFromDate('');
    setToDate('');
    setPage(1);
    setExpanded(null);
  };

  return (
    <AdminPage title="Audit log">
      <PageHeader
        title="Audit log"
        description="Every change made in the admin panel: who, what and when, including attempts that were refused. Kept for 180 days."
        actions={
          <IconButton
            label="Refresh"
            icon={isFetching ? <FiRefreshCw className="animate-spin" /> : <FiRefreshCw />}
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_KEY })
            }
          />
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {getErrorMessage(error, 'Could not load the audit log.')}
        </Alert>
      )}

      <TableCard
        toolbar={
          <>
            <SearchInput
              value={action}
              onValueChange={withReset(setAction)}
              placeholder="Search actions, e.g. staff. or order-note"
            />
            <Select
              value={entity}
              onValueChange={withReset(setEntity)}
              width="w-full sm:w-40"
              aria-label="What changed"
            >
              {ENTITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            {staff.length > 0 && (
              <Select
                value={actorId}
                onValueChange={withReset(setActorId)}
                width="w-full sm:w-52"
                aria-label="Done by"
              >
                <option value="">Anyone</option>
                {staff.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name ? `${m.name} (${m.email})` : m.email}
                  </option>
                ))}
              </Select>
            )}
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => withReset(setFromDate)(e.target.value)}
                aria-label="From date"
                className="w-full min-w-0 flex-1 sm:w-40 sm:flex-none"
              />
              <span className="text-sm text-gray-400">to</span>
              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => withReset(setToDate)(e.target.value)}
                aria-label="To date"
                className="w-full min-w-0 flex-1 sm:w-40 sm:flex-none"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </>
        }
        footer={
          <Pagination
            page={data?.page || page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total || 0}
            pageSize={PAGE_SIZE}
            onPageChange={(next) => {
              setPage(next);
              setExpanded(null);
            }}
            itemLabel="entries"
          />
        }
      >
        <Table>
          <THead>
            <Th className="w-8">
              <span className="sr-only">Details</span>
            </Th>
            <Th>When</Th>
            <Th>Who</Th>
            <Th>What</Th>
            <Th>Result</Th>
          </THead>
          <TBody>
            {isPending ? (
              <SkeletonRows rows={8} cols={5} />
            ) : rows.length === 0 ? (
              <TableEmpty
                colSpan={5}
                icon={<FiActivity />}
                title={hasFilters ? 'Nothing matches' : 'No activity yet'}
                description={
                  hasFilters
                    ? 'Try different filters or a wider date range.'
                    : 'Changes made in the admin panel will show up here.'
                }
              />
            ) : (
              rows.map((row) => {
                const isOpen = expanded === row.id;
                const when = formatDateTime(row.createdAt);
                const named = describe(row);
                const changedName =
                  typeof row.changes?.name === 'string'
                    ? row.changes.name
                    : row.changes?.name?.to;
                const target =
                  row.changes?.email ||
                  changedName ||
                  (row.entity === 'role' && roleNames.get(String(row.entityId))) ||
                  (row.entity && row.entityId ? `${row.entity} #${row.entityId}` : null);
                return (
                  <Fragment key={row.id}>
                    <Tr
                      onClick={() => setExpanded(isOpen ? null : row.id)}
                      className={cx(isOpen && 'bg-gray-50')}
                    >
                      <Td className="text-gray-400">
                        {isOpen ? (
                          <FiChevronDown className="h-4 w-4" />
                        ) : (
                          <FiChevronRight className="h-4 w-4" />
                        )}
                      </Td>
                      <Td nowrap>
                        <p className="text-gray-900">{when.day}</p>
                        <p className="text-xs tabular-nums text-gray-500">{when.time}</p>
                      </Td>
                      <Td>
                        <p className="max-w-[16rem] truncate text-gray-900">
                          {row.actorEmail || (row.actorId ? `User #${row.actorId}` : 'Unknown')}
                        </p>
                        <p className="text-xs text-gray-500">{row.actorRole || 'Not staff'}</p>
                      </Td>
                      <Td className="min-w-[16rem]">
                        {named ? (
                          <>
                            <p className="font-medium text-gray-900">{named}</p>
                            {target && (
                              <p className="max-w-md truncate text-xs text-gray-500">{target}</p>
                            )}
                          </>
                        ) : (
                          <div className="flex min-w-0 items-center gap-2">
                            <Badge tone={METHOD_TONES[row.method] || 'neutral'}>
                              {row.method}
                            </Badge>
                            <code className="min-w-0 truncate text-xs text-gray-700">
                              {shortRoute(row.route)}
                            </code>
                          </div>
                        )}
                      </Td>
                      <Td nowrap>
                        {row.success ? (
                          <Badge tone="success" dot>
                            Done
                          </Badge>
                        ) : (
                          <Badge tone="danger" dot>
                            Refused{row.statusCode ? ` · ${row.statusCode}` : ''}
                          </Badge>
                        )}
                      </Td>
                    </Tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <RowDetails row={row} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>
    </AdminPage>
  );
};

export default AuditLogPage;
