import axios from "axios";
import { useContext, useEffect, useState } from "react";
import CartButton from "../Buttons/CartButton";
import { FaCartShopping, FaDisplay, FaEye } from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "/Contexts/Auth/AuthProvider";
import toast from "react-hot-toast";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { getGuestCustomerInfo } from "../../utils/guestCustomer";
import { FaHeart } from "react-icons/fa";

const ShowProductSmall = ({ item }) => {
    // console.log(item,'atimm');
    const router = useRouter()
    const { user, setShowGotoCart } = useContext(AuthContext)
    const [userInfo, setUserInfo] = useState(null)

    const [isAddedToCart, setIsAddedToCart] = useState(false)
    // const [showGotoCart, setShowGotoCart] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [hoveredWish, setHoveredWish] = useState(false)
    const [hoveredImage, setHoveredImage] = useState('')
    const [ftImage, setFtImage] = useState('https://static-01.daraz.com.bd/p/13e6157acd98dfb45b8f2c9de90fe6bd.jpg')

    const { sellingPrice, discountPercentage, id, filename, ifStock } = item
    const discountedPrice = parseInt(sellingPrice * (100 - discountPercentage) / 100)

    const image = `/admin/get-ft-photo-by-product-id/${id}`

    const axiosPublic = useAxiosPublic()

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userInfo'))
        setUserInfo(storedData)

        axiosPublic.get(image)
            .then(res => {
                setFtImage(res.data.filename)
            })
    }, [])

    const handleAddToCart = async () => {
        let customEmail = user?.email || '';

        if (!user) {
            const guestCustomerInfo = getGuestCustomerInfo();
            customEmail = guestCustomerInfo.email;
        }

        try {
            // Make a POST request to the backend for adding to the cart
            const response = await axiosPublic.post('/admin/add-to-cart', {
                productId: item.id,
                size: item.pscs[0].size.name,
                category: item.pscs[0].category.id,
                Quantity: item.pscs[0].quantity > 0 ? 1 : 0,
                colorId: item.color?.id,
                customerEmail: customEmail, // Use guest or logged-in user email
            });

            if (response.status >= 200 && response.status <= 205) {
                localStorage.setItem('selectedItems', JSON.stringify([response.data]));

                // Redirect to the buy-now page
                router.push({
                    pathname: '/buy-now',
                });

                toast.success('Item added to the cart', { duration: 3000 });
            } else {
                toast.error('Failed to buy now');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred while adding to the cart');
        }
        // finally {
        //     setTimeout(() => setIsAddedToCart(false), 700);
        //     setTimeout(() => setShowGotoCart(false), 4000);
        // }
    };

    const handleMouseEnter = () => {
        // Set the source of the first image in productPictures as the hoveredImage
        if (item.productPictures.length > 0) {
            // console.log(item.productPictures[0].filename);
            setHovered(true);
            setHoveredImage(item.productPictures[0].filename);
        }
        setHoveredWish(true)
    };

    const handleMouseLeave = () => {
        setHovered(false);
        setHoveredWish(false)
    };

    const handleProductClick = () => {
        const url = new URL(window.location.href);
        const CatId = url.pathname.split('/').pop();
        console.log(CatId);
        localStorage.setItem('defaultCategoryId', CatId);
        router.push(`/products/details/${id}`)
    }

    const imageStyle = 'rounded-t-md absolute transition-all duration-300 ease-in-out'
    const subShow = 'opacity-0 scale-105'
    const mainShow = 'opacity-100 scale-100'

    const cardBtnStyle = 'bg-black text-white duration-300 hover:shadow-lg hover:shadow-black hover:scale-105 hover:-translate-y-1'

    return (
        <>
            <div className="flex flex-col items-center pb-4 border rounded-md bg-base-100 shadow-sm w-32 md:w-44 hover:shadow-slate-400">

                {/* image  */}
                <div
                    onClick={handleProductClick}
                    className="relative cursor-pointer h-40 w-32 md:h-44 md:w-36 overflow-hidden rounded-t-md flex items-center"
                >
                    {[
                        {
                            src: `${process.env.NEXT_PUBLIC_API}/admin/getImage/${item.filename}`, //main image
                            visible: !hovered,
                        },
                        {
                            src: `${process.env.NEXT_PUBLIC_API}/admin/getImage/${item.productPictures[0]?.filename}`, //sub image
                            visible: hovered,
                        },
                    ].map((img, index) => (
                        <img
                            key={index}
                            src={img.src}
                            alt={item.name}
                            className={`${imageStyle} ${img.visible ? mainShow : subShow}`}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}

                    {/* Wishlist Icon */}
                    {/* {hoveredWish && (
                        <button
                            className="absolute top-10 right-1 bg-white rounded-full p-1 shadow hover:scale-110 transition"
                            onClick={(e) => {
                                toast.success("Added to wishlist");
                                // handleWishList(item); // ← if you have a handler
                            }}
                        >
                            <FaHeart className="text-red-500 text-sm" />
                        </button>
                    )} */}

                    {/* Out of Stock Badge */}
                    {!ifStock && <img src="/out-of-stock.png" className="absolute top-0 left-0 w-24" />}

                </div>


                {/* text and rest part  */}
                <div className="flex flex-col items-center text-center justify-center gap-2 px-2 py-1">
                    <h2 className="text-xs md:text-sm font-semibold">{item.name}</h2>
                    <div className="flex gap-2 items-center text-xs">
                        {discountPercentage > 0 && (
                            <p className="line-through text-red-500">{sellingPrice} BDT</p>
                        )}
                        <p className="text-green-600 font-medium">{discountedPrice} BDT</p>
                    </div>
                    <div className="flex gap-1 justify-center items-center">
                        {/* <button
                            onClick={handleAddToCart}
                            className={`btn btn-xs btn-primary ${isAddedToCart || (userInfo && userInfo.role === 'admin') ? 'btn-disabled' : ''}`}
                        >
                            <FaCartShopping />
                        </button>
                        <button
                            onClick={handleProductClick}
                            className="btn btn-xs btn-accent"
                        >
                            <FaEye />

                        </button> */}
                        <button
                            className={`btn btn-xs btn-accent ${(userInfo && userInfo.role == 'admin') ? 'btn-disabled' : 'bg-black text-white hover:scale-105 duration-300 hover:shadow-lg hover:shadow-black'}`}
                            onClick={handleAddToCart}
                        >
                            🛍️ Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

};

export default ShowProductSmall;