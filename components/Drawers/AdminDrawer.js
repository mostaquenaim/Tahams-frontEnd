import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import { AiOutlineMenu } from "react-icons/ai";

const AdminDrawer = () => {
    const router = useRouter();

    // Define your links here
    const navLinks = [
        { href: '/admin/Add/add-product', label: 'Add product' },
        { href: '/admin/delete-product', label: 'Delete product' },
        // Add more links as needed
    ];

    return (
        <div className="fixed flex z-40">
            {/* Drawer */}
            <div className="flex flex-col w-64 bg-white border-r border-gray-200">
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-lg font-semibold">Admin Panel</span>
                    <div className="drawer-content">
                        <div className="drawer-button">
                            <AiOutlineMenu className='text-3xl' />
                        </div>
                    </div>
                </div>
                {/* Drawer Body */}
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
            </div>
        </div>
    );
};

export default AdminDrawer;
