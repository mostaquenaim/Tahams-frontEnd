import NavbarCompTwo from '../../components/Header/NavbarComp';
import Footer from '../../components/Footer/Footer';
import { FaFilter, FaShoppingCart } from 'react-icons/fa';
import { Fragment, useContext, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { useRouter } from 'next/router';

const Product = ({ product, sizes }) => {
    console.log(product);
    const [isAddedToWishlist, setAddedToWishlist] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedImage, setSelectedImage] = useState(product.filename)
    const [quantity, setQuantity] = useState(1);
    const [isAddedToCart, setIsAddedToCart] = useState(false)
    const { user } = useContext(AuthContext)
    console.log(user, "17");
    const router = useRouter()

    console.log(product);
    const {
        sellingPrice,
        filename,
        discountPercentage,
        description,
        longDescription,
        ifStock,
        name,
        vatPercentage,
        color,
    } = product;

    const addToWishlist = () => {
        // Implement logic to add the product to the user's wishlist
        // For example, you can make an API call or update the state
        setAddedToWishlist(!isAddedToWishlist);
    };

    const handleSizeChange = (size) => {
        setSelectedSize(size);
    };

    const handleQuantityDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleQuantityIncrease = () => {
        if (quantity < 30) {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            router.push('/login')
        }

        else {
            setIsAddedToCart(true)
            try {
                // Make a POST request to the backend endpoint for adding to the cart
                const response = await axios.post('http://localhost:3000/admin/add-to-cart', {
                    productId: product.id,
                    size: selectedSize,
                    Quantity: quantity,
                    colorId: color.id,
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
            }
        }
    };


    const handleBuyNow = async () => {
        if (!user) {
            router.push('/login')
        }
        else {
            // setIsAddedToCart(true)
            try {
                // Make a POST request to the backend endpoint for adding to the cart
                const response = await axios.post('http://localhost:3000/admin/add-to-cart', {
                    productId: product.id,
                    size: selectedSize,
                    Quantity: quantity,
                    colorId: color.id,
                    customerEmail: user?.email
                });

                if (response.status >= 200 && response.status <= 205) {
                    // Cart item added successfully
                    console.log('Item added to the cart');
                    router.push('/MyCart')
                    // Show toast notification
                    // toast.success('Item added to the cart', {
                    //     duration: 3000, // Toast will be shown for 3 seconds
                    // });
                } else {
                    // Handle error
                    console.error('Failed to add item to the cart');

                    // Show toast notification for the error
                    toast.error('Failed to buy item');
                }
            } catch (error) {
                console.error('Error:', error);

                // Show toast notification for the error
                toast.error('An error occurred while buying');
            } finally {
                // Set a timer to reset the state after 700 milliseconds
                // setTimeout(() => {
                //     setIsAddedToCart(false);
                // }, 700);
            }
        }
    };


    return (
        <div className="">
            <NavbarCompTwo />
            <div className="container mx-auto p-4 min-h-screen pt-20 lg:pt-48 pb-10">
                <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="md:w-1/2">
                        <img
                            src={`http://localhost:3000/admin/getimage/${selectedImage}`}
                            alt={name}
                            className="md:h-[500px] md:w-96 lg:h-[600px] lg:w-[500px] max-h-screen rounded mb-5 relative"
                        />
                        <div className='flex gap-4'>
                            <input
                                type="radio"
                                id={`main-image`}
                                name="productImage"
                                value={`http://localhost:3000/admin/getimage/${filename}`}
                                className="hidden"
                                defaultChecked // Ensures that the first image is initially selected
                                onChange={() => setSelectedImage(filename)}
                            />
                            <label htmlFor={`main-image`} className="relative">
                                <img
                                    src={`http://localhost:3000/admin/getimage/${filename}`}
                                    alt={name}
                                    className="h-24 w-24 cursor-pointer"
                                />
                                {selectedImage === filename && (
                                    <div className="overlay bg-white opacity-50 absolute top-0 left-0 w-full h-full"></div>
                                )}
                            </label>
                            {
                                product.productPictures.length > 0 &&
                                product.productPictures.map((pp, idx) => (
                                    <Fragment key={idx}>
                                        <input
                                            type="radio"
                                            id={`thumbnail-image-${idx}`}
                                            name="productImage"
                                            value={`http://localhost:3000/admin/getimage/${pp.filename}`}
                                            className="hidden"
                                            onChange={() => setSelectedImage(pp.filename)}
                                        />
                                        <label htmlFor={`thumbnail-image-${idx}`} className="relative">
                                            <img
                                                src={`http://localhost:3000/admin/getimage/${pp.filename}`}
                                                alt={name}
                                                className="h-24 w-24 cursor-pointer"
                                            />
                                            {selectedImage === pp.filename && (
                                                <div className="overlay bg-white opacity-50 absolute top-0 left-0 w-full h-full"></div>
                                            )}
                                        </label>
                                    </Fragment>
                                ))
                            }
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="md:w-1/2 p-4">
                        <h1 className="text-2xl font-bold mb-2">{name}</h1>

                        {/* Wishlist Icon */}
                        <div className="mb-2">
                            <button
                                className={`text-xl ${isAddedToWishlist ? 'text-red-500' : 'text-gray-500'}`}
                                onClick={addToWishlist}
                            >
                                {isAddedToWishlist ? <FaHeart /> : <FaRegHeart />}
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">{description}</p>
                        <p className="text-green-600 text-lg mb-2">{sellingPrice} BDT</p>

                        {/* Discount */}
                        {discountPercentage > 0 && (
                            <p className="text-red-500 line-through mb-2">
                                {sellingPrice + (sellingPrice * discountPercentage) / 100} BDT
                            </p>
                        )}

                        {/* Stock Status */}
                        <p className={`mb-2 ${ifStock ? 'text-green-500' : 'text-red-500'}`}>
                            {ifStock ? 'In Stock' : 'Out of Stock'}
                        </p>

                        {/* VAT */}
                        <p className="text-gray-600 mb-4">VAT: {vatPercentage}%</p>

                        {/* Color Information */}
                        {color && (
                            <div className="mb-4">
                                <p className="text-gray-600 font-semibold">Color:</p>
                                <div
                                    className="p-5 w-32 rounded-full text-center border-black border-2"
                                    style={{ backgroundColor: color.colorCode }}
                                >
                                    <span className={`text-black text-center ${color.colorCode === '#000000' && 'text-white'}`}>{color.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {sizes && sizes.length > 0 && (
                            <div className="mb-4">
                                <label className="text-gray-600 font-semibold">Select Size:</label>
                                <div className="flex gap-3 flex-wrap">
                                    {sizes.map((size) => (
                                        <button
                                            key={size.id}
                                            className={`btn btn-outline ${selectedSize === size.name ? 'bg-black text-white' : 'bg-white text-black'
                                                } border-black text-black`}
                                            onClick={() => handleSizeChange(size.name)}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selection */}
                        <div className="mb-4">
                            <label className="text-gray-600 font-semibold">Quantity:</label>
                            <div className="flex space-x-2 items-center">
                                <button
                                    className="btn btn-outline"
                                    onClick={handleQuantityDecrease}
                                >
                                    -
                                </button>
                                <span>{quantity}</span>
                                <button
                                    className="btn btn-outline"
                                    onClick={handleQuantityIncrease}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart and Buy Now Buttons */}
                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                            <button
                                className={`btn btn-primary ${isAddedToCart ? 'btn-disabled' : 'bg-black text-white hover:scale-105 duration-300 hover:shadow-lg hover:shadow-black'}`}
                                onClick={handleAddToCart}
                            >
                                <FaShoppingCart /> Add to Cart
                            </button>
                            <button
                                className="btn btn-accent bg-black text-white hover:scale-105 duration-300 hover:shadow-lg hover:shadow-black"
                                onClick={handleBuyNow}
                            >
                                🛍️ Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Long Description */}
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">More about this product</h2>
                    <div className="prose prose-lg">
                        {/* Render long description content */}
                        {longDescription}
                    </div>
                </div>

            </div>
            <Footer />
            <Toaster />
        </div>
    );
};

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;

    try {
        const response = await fetch(`http://localhost:3000/admin/getProductById/${id}`);
        const product = await response.json();

        const result = await fetch(`http://localhost:3000/admin/view-product-sizes`);
        const sizes = await result.json();

        return {
            props: {
                product,
                sizes,
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        // Return an empty object if there's an error
        return {
            props: {},
        };
    }
}

export default Product;
