import { keepPreviousData, useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure';

// Staff, roles, permission catalog and audit log (backend: src/Rbac/
// rbac.controller.ts). Every rule - who may change whom, which permissions
// can be granted, the last-Owner guard - is enforced there; these hooks only
// read. Writes go through axiosSecure in the pages, then invalidate the keys
// below.

export const STAFF_KEY = ['admin', 'staff'];
export const ROLES_KEY = ['admin', 'roles'];
export const PERMISSION_CATALOG_KEY = ['admin', 'permissionCatalog'];
export const AUDIT_LOGS_KEY = ['admin', 'auditLogs'];

// After any staff/role change: member counts, role names on staff rows and
// the audit log all move together.
export const invalidateStaffAdmin = (queryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
    queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
    queryClient.invalidateQueries({ queryKey: AUDIT_LOGS_KEY }),
  ]);

const noRetryOnDenied = (count, error) => {
  const status = error?.response?.status;
  return status !== 401 && status !== 403 && count < 1;
};

// GET /admin/staff - needs staff:view
export const useStaffList = ({ enabled = true } = {}) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: async () => (await axiosSecure.get('/admin/staff')).data,
    enabled,
    retry: noRetryOnDenied,
  });
};

// GET /admin/roles - needs roles:manage or staff:view
export const useRoles = ({ enabled = true } = {}) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: async () => (await axiosSecure.get('/admin/roles')).data,
    enabled,
    retry: noRetryOnDenied,
  });
};

// GET /admin/permissions - needs roles:manage (Owner). Static per deploy.
export const usePermissionCatalog = ({ enabled = true } = {}) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: PERMISSION_CATALOG_KEY,
    queryFn: async () => (await axiosSecure.get('/admin/permissions')).data,
    enabled,
    staleTime: Infinity,
    retry: noRetryOnDenied,
  });
};

// GET /admin/audit-logs - needs audit:view (Owner)
export const useAuditLogs = (filters, { enabled = true } = {}) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: [...AUDIT_LOGS_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
      return (await axiosSecure.get(`/admin/audit-logs?${params}`)).data;
    },
    enabled,
    placeholderData: keepPreviousData,
    retry: noRetryOnDenied,
  });
};
