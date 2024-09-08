import { Fragment, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaFilter, FaShoppingCart } from 'react-icons/fa';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import toast, { Toaster } from 'react-hot-toast';
import NavbarCompTwo from '/components/Header/NavbarComp';
import Footer from '/components/Footer/Footer';
import useAxiosPublic from '../../../Hooks/useAxiosPublic'
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';

const Product = ({ product }) => {
    // console.log('product',product);
    const [isAddedToWishlist, setAddedToWishlist] = useState(false);
    const [showGotoCart, setShowGotoCart] = useState(false)
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedCategory, setSelectedCategory] = useState();
    const [selectedImage, setSelectedImage] = useState(product && product.filename)
    const [quantity, setQuantity] = useState(1);
    const [isAddedToCart, setIsAddedToCart] = useState(false)
    const { user } = useContext(AuthContext)
    const [userInfo, setUserInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const axiosPublic = useAxiosPublic();

    const viewCount = async () => {
        // console.log(user);
        const result = await axiosPublic.post(`/admin/increase-product-view/${product.id}?email=${user?.email}`)

        // console.log(result);
    }

    useEffect(() => {
        user &&
            viewCount()
    }, [user, product])

    const checkIfWished = async (productId, customerId) => {
        setLoading(true)
        try {
            const result = await axiosPublic.get(`admin/check-wish-by-user-and-product`, {
                params: {
                    productId: productId,
                    customerId: customerId
                }
            });

            console.log(result);

            // console.log(result.data);
            setAddedToWishlist(result.data.wished)
        } catch (error) {
            console.error('Error checking wish:', error);
            // Handle the error accordingly
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUserInfo(storedUserInfo);
    }, [])

    useEffect(() => {
        // console.log(product,userInfo);
        // Scroll to top of the page
        window.scrollTo(0, 100);

        // Check if the user has added the product to the wishlist
        if (product && userInfo) {
            checkIfWished(product.id, userInfo.id);
        }

        // Set default selected category and size
        if (product.pscs.length > 0) {
            setSelectedCategory(product.pscs[0].category.id);
            setSelectedSize(product.pscs[0].size?.name);
        }
    }, [product, userInfo]);

    useEffect(() => {
        const defaultCategoryId = parseInt(localStorage.getItem('defaultCategoryId'));
        if (defaultCategoryId) {
            handleCategoryChange(defaultCategoryId);
        }
    }, []);

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

    const uniqueCategories = [...new Map(product.pscs.map(p => [p.category.id, p.category])).values()];

    const filteredSizes = selectedCategory
        ? product.pscs
            .filter(p => p.category.id === selectedCategory && p.quantity > 0)
            .map(p => p.size)
        : [];

    const addToWishlist = async () => {
        const formData = new FormData();

        formData.append('productId', product.id);
        formData.append('customerEmail', userInfo && userInfo.email);

        if (!isAddedToWishlist) {
            try {
                // Make a POST request to add the product to the wishlist
                const res = await axiosPublic.post(`/admin/add-Wish`, formData);
                // console.log(res.data);
                // Add the product to the wishlist
                checkIfWished()
            } catch (error) {
                console.error('Error adding product to wishlist:', error);
                // Handle error if the request fails
            }
        }
        else {
            try {
                const res = await axiosPublic.delete(`/admin/remove-wish`, formData);
                checkIfWished()

            } catch (error) {
                console.error('Error deleting wishlist:', error);
            }
        }
    };

    const handleSizeChange = (size) => {
        setSelectedSize(size);
        setQuantity(1)
    };

    const handleCategoryChange = (categoryId) => {
        console.log(categoryId, 'catid');
        setSelectedCategory(categoryId);
        const firstSize = product.pscs.find(p => p.category.id == categoryId)?.size?.name;
        setSelectedSize(firstSize);
        setQuantity(1);
    };

    const handleQuantityDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleQuantityIncrease = () => {
        product.pscs.map((item) => {
            if (item.category.id === selectedCategory && item.size?.name === selectedSize) {
                if (item.quantity > quantity && quantity < 30) {
                    setQuantity(quantity + 1);
                }
                else {
                    toast.error('Sorry! You cannot add more than that')
                }
            }
        })
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('You must login first')
            router.push('/login')
        }

        else {
            setIsAddedToCart(true)
            setShowGotoCart(true)
            try {
                // Make a POST request to the backend endpoint for adding to the cart
                const response = await axiosPublic.post('/admin/add-to-cart', {
                    productId: product.id,
                    category: selectedCategory,
                    size: selectedSize,
                    Quantity: quantity,
                    colorId: color.id,
                    customerEmail: user?.email
                });

                if (response.status >= 200 && response.status <= 205) {
                    // Cart item added successfully
                    // console.log('Item added to the cart');

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
                    setShowGotoCart(false);
                }, 3000);
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
                const response = await axiosPublic.post('/admin/add-to-cart', {
                    productId: product.id,
                    category: selectedCategory,
                    size: selectedSize,
                    Quantity: quantity,
                    colorId: color.id,
                    customerEmail: user?.email
                });

                // console.log(response.data);

                if (response.status >= 200 && response.status <= 205) {
                    localStorage.setItem('selectedItems', JSON.stringify([response.data]));

                    router.push({
                        pathname: '/buy-now',
                    });
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
            {/* <NavbarCompTwo /> */}
            <div className="container mx-auto p-4 min-h-screen pt-20 lg:pt-48 pb-10">
                <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="md:w-1/2">
                        <img
                            src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${selectedImage}`}
                            alt={name}
                            className="md:h-96 md:w-96 lg:h-[600px] lg:w-[600px] max-h-screen rounded mb-5 relative"
                        />
                        <div className='flex gap-4'>
                            <input
                                type="radio"
                                id={`main-image`}
                                name="productImage"
                                value={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`}
                                className="hidden"
                                defaultChecked // Ensures that the first image is initially selected
                                onChange={() => setSelectedImage(filename)}
                            />
                            <label htmlFor={`main-image`} className="relative">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`}
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
                                            value={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${pp.filename}`}
                                            className="hidden"
                                            onChange={() => setSelectedImage(pp.filename)}
                                        />
                                        <label htmlFor={`thumbnail-image-${idx}`} className="relative">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${pp.filename}`}
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
                        {
                            !loading ?
                                <div className="mb-2">
                                    <button
                                        className={`text-xl ${isAddedToWishlist ? 'text-red-500' : 'text-gray-500'}`}
                                        onClick={addToWishlist}
                                    >
                                        {isAddedToWishlist ? <FaHeart /> : <FaRegHeart />}
                                    </button>
                                </div>
                                :
                                <span className='loading loading-spinner loading-md'></span>
                        }

                        {/* description  */}
                        <div className="prose prose-lg" style={{ whiteSpace: 'pre-line' }}>
                            {description}
                        </div>

                        {/* price  */}
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

                        {/* Category Dropdown */}
                        <div className="mb-4">
                            <label htmlFor="category" className="block text-gray-700">Category</label>
                            <select
                                id="category"
                                className="mt-1 block w-full p-2 border rounded"
                                value={selectedCategory || ''}
                                onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
                            >
                                {uniqueCategories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.category.category.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Size Selection */}
                        {filteredSizes && filteredSizes.length > 0 && (
                            <div className="mb-4">
                                <label className="text-gray-600 font-semibold">Select Size:</label>
                                <div className="flex gap-3 flex-wrap">
                                    {filteredSizes.map((size) => (
                                        <button
                                            key={size?.id}
                                            className={`btn btn-outline ${selectedSize === size?.name ? 'bg-black text-white' : 'bg-white text-black'} border-black text-black`}
                                            onClick={() => handleSizeChange(size?.name)}
                                        >
                                            {size?.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center mb-4">
                            <label htmlFor="quantity" className="block text-gray-700 mr-4">Quantity</label>
                            <button
                                className="px-2 py-1 border rounded-l bg-gray-200"
                                onClick={handleQuantityDecrease}
                            >
                                -
                            </button>
                            <input
                                id="quantity"
                                type="text"
                                className="w-12 text-center border-t border-b"
                                value={quantity}
                                readOnly
                            />
                            <button
                                className="px-2 py-1 border rounded-r bg-gray-200"
                                onClick={handleQuantityIncrease}
                            >
                                +
                            </button>
                        </div>

                        {/* Add to Cart and Buy Now Buttons */}
                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                            <button
                                className={`btn btn-primary ${isAddedToCart || (userInfo && userInfo.role == 'admin') ? 'btn-disabled' : 'bg-black text-white hover:scale-105 duration-300 hover:shadow-lg hover:shadow-black'}`}
                                onClick={handleAddToCart}
                            >
                                <FaShoppingCart /> Add to Cart
                            </button>
                            <button
                                className={`btn btn-accent ${(userInfo && userInfo.role == 'admin') ? 'btn-disabled' : 'bg-black text-white hover:scale-105 duration-300 hover:shadow-lg hover:shadow-black'}`}
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
                    <div className="prose prose-lg" style={{ whiteSpace: 'pre-line' }}>
                        {longDescription}
                    </div>
                </div>

            </div>
            {
                // showGotoCart &&
                <Link
                    href={'/MyCart'}
                    className={` w-full h-20 bg-slate-700 hover:bg-black text-center flex justify-center items-center text-white text-xl sticky bottom-0 ${!showGotoCart && 'pointer-events-none opacity-0 transition duration-700'}`}
                >Go to cart
                </Link>
            }
          {/* <Footer /> */} 
            <Toaster />
        </div>
    );
};

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/admin/get-product-by-id/${id}`);

        if (!response.ok) {
            // If the response is not ok, throw an error to be caught below
            throw new Error('Product not found');
        }

        const product = await response.json();

        return {
            props: {
                product,
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        // Option 1: Redirect to a custom 404 page
        return {
            notFound: true,
        };

        // Option 2: Pass an error prop to display a message on the page
        // return {
        //     props: {
        //         error: 'Product not found',
        //     },
        // };
    }
}


export default Product;
