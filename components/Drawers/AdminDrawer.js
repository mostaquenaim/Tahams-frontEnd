import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AiOutlineMenu } from "react-icons/ai";
import { CountContext } from '../../Contexts/CountProvider';
import { Badge } from '@mui/material';
import useGroupOrders from '../../Hooks/useGroupOrders';

const AdminDrawer = () => {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();
    const [sortedGroupedOrdersArray] = useGroupOrders()
    const { setShowCount } = useContext(CountContext)

    const uncheckedCount = sortedGroupedOrdersArray.filter(group => !group.history.isChecked).length;
    // console.log(uncheckedCount, 'uncheckedCount');
    setShowCount(uncheckedCount)

    const { showCount } = useContext(CountContext)
    console.log(showCount && showCount, 'showCount');

    // Define your links here
    const navLinks = [
        {
            Name: 'Product',
            Tasks: [
                { href: '/admin/Add/add-product', label: 'Add Product' },
                { href: '/admin/publish-product', label: 'Show Unpublished Products' },
                { href: '/admin/all-products', label: 'All Products' },
            ]
        },
        {
            Name: 'Series',
            Tasks: [
                { href: '/admin/Add/add-series', label: 'Add Series' },
            ]
        },
        {
            Name: 'Category',
            Tasks: [
                { href: '/admin/Add/add-category', label: 'Add Category of a series' },
            ]
        },
        {
            Name: 'Product Type',
            Tasks: [
                { href: '/admin/Add/add-product-type', label: 'Add product type of a category' },
                // { href: '/admin/edit/edit-product-type', label: 'Edit product type' },
                { href: '/admin/Show/product-type', label: 'Show product types' },
            ]
        },
        {
            Name: 'Color',
            Tasks: [
                { href: '/admin/Add/add-color', label: 'Add Color' },
            ]
        },
        {
            Name: 'Size',
            Tasks: [
                { href: '/admin/Add/add-size', label: 'Add Size' },
            ]
        },
        {
            Name: 'Fabric',
            Tasks: [
                { href: '/admin/Add/add-fabric', label: 'Add Fabric' },
            ]
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
                { href: '/admin/Show/show-requests', label: 'Cancel/Return req' },
                { href: '/MyCart', label: 'Show Carts' },
            ]
        },
        {
            Name: 'Statistics',
            Tasks: [
                { href: '/admin/Show/show-views', label: 'Show Views' },
                // { href: '/MyCart', label: 'Show Carts' },
            ]
        },
    ];

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`fixed flex z-40 ${isOpen ? 'w-64' : 'w-16'} transition-width duration-300`}>
            {/* Drawer */}
            <div className={`flex flex-col bg-white border-r border-gray-200 h-screen ${isOpen ? 'w-64' : 'w-16'} transition-width duration-300`}>
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    {isOpen && <span className="text-lg font-semibold">Admin Panel</span>}
                    <div className="drawer-button cursor-pointer" onClick={toggleDrawer}>
                        <AiOutlineMenu className='text-3xl' />
                    </div>
                </div>
                {/* Drawer Body */}
                {isOpen && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {navLinks.map((link, index) => (
                                <li key={index}>
                                    <h2 className="text-xl underline font-semibold">{link.Name}</h2>
                                    <ul>
                                        {link.Tasks.map((task, taskIndex) => (
                                            <li key={taskIndex}>
                                                <Link href={task.href}>
                                                    <label className={router.pathname === task.href ? 'text-blue-600 font-semibold text-xl cursor-pointer' : 'cursor-pointer'}>{task.label}</label>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDrawer;