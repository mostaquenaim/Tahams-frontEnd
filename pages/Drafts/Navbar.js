import React, { useState } from 'react';
import { CompanyContext } from '..';
import Link from 'next/link';
import Men from '../products/Men';
import CustomerDrawer from '../components/Drawers/CustomerDrawer';
import { CgProfile } from "react-icons/cg";
import SecondLayerNav from '../components/Header/SecondLayerNav';
import ResponsiveNavBar from '../components/Header/ResponsiveNavBar';
import { AiOutlineHeart, AiOutlineSearch, AiOutlineShoppingCart } from 'react-icons/ai';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const ListStyle = ({ goto, pageName }) => {
    return (
        <li className='hover:text-zinc-400 md:border-b-2 border-transparent hover:border-zinc-600 text-opacity-70'>
            <Link href={goto}>{pageName}</Link>
            {/* <hr className="hidden hover:inline-block w-full border-black duration-300 transition-width"></hr> */}
        </li>
        // hidden hover:inline-block
    );
}

const List = ({ children, parentClass, parentName }) => {
    return (
        <li className={parentClass}>
            <span className='flex gap-1 items-center'> {parentName} <MdOutlineKeyboardArrowDown></MdOutlineKeyboardArrowDown> </span>
            <ul className="hidden gap-10 bg-base-100 absolute border-white border-2 rounded-lg p-5">
                {children}
            </ul>
        </li>
        // hidden hover:inline-block
    );
}

export default function NavbarComp({ category }) {
    const [searchBtn, setSearchBtn] = useState(false)
    const [navChild, setNavChild] = useState(false)

    const navEndBtnClass = "btn btn-square btn-ghost text-xl"

    const links = (
        <>
            <ListStyle goto='/' pageName='Home' />

            <List parentClass={'toddler'} parentName={'Toddler'}>
                <li className='summer border-r-2 border-zinc-800 pr-4'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Summer </span>
                    {/* <ul className=" bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Half Sleeve' />
                    {/* </ul> */}
                </li>
                <li className='winter'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Winter </span>
                    {/* <ul className="bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve' />
                    <ListStyle goto='/products/Toddler' pageName='Hoodie' />
                    {/* </ul> */}
                </li>
            </List>

            <List parentClass={'kids'} parentName={'Kids'}>
                <li className='summer border-r-2 border-zinc-800 pr-4'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Summer </span>
                    {/* <ul className=" bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Half Sleeve' />
                    {/* </ul> */}
                </li>
                <li className='winter'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Winter </span>
                    {/* <ul className="bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve' />
                    <ListStyle goto='/products/Toddler' pageName='Hoodie' />
                    {/* </ul> */}
                </li>
            </List>

            <List parentClass={'adult'} parentName={'Adults'}>
                <li className='summer border-r-2 border-zinc-800 pr-4'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Summer </span>
                    {/* <ul className=" bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Half Sleeve' />
                    <ListStyle goto='/products/Toddler' pageName='Drop Shoulder' />
                    <ListStyle goto='/products/Toddler' pageName='Crop' />
                    <ListStyle goto='/products/Toddler' pageName='V Neck' />
                    <ListStyle goto='/products/Toddler' pageName='Raglan' />
                    <ListStyle goto='/products/Toddler' pageName='Polo' />
                    {/* </ul> */}
                </li>
                <li className='winter'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Winter </span>
                    {/* <ul className="bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve' />
                    <ListStyle goto='/products/Toddler' pageName='Kangaroo Pocket Hoodie' />
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve Zipper Hoodie' />
                    <ListStyle goto='/products/Toddler' pageName='Sleeveless Zipper Hoodie' />
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve Sweatshirt' />
                    <ListStyle goto='/products/Toddler' pageName="Men's Vest" />
                    <ListStyle goto='/products/Toddler' pageName='Crop Hoodie' />
                    {/* </ul> */}
                </li>
            </List>

            <List parentClass={'bigBoss'} parentName={'Big Boss'}>
                <li className='summer border-r-2 border-zinc-800 pr-4'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Summer </span>
                    {/* <ul className=" bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Half Sleeve' />
                    <ListStyle goto='/products/Toddler' pageName='Drop Shoulder' />
                    {/* </ul> */}
                </li>
                <li className='winter'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Winter </span>
                    {/* <ul className="bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve' />
                    <ListStyle goto='/products/Toddler' pageName='Kangaroo Pocket Hoodie' />
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve Zipper Hoodie' />
                    <ListStyle goto='/products/Toddler' pageName='Full Sleeve Sweatshirt' />
                    {/* </ul> */}
                </li>
            </List>

            <List parentClass={'couple'} parentName={'Couples'}>
                {/* <ul className=" bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                <ListStyle goto='/products/Toddler' pageName='T-shirt' />
                <ListStyle goto='/products/Toddler' pageName='Hoodie' />
                <ListStyle goto='/products/Toddler' pageName='Mug' />
                <ListStyle goto='/products/Toddler' pageName='Water Bottle' />
                {/* </ul> */}
            </List>

            <List parentClass={'gift'} parentName={'Gift'}>
                <li className='mug border-r-2 border-zinc-800 pr-4'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Mug </span>
                    {/* <ul className=" bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='White Mug' />
                    <ListStyle goto='/products/Toddler' pageName='Radium Mug' />
                    <ListStyle goto='/products/Toddler' pageName='Magic Mug' />
                    {/* </ul> */}
                </li>
                <li className='bottle border-r-2 border-zinc-800 pr-4'>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Water Bottle </span>
                    {/* <ul className="bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='500 mL' />
                    <ListStyle goto='/products/Toddler' pageName='600 mL' />
                    <ListStyle goto='/products/Toddler' pageName='700 mL' />
                    {/* </ul> */}
                </li>
                <li className='photo '>
                    <span className='flex gap-1 items-center pb-3 text-lg font-bold'> Photo Frame</span>
                    {/* <ul className="bg-base-100 absolute border-white border-2 rounded-lg p-5"> */}
                    <ListStyle goto='/products/Toddler' pageName='Glass' />
                    <ListStyle goto='/products/Toddler' pageName='Stone' />
                    {/* </ul> */}
                </li>
            </List>

            <List parentClass={'customize'} parentName={'Customize'}>

                <ListStyle goto='/products/Toddler' pageName='T-Shirt' />
                <ListStyle goto='/products/Toddler' pageName='Water Bottle' />
                <ListStyle goto='/products/Toddler' pageName='Mug' />
                <ListStyle goto='/products/Toddler' pageName='Frame' />
            </List>

        </>
    );

    const collabs = <>
        <ListStyle goto='/products/Men' pageName='Artist Collabs' />
        <ListStyle goto='/products/Women' pageName='Influencer Collabs' />
    </>

    return (
        <div
            data-theme='black'
            className='relative'>
            {/* first nav */}
            <div className={searchBtn ? 'hidden' : 'hidden lg:block absolute top-0 z-20 left-0 right-0 bg-black text-white'}>
                <div className='flex items-center justify-between'>

                    {/* search  */}
                    <div className={`w-1/3 text-center z-50`}>
                        <div className="join w-full px-20 py-5">
                            <div className='w-full'>
                                <div>
                                    <input className="input input-bordered join-item w-full" placeholder="Search" />
                                </div>
                            </div>
                            <div className="indicator">
                                {/* <span className="indicator-item badge badge-secondary">new</span> */}
                                <button className="btn join-item">Search</button>
                            </div>
                        </div>
                    </div>

                    {/* image  */}
                    <div className="absolute w-full">
                        <Link href='/' className='w-20 mx-auto text-center'>
                            <img src='https://i.ibb.co/5FcQHFJ/logo-removebg.png' alt="Company Logo" className="w-20 p-2 mx-auto" />
                        </Link>
                    </div>

                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <Link href='/WishList' className={navEndBtnClass}>
                                <AiOutlineHeart></AiOutlineHeart>
                            </Link>
                        </li>
                        <li>
                            <Link href='/MyCart' className={navEndBtnClass}>
                                <AiOutlineShoppingCart ></AiOutlineShoppingCart>
                            </Link>
                        </li>
                        <li>
                            <details>
                                <summary>

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        className="inline-block w-5 h-5 stroke-current"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                        ></path></svg>

                                </summary>
                                <ul className="p-2 bg-base-100 right-0">
                                    <li><Link href='#'>Link 1</Link></li>
                                    <li><Link href='#'>Link 2</Link></li>
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
                <div>
                    <ul className='hidden md:flex gap-5  justify-center items-center text-base px-5 font-semibold w-full'>
                        {links}
                    </ul>
                    <ul className='hidden md:flex gap-5 text-center justify-center items-center text-base px-5 py-3 font-semibold w-full'>
                        {collabs}
                    </ul>
                </div>
            </div>

            {/* second nav */}
            <section className='fixed top-0 w-full bg-black z-10'>
                <ResponsiveNavBar btn={searchBtn} fnc={setSearchBtn}></ResponsiveNavBar>
            </section>
        </div>
    );
};

export async function getServerSideProps() {
    // Fetch data from external API
    const res = await fetch(`https://tahams-test-production.up.railway.app/admin/view-product-categories`)
    const category = await res.json()
    console.log(category);
    // Pass data to the page via props
    return { props: { category } }
}

