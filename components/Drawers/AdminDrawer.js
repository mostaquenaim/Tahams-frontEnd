import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AiOutlineMenu, AiOutlineDashboard } from "react-icons/ai";
import { FiPackage, FiTag, FiFileText, FiCreditCard, FiUsers, FiLayers, FiSettings } from "react-icons/fi";
import { BsGraphUp, BsGift } from "react-icons/bs";
import { RiShirtLine } from "react-icons/ri";
import { MdInventory, MdLocalOffer } from "react-icons/md";
import { CountContext } from '../../Contexts/CountProvider';
import { Badge } from '@mui/material';
import useGroupOrders from '../../Hooks/useGroupOrders';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const AdminDrawer = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        Dashboard: true,
        Orders: true,
        Products: true
    });
    const router = useRouter();
    const [sortedGroupedOrdersArray] = useGroupOrders();
    const { setShowCount, showCount } = useContext(CountContext);

    const uncheckedCount = sortedGroupedOrdersArray.filter(group => !group.history.isChecked).length;
    setShowCount(uncheckedCount);

    const getSectionIcon = (sectionName) => {
        switch (sectionName) {
            case 'Dashboard': return <AiOutlineDashboard className="mr-3" />;
            case 'Inventory': return <MdInventory className="mr-3" />;
            case 'Coupons': return <FiTag className="mr-3" />;
            case 'Reports': return <BsGraphUp className="mr-3" />;
            case 'Payments': return <FiCreditCard className="mr-3" />;
            case 'Role Management': return <FiUsers className="mr-3" />;
            case 'User Management': return <FiUsers className="mr-3" />;
            case 'Products': return <FiPackage className="mr-3" />;
            case 'Series': return <FiLayers className="mr-3" />;
            case 'Categories': return <FiLayers className="mr-3" />;
            case 'Product Types': return <RiShirtLine className="mr-3" />;
            case 'Orders': return <FiFileText className="mr-3" />;
            case 'Promotions': return <BsGift className="mr-3" />;
            case 'Attributes': return <MdLocalOffer className="mr-3" />;
            case 'Settings': return <FiSettings className="mr-3" />;  
            default: return <FiPackage className="mr-3" />;
        }
    };

    const navLinks = [
        {
            Name: 'Dashboard',
            Tasks: [
                { href: '/admin/show/show-views', label: 'Statistics / Views' },
                { href: '/admin/sync/sync-sales-count', label: 'Sync Sales Count' },
            ],
        },
        {
            Name: 'Inventory',
            Tasks: [
                { href: '/admin/inventory/stock-status', label: 'Stock Status' },
                { href: '/admin/inventory/low-stock', label: 'Low Stock Alerts' },
                { href: '/admin/inventory/warehouse', label: 'Warehouse Management' },
            ],
        },
        {
            Name: 'Coupons',
            Tasks: [
                { href: '/admin/promotions/create-coupon', label: 'Create Coupon' },
                { href: '/admin/promotions/manage-coupons', label: 'Manage Coupons' },
                { href: '/admin/promotions/usage-logs', label: 'Coupon Usage Logs' },
            ],
        },
        {
            Name: 'Reports',
            Tasks: [
                { href: '/admin/reports/sales', label: 'Sales Report' },
                { href: '/admin/reports/inventory', label: 'Inventory Report' },
                { href: '/admin/reports/customers', label: 'Customer Report' },
                { href: '/admin/reports/tax', label: 'Tax Report' },
            ],
        },
        {
            Name: 'Payments',
            Tasks: [
                { href: '/admin/payments/transactions', label: 'All Transactions' },
                { href: '/admin/payments/refunds', label: 'Refund Requests' },
                { href: '/admin/payments/payouts', label: 'Vendor Payouts' },
            ],
        },
        {
            Name: 'Role Management',
            Tasks: [
                { href: '/admin/Manage/roles', label: 'Manage Roles' },
            ],
        },
        {
            Name: 'User Management',
            Tasks: [
                { href: '/admin/show/show-users', label: 'All Users / Customers' },
                { href: '/admin/show/user-details', label: 'View User Details' },
                { href: '/admin/Analytics/user-insights', label: 'User Analytics' },
            ],
        },
        {
            Name: 'Products',
            Tasks: [
                { href: '/admin/add/add-product', label: 'Add Product' },
                { href: '/admin/publish-product', label: 'Unpublished Products' },
                { href: '/admin/all-products', label: 'All Products' },
            ],
        },
        {
            Name: 'Series',
            Tasks: [
                { href: '/admin/add/add-series', label: 'Add Series' },
                { href: '/admin/show/show-all-series', label: 'Show Series' },
            ],
        },
        {
            Name: 'Categories',
            Tasks: [
                { href: '/admin/add/add-category', label: 'Add Category (for Series)' },
                { href: '/admin/show/show-all-categories', label: 'Show Categories' },
            ],
        },
        {
            Name: 'Product Types',
            Tasks: [
                { href: '/admin/add/add-product-type', label: 'Add Product Type' },
                { href: '/admin/show/product-type', label: 'Show / Edit Product Types' },
            ],
        },
        {
            Name: 'Orders',
            Tasks: [
                {
                    href: '/admin/show/show-orders',
                    label: (
                        <Badge badgeContent={showCount} color="secondary" overlap="rectangular">
                            Show Orders
                        </Badge>
                    ),
                },
                { href: '/admin/show/show-customization-requests', label: 'Customization Requests' },
                { href: '/admin/show/show-requests', label: 'Cancel/Return Requests' },
                { href: '/MyCart', label: 'View Carts' },
            ],
        },
        {
            Name: 'Promotions',
            Tasks: [
                { href: '/admin/add/add-new-arrivals', label: 'New Arrivals' },
                { href: '/admin/add/add-new-pop-up', label: 'Add Pop-Up' },
                { href: '/admin/edit/update-pop-up', label: 'Update Pop-Up' },
                { href: '/admin/edit/update-discount', label: 'Update Discount' },
            ],
        },
        {
            Name: 'Attributes',
            Tasks: [
                { href: '/admin/add/add-color', label: 'Add Color' },
                { href: '/admin/add/add-size', label: 'Add Size' },
                { href: '/admin/add/add-fabric', label: 'Add Fabric' },
            ],
        },
        {
            Name: 'Settings',
            Tasks: [
                { href: '/admin/settings/rearrange-navbar', label: 'Rearrange Navbar Items' },
            ],
        },
    ];

    const toggleDrawer = () => setIsOpen(!isOpen);

    const toggleSection = (sectionName) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }));
    };

    return (
        <div className={`fixed flex z-40 ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out h-screen`}>
            <div className={`flex flex-col bg-gray-800 text-white h-full ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out shadow-xl`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    {isOpen && (
                        <Link
                            href="/admin"
                            className="text-xl font-bold text-white hover:text-blue-300 transition duration-300 flex items-center"
                        >
                            <AiOutlineDashboard className="mr-2" />
                            Admin Panel
                        </Link>
                    )}
                    <button
                        onClick={toggleDrawer}
                        className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
                        aria-label={isOpen ? "Collapse menu" : "Expand menu"}
                    >
                        <AiOutlineMenu className="text-xl" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        {navLinks.map((link, index) => {
                            const isExpanded = expandedSections[link.Name];
                            return (
                                <li key={index} className="px-2">
                                    <div
                                        className={`flex items-center justify-between cursor-pointer py-2 px-3 rounded-md ${isExpanded ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                                        onClick={() => toggleSection(link.Name)}
                                    >
                                        <div className="flex items-center">
                                            {getSectionIcon(link.Name)}
                                            {isOpen && (
                                                <span className="font-medium">{link.Name}</span>
                                            )}
                                        </div>
                                        {isOpen && (
                                            <span className="text-xs">
                                                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>
                                        )}
                                    </div>
                                    {isOpen && isExpanded && (
                                        // <ul className="pl-8 pt-1 space-y-1 mt-1">
                                        <ul className="pl-8 pt-1 space-y-1 mt-1 transition-all duration-300 ease-in-out">
                                            {link.Tasks.map((task, taskIndex) => (
                                                <li key={taskIndex}>
                                                    <Link href={task.href}>
                                                        <div
                                                            className={`block py-2 px-3 rounded-md text-sm cursor-pointer transition-colors duration-200 ${router.pathname === task.href
                                                                ? 'bg-blue-600 text-white font-medium'
                                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                                }`}
                                                        >
                                                            {task.label}
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDrawer;