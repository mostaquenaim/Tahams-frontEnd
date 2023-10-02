import React, { useContext, useEffect, useState } from 'react';
import { CompanyContext } from '..';
import Link from 'next/link';
import { ListStyle, loadCategories } from '../functions/functions';
import Men from '../products/Men';
import CustomerDrawer from './CustomerDrawer';
import { CgProfile } from "react-icons/cg";

const NavbarComp = () => {

    const links = (
        <>
            <ListStyle goto='/' pageName='Home' />
            <ListStyle goto='/products/Men' pageName='Men' />
            <ListStyle goto='/products/Women' pageName='Women' />
            <ListStyle goto='/products/Kids' pageName='Kids' />
            <ListStyle goto='/products/Toddler' pageName='Toddler' />
        </>
    );

    return (
        <div>
            <div className="navbar bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200">
                <div className="navbar-start">
                    <div className='md:hidden'>
                        <CustomerDrawer links={links} />
                    </div>
                </div>
                <div className="navbar-center">
                    <Link href='/' className="normal-case text-xl">
                        <img src='https://i.ibb.co/wJ08vz8/logo-removebg-preview.png' alt="Company Logo" className="w-16" />
                    </Link>
                </div>
                <div className="navbar-end">
                    <div className='md:hidden'>
                        <CgProfile className='text-3xl '/>
                    </div>
                </div>
            </div>
            <div>
                <ul className='hidden md:flex gap-5 text-center justify-around items-center text-xl p-5 font-semibold '>
                    {links}
                </ul>
            </div>
        </div>
    );
};

export default NavbarComp;
