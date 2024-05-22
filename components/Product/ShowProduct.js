import axios from "axios";
import { useContext, useEffect, useState } from "react";
import CartButton from "../Buttons/CartButton";
import { FaCartShopping, FaDisplay, FaEye } from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "/Contexts/Auth/AuthProvider";
import toast from "react-hot-toast";

const ShowProduct = ({ item }) => {
    console.log(item);
    const router = useRouter()
    const { user, setShowGotoCart } = useContext(AuthContext)

    const [isAddedToCart, setIsAddedToCart] = useState(false)
    // const [showGotoCart, setShowGotoCart] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [hoveredImage, setHoveredImage] = useState('')
    const [ftImage, setFtImage] = useState('https://static-01.daraz.com.bd/p/13e6157acd98dfb45b8f2c9de90fe6bd.jpg')

    const { sellingPrice, discountPercentage, id, filename, ifStock } = item
    const discountedPrice = sellingPrice * (100 - discountPercentage) / 100

    const image = `https://api.tahamsbd.com/admin/get-ft-photo-by-product-id/${id}`

    useEffect(() => {
        axios.get(image)
            .then(res => {
                setFtImage(res.data.filename)
            })
    }, [])

    const handleAddToCart = async () => {
        if (user) {
            setIsAddedToCart(true)
            setShowGotoCart(true)
            localStorage.setItem('showGotoCart', true)
            try {
                // Make a POST request to the backend endpoint for adding to the cart
                const response = await axios.post('https://api.tahamsbd.com/admin/add-to-cart', {
                    productId: item.id,
                    size: 'S',
                    Quantity: 1,
                    colorId: item.color.id,
                    customerEmail: user?.email
                });

                if (response.status >= 200 && response.status <= 205) {
                    // Cart item added successfully
                    console.log('Item added to the cart');

                    // Show toast notification
                    toast.success('Item added to the cart', {
                        duration: 3000, // Toast will be shown for 3 seconds
                    });
                } else {
                    // Handle error
                    console.error('Failed to add item to the cart');

                    // Show toast notification for the error
                    toast.error('Failed to add item to the cart');
                }
            } catch (error) {
                console.error('Error:', error);

                // Show toast notification for the error
                toast.error('An error occurred while adding to the cart');
            } finally {
                // Set a timer to reset the state after 700 milliseconds
                setTimeout(() => {
                    setIsAddedToCart(false);
                }, 700);
                setTimeout(() => {
                    // localStorage.removeItem('showGotoCart')
                    setShowGotoCart(false)
                }, 4000);
            }
        }
        else {
            console.log("in 67");
            router.push('/login')
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

    const cardBtnStyle = 'bg-black text-white duration-300 hover:shadow-lg hover:shadow-black hover:scale-105 hover:-translate-y-1'

    return (
        <>
            <div className="flex flex-col items-center pb-7 border-r-2 border-b-2 rounded-lg bg-base-100 shadow-md">
                <Link href={`details/${id}`} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <img src={`https://api.tahamsbd.com/admin/getImage/${hovered ? hoveredImage : item.filename}`} alt={item.name} className="rounded-t-lg" />
                    {!ifStock && <img src="/out-of-stock.png" className="absolute top-0 left-0 w-48" />}
                </Link>
                <div className="flex flex-col items-center text-center justify-center gap-3">
                    <h2 className="card-title">{item.name}</h2>
                    <div className="flex gap-3">
                        {
                            discountPercentage > 0 &&
                            <p className="line-through text-red-500">{sellingPrice} BDT</p>
                        }
                        <p className="text-neutral">{discountedPrice} BDT</p>
                    </div>
                    <div className="card-actions justify-end">
                        <button
                            onClick={handleAddToCart}
                            className={`btn btn-sm btn-primary ${cardBtnStyle} ${isAddedToCart ? 'btn-disabled' : 'btn-primary'}`}
                        >
                            <FaCartShopping></FaCartShopping> Add to Cart
                        </button>
                        <Link href={`details/${id}`}>
                            <button className={`btn btn-sm btn-accent ${cardBtnStyle}`}>
                                <FaEye /> View
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            
        </>
    );
};

export default ShowProduct;