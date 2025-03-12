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

const ShowProduct = ({ item }) => {
    // console.log(item);
    const router = useRouter()
    const { user, setShowGotoCart } = useContext(AuthContext)
    const [userInfo, setUserInfo] = useState(null)

    const [isAddedToCart, setIsAddedToCart] = useState(false)
    // const [showGotoCart, setShowGotoCart] = useState(false)
    const [hovered, setHovered] = useState(false)
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

        setIsAddedToCart(true);
        setShowGotoCart(true);
        localStorage.setItem('showGotoCart', true);

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
                toast.success('Item added to the cart', { duration: 3000 });
            } else {
                toast.error('Failed to add item to the cart');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred while adding to the cart');
        } finally {
            setTimeout(() => setIsAddedToCart(false), 700);
            setTimeout(() => setShowGotoCart(false), 4000);
        }
    };

    const handleMouseEnter = () => {
        // Set the source of the first image in productPictures as the hoveredImage
        if (item.productPictures.length > 0) {
            setHovered(true);
            setHoveredImage(item.productPictures[0].filename);
        }
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    const handleProductClick = () => {
        const url = new URL(window.location.href);
        const CatId = url.pathname.split('/').pop();
        console.log(CatId);
        localStorage.setItem('defaultCategoryId', CatId);
        router.push(`/products/details/${id}`)
    }

    const cardBtnStyle = 'bg-black text-white duration-300 hover:shadow-lg hover:shadow-black hover:scale-105 hover:-translate-y-1'

    return (
        <>
            <div className="flex flex-col items-center pb-7 border-r-2 border-b-2 rounded-lg bg-base-100 shadow-md">
                <div onClick={handleProductClick} className="relative cursor-pointer h-56 w-56 md:h-80 md:w-80 lg:w-72 lg:h-72 xl:w-72 xl:h-72" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <img src={`${process.env.NEXT_PUBLIC_API}/admin/getImage/${hovered ? hoveredImage : item.filename}`} alt={item.name} className="rounded-t-lg w-56 h-56 md:h-80 md:w-80 lg:w-72 lg:h-72 xl:w-72 xl:h-72" />
                    {!ifStock && <img src="/out-of-stock.png" className="absolute top-0 left-0 w-48" />}
                </div>
                <div className="flex flex-col items-center text-center justify-center gap-3">
                    <h2 className="card-title">{item.name}</h2>
                    <div className="flex gap-3">
                        {
                            discountPercentage > 0 &&
                            <p className="line-through text-red-500">{sellingPrice} BDT</p>
                        }
                        <p className="text-green-600 font-semibold">{discountedPrice} BDT</p>
                    </div>
                    <div className="card-actions flex justify-center items-center lg:justify-end lg:flex-row">
                        <button
                            onClick={handleAddToCart}
                            className={`btn btn-sm btn-primary ${cardBtnStyle} ${isAddedToCart || (userInfo && userInfo.role === 'admin') ? 'btn-disabled' : 'btn-primary'}`}
                        >
                            <FaCartShopping></FaCartShopping> Add to Cart
                        </button>
                        {/* <Link href={`details/${id}`}> */}
                        <button onClick={handleProductClick} className={`btn btn-sm btn-accent ${cardBtnStyle}`}>
                            <FaEye /> View
                        </button>
                        {/* </Link> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShowProduct;