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
    // console.log(wish,'wish');
    const [isDeleting, setIsDeleting] = useState(false);
    const [userInfo, setUserInfo] = useState(null)

    useEffect(() => {
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'))
        setUserInfo(storedUserInfo)
    }, [])

    const handleDelete = async (item) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const formData = new FormData();
        // console.log(item);

        formData.append('productId', item.product.id);
        formData.append('customerId', userInfo && userInfo.id);

        if (userInfo) {
            setIsDeleting(true);
            try {
                await axiosPublic.delete(`admin/remove-wish/${item.product.id}?email=${user?.email}`);
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
            {/* <NavbarCompTwo /> */}
            <div className="container mx-auto p-4 min-h-screen md:p-6 lg:p-8 xl:p-10">
                <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-4 lg:pt-40 pt-16 flex text-center items-center justify-center">Your Wishlist</h1>
                {
                    loading
                        ?
                        <span className='loading loading-spinner loading-md'></span>
                        :
                        wish && wish.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {wish.map((item) => (
                                    <div key={item.id} className="bg-white rounded shadow-md p-4">
                                        <Link href={`products/details/${item.product.id}`} className="transition duration-300 hover:scale-105">
                                            <img
                                                className="w-full h-40 object-cover rounded-t-md"
                                                src={`${process.env.NEXT_PUBLIC_API}/admin/getImage/${item.product.filename}`}
                                                alt={item.product.ProductName}
                                            />
                                        </Link>
                                        <div className="p-4">
                                            <Link href={`products/details/${item.product.id}`} className="transition duration-300 hover:scale-105">
                                                <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold">{item.product.name}</h2>
                                                <p className="text-xs md:text-sm lg:text-base xl:text-lg">{item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage)} BDT</p>
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Removing...' : 'Remove'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No items in your wishlist.</p>
                        )
                }
            </div>
        </>
    );
};

export default WishList;