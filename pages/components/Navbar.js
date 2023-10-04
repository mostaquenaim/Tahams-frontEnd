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
            <div className="flex justify-between items-center text-white md:justify-center text-center bg-black">
                <div className="">
                    <div className='md:hidden'>
                        <CustomerDrawer links={links} />
                    </div>
                </div>
                <div className="">
                    <Link href='/' className="normal-case">
                        <img src='https://i.ibb.co/5FcQHFJ/logo-removebg.png' alt="Company Logo" className="w-16" />
                    </Link>
                </div>
                <div className="">
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
