import { useContext, useEffect, useState } from 'react';
import NavbarCompTwo from '/components/Header/NavbarComp';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import axios from 'axios';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import useUserInfo from '../../Hooks/useUserInfo';
import useWish from '../../Hooks/useWish';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../../components/Footer/Footer';


const WishList = () => {
    const axiosPublic = useAxiosPublic();
    // const [wishes, setWishes] = useState([])
    const { user } = useContext(AuthContext)
    const [loading, wish, refetch] = useWish();
    const [isDeleting, setIsDeleting] = useState(false);
    const [userInfo, setUserInfo] = useState(null)

    useEffect(() => {
        const storedUserInfo = JSON.parse(sessionStorage.getItem('userInfo'))
        setUserInfo(storedUserInfo)
    }, [])

    const handleDelete = async (item) => {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
        const formData = new FormData();
        // console.log(item);

        formData.append('productId', item.product.id);
        formData.append('customerId', userInfo && userInfo.id);

        if (userInfo) {
            setIsDeleting(true);
            try {
                await axiosPublic.delete(`admin/remove-wish/`,formData);
                refetch();
            } catch (error) {
                console.error("Failed to delete item:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <>
            <NavbarCompTwo />
            <div className="container mx-auto p-4 min-h-screen">
                <h1 className="text-2xl font-bold mb-4 p-48">Your Wishlist</h1>
                {
                    loading
                        ?
                        <span className='loading loading-spinner loading-md'></span>
                        :
                        wish && wish.length > 0 ? (
                            <ul>
                                {wish.map(item => (
                                    <li key={item.id} className="mb-4">
                                        <div className="p-4 border rounded shadow flex justify-between items-center">
                                            <Link href={`products/details/${item.product.id}`} className='transition duration-300 hover:scale-105'>
                                                <img
                                                    className='w-16 rounded-full border-black  border-2'
                                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getImage/${item.product.filename}`}
                                                    alt={item.product.ProductName}
                                                />
                                            </Link>
                                            <Link href={`products/details/${item.product.id}`} className='transition duration-300 hover:scale-105'>
                                                <h2 className="text-xl font-semibold">{item.product.name}</h2>
                                                <p>{item.product.description}</p>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className={`ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? 'Removing...' : 'Remove'}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No items in your wishlist.</p>
                        )}
            </div>
            <Footer />
        </>
    );
};

export default WishList;
