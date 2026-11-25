// Staff permissions as the admin UI understands them.
//
// The backend (src/Rbac/permissions.ts) is the source of truth and checks
// every request on its own - nothing here grants or protects anything. This
// file only decides what the admin panel SHOWS, so staff aren't offered
// pages and buttons that would just answer "403 Forbidden".
//
// Keep the keys in step with the backend. A key the backend doesn't know is
// harmless (nobody holds it, so the page/button just stays hidden); a key
// missing here only means its page falls back to Owner-only.

export const P = Object.freeze({
  DASHBOARD_VIEW: 'dashboard:view',
  FINANCE_VIEW: 'finance:view',
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  ORDERS_VIEW: 'orders:view',
  ORDERS_UPDATE_STATUS: 'orders:update_status',
  ORDERS_EDIT: 'orders:edit',
  ORDERS_COURIER: 'orders:courier',
  ORDERS_DELETE: 'orders:delete',

  RETURNS_VIEW: 'returns:view',
  RETURNS_PROCESS: 'returns:process',
  CUSTOMIZATIONS_VIEW: 'customizations:view',
  CUSTOMIZATIONS_MANAGE: 'customizations:manage',
  CUSTOMIZATIONS_DELETE: 'customizations:delete',

  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CONTACT: 'customers:contact',

  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_PUBLISH: 'products:publish',
  PRODUCTS_DELETE: 'products:delete',
  PRICING_DISCOUNT: 'pricing:discount',
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',

  CATALOG_MANAGE: 'catalog:manage',
  CATALOG_DELETE: 'catalog:delete',

  CONTENT_MANAGE: 'content:manage',

  COUPONS_VIEW: 'coupons:view',
  COUPONS_MANAGE: 'coupons:manage',
  PAYMENTS_VIEW: 'payments:view',
  PAYMENT_METHODS_MANAGE: 'payment_methods:manage',

  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',
  ROLES_MANAGE: 'roles:manage',
  SETTINGS_MANAGE: 'settings:manage',
  SYSTEM_SYNC: 'system:sync',
  AUDIT_VIEW: 'audit:view',
});

// Plain-language names for the role editor. Unknown keys (added on the
// backend before this file caught up) fall back to the raw key.
export const PERMISSION_INFO = {
  [P.DASHBOARD_VIEW]: { label: 'View dashboard', hint: 'Order and customer counts on the dashboard.' },
  [P.FINANCE_VIEW]: { label: 'See revenue', hint: 'Sales totals and revenue figures. Without it, money figures are hidden.' },
  [P.REPORTS_VIEW]: { label: 'View reports', hint: 'Sales, inventory and customer reports.' },
  [P.REPORTS_EXPORT]: { label: 'Export reports', hint: 'Download report data.' },

  [P.ORDERS_VIEW]: { label: 'View orders', hint: 'Order list and order details, including customer contact details.' },
  [P.ORDERS_UPDATE_STATUS]: { label: 'Update order status', hint: 'Move orders through processing, shipping and delivery.' },
  [P.ORDERS_EDIT]: { label: 'Edit orders', hint: 'Mark orders as checked and write admin notes.' },
  [P.ORDERS_COURIER]: { label: 'Book couriers', hint: 'Create Pathao deliveries and add courier details.' },
  [P.ORDERS_DELETE]: { label: 'Delete orders', hint: 'Permanently remove orders.' },

  [P.RETURNS_VIEW]: { label: 'View cancel/return requests' },
  [P.RETURNS_PROCESS]: { label: 'Approve cancel/return requests' },
  [P.CUSTOMIZATIONS_VIEW]: { label: 'View customization requests' },
  [P.CUSTOMIZATIONS_MANAGE]: { label: 'Handle customization requests', hint: 'Update request status and prices.' },
  [P.CUSTOMIZATIONS_DELETE]: { label: 'Delete customization requests' },

  [P.CUSTOMERS_VIEW]: { label: 'View customers', hint: 'Customer list and their carts.' },
  [P.CUSTOMERS_CONTACT]: { label: 'Message customers' },

  [P.PRODUCTS_CREATE]: { label: 'Add products' },
  [P.PRODUCTS_EDIT]: { label: 'Edit products' },
  [P.PRODUCTS_PUBLISH]: { label: 'Publish products' },
  [P.PRODUCTS_DELETE]: { label: 'Delete products' },
  [P.PRICING_DISCOUNT]: { label: 'Set discounts', hint: 'Bulk discount updates by product type.' },
  [P.INVENTORY_VIEW]: { label: 'View stock' },
  [P.INVENTORY_UPDATE]: { label: 'Update stock' },

  [P.CATALOG_MANAGE]: { label: 'Manage catalog', hint: 'Series, categories, product types, sizes, colors, fabrics and navbar order.' },
  [P.CATALOG_DELETE]: { label: 'Delete catalog items', hint: 'Delete series, categories, product types and sizes.' },

  [P.CONTENT_MANAGE]: { label: 'Manage storefront content', hint: 'Banners, pop-ups, home sections and new arrivals.' },

  [P.COUPONS_VIEW]: { label: 'View coupons' },
  [P.COUPONS_MANAGE]: { label: 'Manage coupons' },
  [P.PAYMENTS_VIEW]: { label: 'View payments' },
  [P.PAYMENT_METHODS_MANAGE]: { label: 'Manage payment methods' },

  [P.STAFF_VIEW]: { label: 'View staff', hint: 'See who is staff and which roles exist.' },
  [P.STAFF_MANAGE]: { label: 'Manage staff', hint: 'Owner only.' },
  [P.ROLES_MANAGE]: { label: 'Manage roles', hint: 'Owner only.' },
  [P.SETTINGS_MANAGE]: { label: 'Manage settings' },
  [P.SYSTEM_SYNC]: { label: 'Run maintenance syncs', hint: 'Recount sales and views.' },
  [P.AUDIT_VIEW]: { label: 'View audit log' },
};

export const permissionLabel = (key) => PERMISSION_INFO[key]?.label || key;

// Never grantable to a non-Owner role (holding them lets you grant yourself
// everything else). The backend refuses them; the editor shows them locked.
export const OWNER_ONLY_PERMISSIONS = [P.STAFF_MANAGE, P.ROLES_MANAGE];

// Display grouping, used when the backend's catalog (GET /admin/permissions,
// Owner only) isn't available - e.g. a Manager viewing roles read-only.
export const PERMISSION_GROUPS = [
  { label: 'Overview', permissions: [P.DASHBOARD_VIEW, P.FINANCE_VIEW, P.REPORTS_VIEW, P.REPORTS_EXPORT] },
  { label: 'Orders', permissions: [P.ORDERS_VIEW, P.ORDERS_UPDATE_STATUS, P.ORDERS_EDIT, P.ORDERS_COURIER, P.ORDERS_DELETE] },
  { label: 'Returns & customizations', permissions: [P.RETURNS_VIEW, P.RETURNS_PROCESS, P.CUSTOMIZATIONS_VIEW, P.CUSTOMIZATIONS_MANAGE, P.CUSTOMIZATIONS_DELETE] },
  { label: 'Customers', permissions: [P.CUSTOMERS_VIEW, P.CUSTOMERS_CONTACT] },
  { label: 'Products & inventory', permissions: [P.PRODUCTS_CREATE, P.PRODUCTS_EDIT, P.PRODUCTS_PUBLISH, P.PRODUCTS_DELETE, P.PRICING_DISCOUNT, P.INVENTORY_VIEW, P.INVENTORY_UPDATE] },
  { label: 'Catalog', permissions: [P.CATALOG_MANAGE, P.CATALOG_DELETE] },
  { label: 'Content', permissions: [P.CONTENT_MANAGE] },
  { label: 'Promotions & payments', permissions: [P.COUPONS_VIEW, P.COUPONS_MANAGE, P.PAYMENTS_VIEW, P.PAYMENT_METHODS_MANAGE] },
  { label: 'People & system', permissions: [P.STAFF_VIEW, P.STAFF_MANAGE, P.ROLES_MANAGE, P.SETTINGS_MANAGE, P.SYSTEM_SYNC, P.AUDIT_VIEW] },
];

// ---- checks ---------------------------------------------------------------

// `access` is the /admin/me response: { isStaff, isOwner, permissions, ... }
export const hasPermission = (access, permission) =>
  !!access?.isStaff &&
  (access.isOwner === true ||
    (Array.isArray(access.permissions) && access.permissions.includes(permission)));

// A rule is one of:
//   null            - any active staff member
//   { all: [...] }  - every listed permission
//   { any: [...] }  - at least one of them
//   { owner: true } - Owners only
export const meetsRule = (access, rule) => {
  if (!access?.isStaff) return false;
  if (access.isOwner) return true;
  if (rule === null) return true;
  if (!rule || rule.owner) return false;
  if (rule.all) return rule.all.every((p) => hasPermission(access, p));
  if (rule.any) return rule.any.some((p) => hasPermission(access, p));
  return false;
};

const all = (...permissions) => ({ all: permissions });
const any = (...permissions) => ({ any: permissions });

// What it takes to open each admin page, keyed by Next.js route pathname
// (router.pathname - dynamic segments stay as [id]). Every rule mirrors the
// permission the backend demands for the data the page loads, so a page
// that opens can also load.
//
// A pathname that isn't listed is Owner-only (deny by default): a new page
// stays hidden from staff until someone decides who should see it.
export const PAGE_RULES = {
  // Landing page: every staff member may land here after login. It shows
  // the stats only with dashboard:view, and a list of their sections
  // otherwise.
  '/admin': null,
  '/admin/show/dashboard': null, // redirects to /admin
  '/admin/auth/sign-in': null, // redirects to /login

  // Overview
  '/admin/show/show-views': all(P.SYSTEM_SYNC),
  '/admin/sync/sync-sales-count': all(P.SYSTEM_SYNC),
  '/admin/reports/sales': all(P.REPORTS_VIEW, P.FINANCE_VIEW),
  '/admin/reports/inventory': all(P.REPORTS_VIEW, P.INVENTORY_VIEW),
  '/admin/reports/customers': all(P.REPORTS_VIEW, P.CUSTOMERS_VIEW),
  '/admin/reports/tax': all(P.REPORTS_VIEW, P.FINANCE_VIEW),

  // Sales
  '/admin/show/show-orders': any(P.ORDERS_VIEW, P.CUSTOMIZATIONS_VIEW),
  '/admin/show/show-order-details/[id]': all(P.ORDERS_VIEW),
  '/admin/show/show-requests': all(P.RETURNS_VIEW),
  '/admin/show/customization-details/[id]': all(P.CUSTOMIZATIONS_VIEW),
  '/admin/show/Show-All-Carts': all(P.CUSTOMERS_VIEW),
  '/admin/add/add-pathao-order': all(P.ORDERS_COURIER),
  '/admin/promotions/create-coupon': all(P.COUPONS_MANAGE),
  '/admin/promotions/manage-coupons': all(P.COUPONS_VIEW),
  '/admin/promotions/usage-logs': all(P.COUPONS_VIEW),
  '/admin/payments/transactions': all(P.PAYMENTS_VIEW),
  '/admin/payments/refunds': all(P.PAYMENTS_VIEW),
  '/admin/payments/payouts': all(P.PAYMENTS_VIEW, P.FINANCE_VIEW),
  '/admin/add/add-payment-method': all(P.PAYMENT_METHODS_MANAGE),
  '/admin/add/add-new-arrivals': all(P.CONTENT_MANAGE),
  '/admin/edit/home-sections': all(P.CONTENT_MANAGE),
  '/admin/add/add-new-pop-up': all(P.CONTENT_MANAGE),
  '/admin/edit/update-pop-up': all(P.CONTENT_MANAGE),
  '/admin/edit/update-discount': all(P.PRICING_DISCOUNT),

  // Catalog
  '/admin/add/add-product': all(P.PRODUCTS_CREATE),
  '/admin/publish-product': any(P.PRODUCTS_PUBLISH, P.PRODUCTS_DELETE),
  '/admin/all-products': any(
    P.PRODUCTS_EDIT,
    P.PRODUCTS_DELETE,
    P.INVENTORY_VIEW,
    P.INVENTORY_UPDATE,
  ),
  '/admin/edit/product/[id]': all(P.PRODUCTS_EDIT),
  '/admin/add/add-series': all(P.CATALOG_MANAGE),
  '/admin/show/show-all-series': all(P.CATALOG_MANAGE),
  '/admin/add/add-category': all(P.CATALOG_MANAGE),
  '/admin/show/show-all-categories': all(P.CATALOG_MANAGE),
  '/admin/add/add-product-type': all(P.CATALOG_MANAGE),
  '/admin/show/product-type': all(P.CATALOG_MANAGE),
  '/admin/edit/edit-product-type': all(P.CATALOG_MANAGE),
  '/admin/add/add-color': all(P.CATALOG_MANAGE),
  '/admin/add/add-size': all(P.CATALOG_MANAGE),
  '/admin/add/add-fabric': all(P.CATALOG_MANAGE),
  '/admin/settings/rearrange-navbar': all(P.CATALOG_MANAGE),

  // Operations
  '/admin/inventory/stock-status': all(P.INVENTORY_VIEW),
  '/admin/inventory/low-stock': all(P.INVENTORY_VIEW),
  '/admin/inventory/warehouse': all(P.INVENTORY_UPDATE),

  // People
  '/admin/show/show-users': all(P.CUSTOMERS_VIEW),
  '/admin/show/user-details': all(P.CUSTOMERS_VIEW),
  '/admin/analytics/user-insights': all(P.CUSTOMERS_VIEW, P.REPORTS_VIEW),
  '/admin/manage/staff': all(P.STAFF_VIEW),
  '/admin/manage/roles': any(P.ROLES_MANAGE, P.STAFF_VIEW),

  // System
  '/admin/manage/audit-log': all(P.AUDIT_VIEW),
};

// Some hrefs open a specific view of a page through the query string.
const QUERY_RULES = {
  '/admin/show/show-orders?tab=custom': all(P.CUSTOMIZATIONS_VIEW),
};

const OWNER_ONLY = { owner: true };

export const ruleForPath = (pathname) =>
  Object.prototype.hasOwnProperty.call(PAGE_RULES, pathname)
    ? PAGE_RULES[pathname]
    : OWNER_ONLY;

export const canOpenPath = (access, pathname) =>
  meetsRule(access, ruleForPath(pathname));

// For sidebar links and buttons: an href may carry a query string.
export const canOpenHref = (access, href) => {
  if (Object.prototype.hasOwnProperty.call(QUERY_RULES, href)) {
    return meetsRule(access, QUERY_RULES[href]);
  }
  const path = href.split('?')[0].split('#')[0];
  if (path === '/admin/show/show-orders') {
    // the plain orders link opens the orders tab
    return meetsRule(access, all(P.ORDERS_VIEW));
  }
  return canOpenPath(access, path);
};
