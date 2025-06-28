import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AiOutlineMenu } from "react-icons/ai";
import { CountContext } from '../../Contexts/CountProvider';
import { Badge } from '@mui/material';
import useGroupOrders from '../../Hooks/useGroupOrders';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const AdminDrawer = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({ Orders: true });
    const router = useRouter();
    const [sortedGroupedOrdersArray] = useGroupOrders();
    const { setShowCount, showCount } = useContext(CountContext);

    const uncheckedCount = sortedGroupedOrdersArray.filter(group => !group.history.isChecked).length;
    setShowCount(uncheckedCount);

    const navLinks = [
        {
            Name: 'Dashboard',
            Tasks: [
                { href: '/admin/Show/show-views', label: 'Statistics / Views' },
                { href: '/admin/sync/sync-sales-count', label: 'Sync Sales Count' },
            ],
        },
        {
            Name: 'Products',
            Tasks: [
                { href: '/admin/Add/add-product', label: 'Add Product' },
                { href: '/admin/publish-product', label: 'Unpublished Products' },
                { href: '/admin/all-products', label: 'All Products' },
            ],
        },
        {
            Name: 'Series',
            Tasks: [
                { href: '/admin/Add/add-series', label: 'Add Series' },
                { href: '/admin/Show/show-all-series', label: 'Show Series' },
            ],
        },
        {
            Name: 'Categories',
            Tasks: [
                { href: '/admin/Add/add-category', label: 'Add Category (for Series)' },
                { href: '/admin/Show/show-all-categories', label: 'Show Categories' },
            ],
        },
        {
            Name: 'Product Types',
            Tasks: [
                { href: '/admin/Add/add-product-type', label: 'Add Product Type' },
                { href: '/admin/Show/product-type', label: 'Show / Edit Product Types' },
            ],
        },
        {
            Name: 'Orders',
            Tasks: [
                {
                    href: '/admin/Show/show-orders',
                    label: (
                        <Badge badgeContent={showCount} color="secondary" overlap="rectangular">
                            Show Orders
                        </Badge>
                    ),
                },
                { href: '/admin/Show/show-requests', label: 'Cancel/Return Requests' },
                { href: '/MyCart', label: 'View Carts' },
            ],
        },
        {
            Name: 'Promotions',
            Tasks: [
                { href: '/admin/Add/add-new-arrivals', label: 'New Arrivals' },
                { href: '/admin/Add/add-new-pop-up', label: 'Add Pop-Up' },
                { href: '/admin/edit/update-pop-up', label: 'Update Pop-Up' },
                { href: '/admin/edit/update-discount', label: 'Update Discount' },
            ],
        },
        {
            Name: 'Attributes',
            Tasks: [
                { href: '/admin/Add/add-color', label: 'Add Color' },
                { href: '/admin/Add/add-size', label: 'Add Size' },
                { href: '/admin/Add/add-fabric', label: 'Add Fabric' },
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
        <div className={`fixed flex z-40 ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
            <div className={`flex flex-col bg-white border-r border-gray-200 h-screen ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
                <div className="flex items-center justify-between p-4 border-b">
                    {isOpen && (
                        <Link
                            href="/admin"
                            className="text-lg font-semibold uppercase text-blue-500 hover:text-blue-700 transition duration-300"
                        >
                            Admin Panel
                        </Link>
                    )}
                    <div className="cursor-pointer" onClick={toggleDrawer}>
                        <AiOutlineMenu className="text-3xl" />
                    </div>
                </div>

                {isOpen && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {navLinks.map((link, index) => {
                                const isExpanded = expandedSections[link.Name];
                                return (
                                    <li key={index}>
                                        <div
                                            className="flex items-center justify-between cursor-pointer text-xl font-semibold text-gray-800 hover:text-blue-600"
                                            onClick={() => toggleSection(link.Name)}
                                        >
                                            <span>{link.Name}</span>
                                            <span className="text-sm">{isExpanded ? <FaChevronDown /> : <FaChevronRight />}</span>
                                        </div>
                                        {isExpanded && (
                                            <ul className="pl-4 pt-1 space-y-1">
                                                {link.Tasks.map((task, taskIndex) => (
                                                    <li key={taskIndex}>
                                                        <Link href={task.href}>
                                                            <label
                                                                className={`block text-sm cursor-pointer hover:text-blue-500 ${router.pathname === task.href ? 'text-blue-600 font-bold' : ''
                                                                    }`}
                                                            >
                                                                {task.label}
                                                            </label>
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
                )}
            </div>
        </div>
    );
};

export default AdminDrawer;
