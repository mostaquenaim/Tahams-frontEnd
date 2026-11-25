import { createContext, useContext, useMemo } from 'react';
import { canOpenHref, hasPermission } from '../utils/adminAccess';

// The signed-in staff member's access, as reported by GET /admin/me:
//   { id, email, name, isStaff, isOwner, role: { id, key, name }, permissions }
// Provided by AdminCheck around every /admin page. Outside the admin area
// (or before it has loaded) it is null and every check answers "no".
//
// This only decides what the UI offers - the backend re-checks every
// request against the database, so hiding is never the protection.
export const AdminAccessContext = createContext(null);

export const ADMIN_ACCESS_KEY = 'adminAccess';

export const useAdminAccess = () => {
  const access = useContext(AdminAccessContext);

  return useMemo(
    () => ({
      access,
      isStaff: !!access?.isStaff,
      isOwner: !!access?.isStaff && access?.isOwner === true,
      role: access?.role || null,
      can: (permission) => hasPermission(access, permission),
      canAll: (...permissions) =>
        permissions.every((p) => hasPermission(access, p)),
      canAny: (...permissions) =>
        permissions.some((p) => hasPermission(access, p)),
      canOpen: (href) => canOpenHref(access, href),
    }),
    [access],
  );
};
