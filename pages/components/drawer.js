import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Header from './header';

function Drawer(props) {
    const [email, setEmail] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const session = sessionStorage.getItem('email');
            if (session) {
                setEmail(session);
            }
        }
    }, []);

    const handleSignOut = async (event) => {
        event.preventDefault();
        try {
            sessionStorage.removeItem('email');
            setEmail(null);
            router.push('sign-in');
        } catch (error) {
            console.error(error)
        }

    };

    return (
        <>
            <Header title={props.title} header={props.header} />


            <div className="flex">
                {/* drawer open close  */}
                <input
                    type="checkbox"
                    id="panel-toggle"
                    className="relative sr-only peer"
                    defaultChecked
                />
                {/* drawer icon  */}
                <label
                    htmlFor="panel-toggle"
                    className="absolute top-0 left-0 inline-block p-4 transition-all duration-500 bg-indigo-500 rounded-lg peer-checked:rotate-180 peer-checked:left-64"
                >
                    <div className="w-6 h-1 mb-3 -rotate-45 bg-white rounded-lg"></div>
                    <div className="w-6 h-1 rotate-45 bg-white rounded-lg"></div>
                </label>
                <div
                    className="fixed top-0 left-0 z-20 w-64 h-full transition-all duration-500 transform -translate-x-full bg-white shadow-lg peer-checked:translate-x-0"
                >
                    <div className="px-6 py-4">
                        <h2 className="font-extrabold text-5xl">Panel</h2>
                        <ul className="text-gray-500 mt-5">
                            <li className="mb-4 transition duration-300 ease-in-out transform hover:scale-105">
                                <a
                                    href="add-category"
                                    className="text-lg font-semibold hover:text-indigo-500"
                                >
                                    Add category
                                </a>
                            </li>
                            <li className="mb-4 transition duration-300 ease-in-out transform hover:scale-105">
                                <a
                                    href="categories"
                                    className="text-lg font-semibold hover:text-indigo-500"
                                >
                                    Show categories
                                </a>
                            </li>
                            <li className="mb-4 transition duration-300 ease-in-out transform hover:scale-105">
                                <a
                                    href="AddSize"
                                    className="text-lg font-semibold hover:text-indigo-500"
                                >
                                    Add Size
                                </a>
                            </li>

                            <li className="mb-4 transition duration-300 ease-in-out transform hover:scale-105">
                                <a
                                    href="AddProduct"
                                    className="text-lg font-semibold hover:text-indigo-500"
                                >
                                    Add Product
                                </a>
                            </li>

                            <li className="mb-4 transition duration-300 ease-in-out transform hover:scale-105">
                                <a
                                    href="Products"
                                    className="text-lg font-semibold hover:text-indigo-500"
                                >
                                    Show Products
                                </a>
                            </li>
                        </ul>
                        <div className="flex mt-4">
                            <button className="bg-indigo-500 text-white px-4 py-2 rounded mr-2">
                                <a href="updateProfile">Profile</a>
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
}

export default Drawer;

