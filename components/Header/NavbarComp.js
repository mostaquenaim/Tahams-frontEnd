import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import ResponsiveNavBar from './ResponsiveNavBar';
import { AiOutlineHeart, AiOutlineShoppingCart } from 'react-icons/ai';
import ListComponent from './components/ListComponent';
import axios from 'axios';
import { AuthContext } from '/Contexts/Auth/AuthProvider';

const NavbarCompTwo = () => {
    const [searchBtn, setSearchBtn] = useState(false)
    const [categories, setCategories] = useState([])
    const { user, logOut } = useContext(AuthContext)
    console.log(user);

    useEffect(() => {
        axios.get('http://api.tahamsbd.com/admin/view-product-categories')
            .then((res) => {
                setCategories(res.data)
                console.log(res.data,"19");
            })
    }, [])

    const handleLogout = () =>{
        logOut()
    }

    // styles 
    const navEndBtnClass = "btn btn-square btn-ghost text-xl"

    const ListStyle = ({ goto, pageName, extraClass }) => {
        return (
            <li className={`hover:text-zinc-400 md:border-b-2 border-transparent hover:border-zinc-600 text-opacity-70 ${extraClass}`}>
                <Link href={goto}>{pageName}</Link>
                <hr className="hidden hover:inline-block w-full border-black duration-300 transition-width"></hr>
            </li>
            // hidden hover:inline-block
        );
    }

    // navlinks 
    const links = (
        <>
            <ListStyle goto='/' pageName='Home' />
            {
                categories &&
                categories.map((cat, index) => (
                    <ListComponent key={index} cat={cat} ListStyle={ListStyle}></ListComponent>
                ))
            }
        </>
    );

    const collabs = <>
        <ListStyle goto='/products/Men' pageName='Artist Collabs' />
        <ListStyle goto='/products/Women' pageName='Influencer Collabs' />
    </>

    return (
        <>

            <div
                data-theme='black'
                className='relative'>
                {/* first nav */}
                <div className={searchBtn ? 'hidden' : 'hidden lg:block absolute top-0 z-20 left-0 right-0 bg-black text-white'}>
                    <div className='flex items-center justify-between'>

                        {/* search  */}
                        <div className={`w-1/3 text-center z-40`}>
                            <div className="join w-full px-20 py-5">
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

                        {/* image  */}
                        <div className="absolute w-full">
                            <Link href='/' className='w-20 mx-auto text-center'>
                                <img src='https://i.ibb.co/5FcQHFJ/logo-removebg.png' alt="Company Logo" className="w-20 p-2 mx-auto" />
                            </Link>
                        </div>

                        {/* menu  */}
                        <ul className="menu menu-horizontal px-1">
                            <li>
                                <Link href={`/WishList?userId=${user?.uid}`} className={navEndBtnClass}>
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
                                        <li>
                                            {
                                                user ?
                                                    <button onClick={handleLogout}>
                                                        Logout
                                                    </button>
                                                    :
                                                    <Link href='/login'>
                                                        Login
                                                    </Link>
                                            }
                                        </li>
                                        <li><Link href='#'>
                                            Contact Us
                                        </Link></li>
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
                    <ResponsiveNavBar btn={searchBtn} fnc={setSearchBtn} ListStyle={ListStyle} ListComponent={ListComponent} categories={categories}></ResponsiveNavBar>
                </section>
            </div>
        </>
    );
};


export default NavbarCompTwo;