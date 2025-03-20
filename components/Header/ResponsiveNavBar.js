import Link from 'next/link';
import { AiOutlineHeart, AiOutlineSearch, AiOutlineShoppingCart } from "react-icons/ai";
import LeftDrawer from '../Drawers/LeftDrawer';
import CustomerDrawer from '../Drawers/CustomerDrawer';
import { useContext, useState } from 'react';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { useRouter } from 'next/router';

const ResponsiveNavBar = ({ btn, fnc, ListStyle, ListComponent, categories, genders, sideLinks }) => {
    const navEndBtnClass = "btn btn-square btn-sm btn-ghost text-xl"
    const [searchInput, setSearchInput] = useState('')

    const router = useRouter()

    const handleSearch = () => {
        router.push(`search-product?search=${searchInput}`)
    };
    
    return (
        <div>
            <div
                data-theme='black'
                className=' w-full top-0'
            >
                <div className="navbar bg-base-100">
                    <div className="flex-none">
                        <div className='hidden md:inline-block'>
                            <LeftDrawer ListStyle={ListStyle} ListComponent={ListComponent} categories={categories} genders={genders}></LeftDrawer>
                        </div>
                        <div className='md:hidden'>
                            <CustomerDrawer ListStyle={ListStyle} ListComponent={ListComponent} categories={categories} genders={genders}></CustomerDrawer>
                        </div>
                    </div>
                    <div className="flex-1 ml-14 md:ml-0">
                        <Link href='/' className=" btn-ghost normal-case text-xl">
                            <img src="/logo-removebg.png" className='h-14' alt="" />
                        </Link>
                    </div>

                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <button className={navEndBtnClass} onClick={() => fnc(!btn)}>
                                <AiOutlineSearch className='' >
                                </AiOutlineSearch>
                            </button>
                        </li>
                        <li>
                            <Link href='/WishList' className={navEndBtnClass}>
                                <AiOutlineHeart ></AiOutlineHeart>
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
                                    {sideLinks}
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={btn ? `w-full text-center` : `hidden`}>
                <div className="join w-full px-10 py-5">
                    <div className='w-full'>
                        <div>
                            <input
                                className="input input-bordered join-item w-full"
                                placeholder="Search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="indicator">
                        <button
                            className="btn join-item"
                            onClick={() => handleSearch()}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveNavBar;