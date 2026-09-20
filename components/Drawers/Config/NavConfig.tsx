import {
  FiPieChart,
  FiBox,
  FiTag,
  FiBarChart2,
  FiCreditCard,
  FiShield,
  FiUsers,
  FiLayers,
  FiFileText,
  FiGift,
  FiGrid,
  FiSettings,
  FiList, // New icon for Series
  FiType, // New icon for Product Types
  FiFolder, // New icon for Categories
} from 'react-icons/fi';

// Sidebar section headings, in display order. Each NAV_CONFIG entry names
// one of these in `Group`.
export const NAV_GROUPS = [
  'Overview',
  'Sales',
  'Catalog',
  'Operations',
  'People',
  'System',
];

export const NAV_CONFIG = [
  {
    Name: 'Dashboard',
    Group: 'Overview',
    Icon: <FiPieChart />,
    Tasks: [
      { href: '/admin/show/show-views', label: 'Statistics / Views' },
      { href: '/admin/sync/sync-sales-count', label: 'Sync Sales Count' },
    ],
  },
  {
    Name: 'Inventory',
    Group: 'Operations',
    Icon: <FiBox />,
    Tasks: [
      { href: '/admin/inventory/stock-status', label: 'Stock Status' },
      { href: '/admin/inventory/low-stock', label: 'Low Stock Alerts' },
      { href: '/admin/inventory/warehouse', label: 'Warehouse Management' },
    ],
  },
  {
    Name: 'Coupons',
    Group: 'Sales',
    Icon: <FiTag />,
    Tasks: [
      { href: '/admin/promotions/create-coupon', label: 'Create Coupon' },
      { href: '/admin/promotions/manage-coupons', label: 'Manage Coupons' },
      { href: '/admin/promotions/usage-logs', label: 'Coupon Usage Logs' },
    ],
  },
  {
    Name: 'Reports',
    Group: 'Overview',
    Icon: <FiBarChart2 />,
    Tasks: [
      { href: '/admin/reports/sales', label: 'Sales Report' },
      { href: '/admin/reports/inventory', label: 'Inventory Report' },
      { href: '/admin/reports/customers', label: 'Customer Report' },
      { href: '/admin/reports/tax', label: 'Tax Report' },
    ],
  },
  {
    Name: 'Payments',
    Group: 'Sales',
    Icon: <FiCreditCard />,
    Tasks: [
      { href: '/admin/payments/transactions', label: 'All Transactions' },
      { href: '/admin/payments/refunds', label: 'Refund Requests' },
      { href: '/admin/payments/payouts', label: 'Vendor Payouts' },
    ],
  },
  {
    Name: 'Role Management',
    Group: 'People',
    Icon: <FiShield />,
    Tasks: [{ href: '/admin/manage/roles', label: 'Manage Roles' }],
  },
  {
    Name: 'User Management',
    Group: 'People',
    Icon: <FiUsers />,
    Tasks: [
      { href: '/admin/show/show-users', label: 'All Users / Customers' },
      { href: '/admin/show/user-details', label: 'View User Details' },
      { href: '/admin/analytics/user-insights', label: 'User Analytics' },
    ],
  },
  {
    Name: 'Products',
    Group: 'Catalog',
    Icon: <FiLayers />,
    Tasks: [
      { href: '/admin/add/add-product', label: 'Add Product' },
      { href: '/admin/publish-product', label: 'Unpublished Products' },
      { href: '/admin/all-products', label: 'All Products' },
    ],
  },
  // --- NEW SECTIONS START ---
  {
    Name: 'Series',
    Group: 'Catalog',
    Icon: <FiList />,
    Tasks: [
      { href: '/admin/add/add-series', label: 'Add Series' },
      { href: '/admin/show/show-all-series', label: 'Show Series' },
    ],
  },
  {
    Name: 'Categories',
    Group: 'Catalog',
    Icon: <FiFolder />,
    Tasks: [
      { href: '/admin/add/add-category', label: 'Add Category (for Series)' },
      { href: '/admin/show/show-all-categories', label: 'Show Categories' },
    ],
  },
  {
    Name: 'Product Types',
    Group: 'Catalog',
    Icon: <FiType />,
    Tasks: [
      { href: '/admin/add/add-product-type', label: 'Add Product Type' },
      { href: '/admin/show/product-type', label: 'Show / Edit Product Types' },
    ],
  },
  // --- NEW SECTIONS END ---
  {
    Name: 'Orders',
    Group: 'Sales',
    Icon: <FiFileText />,
    Tasks: [
      {
        id: 'orders', // Use this ID in your component to wrap with <Badge />
        href: '/admin/show/show-orders',
        label: 'Show Orders',
      },
      {
        id: 'custom', // Use this ID in your component to wrap with <Badge />
        href: '/admin/show/show-customization-requests',
        label: 'Customization Requests',
      },
      { href: '/admin/show/show-requests', label: 'Cancel/Return Requests' },
      { href: '/admin/show/Show-All-Carts', label: 'View Carts' },
    ],
  },
  {
    Name: 'Promotions',
    Group: 'Sales',
    Icon: <FiGift />,
    Tasks: [
      { href: '/admin/add/add-new-arrivals', label: 'New Arrivals' },
      { href: '/admin/add/add-new-pop-up', label: 'Add Pop-Up' },
      { href: '/admin/edit/update-pop-up', label: 'Update Pop-Up' },
      { href: '/admin/edit/update-discount', label: 'Update Discount' },
    ],
  },
  {
    Name: 'Attributes',
    Group: 'Catalog',
    Icon: <FiGrid />,
    Tasks: [
      { href: '/admin/add/add-color', label: 'Add Color' },
      { href: '/admin/add/add-size', label: 'Add Size' },
      { href: '/admin/add/add-fabric', label: 'Add Fabric' },
    ],
  },
  {
    Name: 'Settings',
    Group: 'System',
    Icon: <FiSettings />,
    Tasks: [
      {
        href: '/admin/settings/rearrange-navbar',
        label: 'Rearrange Navbar Items',
      },
    ],
  },
];
