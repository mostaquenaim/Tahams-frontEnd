import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { AiOutlineHeart, AiOutlineSearch, AiOutlineShoppingCart } from "react-icons/ai";
import CustomerDrawer from '../Drawers/CustomerDrawer';
import Drawer from '../Drawers/drawer';

const ResponsiveNavBar = ({ btn, fnc, ListStyle, ListComponent, categories }) => {
    // const { theme, setTheme } = useContext(ThemeContext)

    // const handleTheme = () => {
    //     if (theme === 'light') {
    //         setTheme('dark')
    //     }
    //     else {
    //         setTheme('light')
    //     }
    // }


    const navEndBtnClass = "btn btn-square btn-ghost text-xl"

    return (
        <div>
            <div
                data-theme='black'
                className=' w-full top-0'
            >
                <div className="navbar bg-base-100">
                    <div className="flex-none">
                        <div className='hidden md:inline-block'>
                            <CustomerDrawer ListStyle={ListStyle} ListComponent={ListComponent} categories={categories}></CustomerDrawer>
                        </div>
                        <div className='md:hidden'>
                            <Drawer ListStyle={ListStyle} ListComponent={ListComponent} categories={categories}></Drawer>
                        </div>
                    </div>
                    <div className="flex-1 ml-14 md:ml-0">
                        <Link href='/' className=" btn-ghost normal-case text-xl">
                            <img src="https://i.ibb.co/5FcQHFJ/logo-removebg.png" className='h-14' alt="" />
                        </Link>
                    </div>

                    <div className="flex">
                        <Link href='/' className={navEndBtnClass} onClick={() => fnc(!btn)}>
                            <AiOutlineSearch className='' >
                            </AiOutlineSearch>
                        </Link>
                        <Link href='/' className={navEndBtnClass}>
                            <AiOutlineHeart ></AiOutlineHeart>
                        </Link>
                        <Link href='/' className={navEndBtnClass}>
                            <AiOutlineShoppingCart ></AiOutlineShoppingCart>
                        </Link>
                        <Link href='/' className={navEndBtnClass}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                        </Link>
                    </div>
                </div>
            </div>
            <div className={btn ? `w-full text-center` : `hidden`}>
                <div className="join w-full px-10 py-5">
                    <div className='w-full'>
                        <div>
                            <input className="input input-bordered join-item w-full" placeholder="Search" />
                        </div>
                    </div>
                    <div className="indicator">
                        <button className="btn join-item">Search</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveNavBar;