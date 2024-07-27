import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AiOutlineMenu } from "react-icons/ai";

const AdminDrawer = () => {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    // Define your links here
    const navLinks = [
        { href: '/admin/Add/add-product', label: 'Add Product' },
        { href: '/admin/publish-product', label: 'Show Unpublished Products' },
        { href: '/admin/Add/add-series', label: 'Add Series '},
        { href: '/admin/Add/add-category', label: 'Add Category of a series '},
        { href: '/admin/Add/add-product-type', label: 'Add product type of a category '},
        { href: '/admin/Add/add-color', label: 'Add Color' },
        { href: '/admin/Add/add-size', label: 'Add Size' },
        { href: '/admin/Add/add-fabric', label: 'Add Fabric' },
        { href: '/admin/delete-product', label: 'Delete Product' },
        // Add more links as needed
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
                                    <Link href={link.href}>
                                        <label className={router.pathname === link.href ? 'text-blue-600 font-semibold text-xl cursor-pointer' : 'cursor-pointer'}>{link.label}</label>
                                    </Link>
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
