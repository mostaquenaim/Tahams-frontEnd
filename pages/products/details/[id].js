import { Fragment, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaEye, FaShoppingCart } from 'react-icons/fa';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import toast, { Toaster } from 'react-hot-toast';
import useAxiosPublic from '../../../Hooks/useAxiosPublic'
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import ImageZoom from '../../draft/image-zoom-inner';
import { getGuestCustomerInfo } from '../../../utils/guestCustomer';
import Head from 'next/head';
import Loading from '/components/Loading';

const Product = ({ product }) => {
    // console.log('product-test', product);
    const [isAddedToWishlist, setAddedToWishlist] = useState(false);
    const [showGotoCart, setShowGotoCart] = useState(false)
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedMaleSize, setSelectedMaleSize] = useState('');
    const [selectedFemaleSize, setSelectedFemaleSize] = useState('');
    const [selectedCategory, setSelectedCategory] = useState();
    const [selectedImage, setSelectedImage] = useState('')
    const [quantity, setQuantity] = useState(1);
    const [isAddedToCart, setIsAddedToCart] = useState(false)
    const { user } = useContext(AuthContext)
    const [userInfo, setUserInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const axiosPublic = useAxiosPublic();

    const viewCount = async () => {
        // console.log('line 32');
        const customerEmail = user?.email || getGuestCustomerInfo()?.email;

        const item = {
            item_id: product.id,
            item_name: product.name,
            item_color: product.color?.name || "Unknown",
            item_series: product.pscs?.[0]?.category?.category?.category?.name || "N/A",
            main_category: product.pscs?.[0]?.category?.category?.name || "N/A",
            sub_category: product.pscs?.[0]?.category?.name || "N/A",
            item_price: parseInt(product.sellingPrice - (product.sellingPrice * product.discountPercentage / 100) + (product.sellingPrice * product.vatPercentage / 100)) * quantity || 0,
            total_views: product.totalViews || 0,
            discount_percent: product.discountPercentage || 0,
            currency: "BDT",
            // quantity: 1,
            user_email: customerEmail
        };

        // Pushing data to dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: "view_item",
            ecommerce: {
                items: [item]
            }
        });

        try {
            await axiosPublic.post(`/admin/increase-product-view/${product.id}?email=${customerEmail}`);
        } catch (error) {
            console.error("Error updating view count:", error);
        }
    };

    useEffect(() => {
        setSelectedImage(product && product.filename)
    }, [product])

    useEffect(() => {
        viewCount()
    }, [])

    const checkIfWished = async (productId, customerEmail) => {
        setLoading(true)
        try {
            const result = await axiosPublic.get(`admin/check-wish-by-user-and-product`, {
                params: {
                    productId: productId,
                    customerEmail: customerEmail
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
        // Scroll to top of the page
        window.scrollTo(0, 100);

        // Check if the user has added the product to the wishlist
        if (product && userInfo) {
            checkIfWished(product.id, userInfo.email);
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

    // console.log(product, 'product');
    const {
        sellingPrice,
        filename,
        discountPercentage,
        description,
        longDescription,
        ifStock,
        name,
        vatPercentage,
        totalViews,
        color,
    } = product;

    const uniqueCategories = [...new Map(product.pscs.map(p => [p.category.id, p.category])).values()];

    const filteredSizes = selectedCategory
        ? product.pscs
            .filter(p => p.category.id === selectedCategory && p.quantity > 0)
            .map(p => p.size)
        : [];

    const addToWishlist = async () => {
        let customEmail = ''
        if (!user) {
            const guestCustomerInfo = getGuestCustomerInfo();
            customEmail = guestCustomerInfo.email;
        }
        else {
            // console.log('acheee');
            customEmail = user?.email
        }

        if (!isAddedToWishlist) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "add_to_wish",
                ecommerce: {
                    items: [
                        {
                            item_id: product.id,
                            item_name: product.name,
                            item_color: product.color?.name || "Unknown",
                            item_series: product.pscs?.[0]?.category?.category?.category?.name || "N/A",
                            main_category: product.pscs?.[0]?.category?.category?.name || "N/A",
                            sub_category: product.pscs?.[0]?.category?.name || "N/A",
                            item_price: parseInt(product.sellingPrice - (product.sellingPrice * product.discountPercentage / 100) + (product.sellingPrice * product.vatPercentage / 100)) * quantity || 0,
                            total_views: product.totalViews || 0,
                            discount_percent: product.discountPercentage || 0,
                            currency: "BDT",
                            // quantity: 1,
                            user_email: customEmail
                        }
                    ]
                }
            });

            try {
                // Make a POST request to add the product to the wishlist
                // console.log(customEmail, 'csrmm');
                const res = await axiosPublic.post(`/admin/add-Wish`, {
                    productId: product?.id,
                    customerEmail: customEmail
                });
                // Add the product to the wishlist
                if (product && userInfo) {
                    checkIfWished(product.id, userInfo.email);
                }
            } catch (error) {
                console.error('Error adding product to wishlist:', error);
                // Handle error if the request fails
            }
        }
        else {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "remove_from_wish",
                ecommerce: {
                    items: [
                        {
                            item_id: product.id,
                            item_name: product.name,
                            item_color: product.color?.name || "Unknown",
                            item_series: product.pscs?.[0]?.category?.category?.category?.name || "N/A",
                            main_category: product.pscs?.[0]?.category?.category?.name || "N/A",
                            sub_category: product.pscs?.[0]?.category?.name || "N/A",
                            item_price: parseInt(product.sellingPrice - (product.sellingPrice * product.discountPercentage / 100) + (product.sellingPrice * product.vatPercentage / 100)) * quantity || 0,
                            total_views: product.totalViews || 0,
                            discount_percent: product.discountPercentage || 0,
                            currency: "BDT",
                            // quantity: 1,
                            user_email: customEmail
                        }
                    ]
                }
            });

            try {
                const res = await axiosPublic.delete(`/admin/remove-wish/${product.id}?email=${customEmail}`);
                if (product && userInfo) {
                    checkIfWished(product.id, userInfo.email);
                }

            } catch (error) {
                console.error('Error deleting wishlist:', error);
            }
        }
    };

    const handleSizeChange = (size) => {
        setSelectedSize(size);
        setQuantity(1)
        if (product.pscs[0].category.category.category.name == 'Couples') {
            setSelectedMaleSize(size)
        }
    };

    const handleFemaleSizeChange = (size) => {
        setSelectedFemaleSize(size);
        setQuantity(1)
    }

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
        let customEmail = ''
        if (!user) {
            const guestCustomerInfo = getGuestCustomerInfo();
            customEmail = guestCustomerInfo.email

            setIsAddedToCart(true)
            setShowGotoCart(true)
            // Use guest customer info for cart addition
            try {
                // Make a POST request to the backend endpoint for adding to the cart
                const response = await axiosPublic.post('/admin/add-to-cart', {
                    productId: product?.id,
                    category: selectedCategory,
                    size: selectedSize,
                    maleSize: selectedMaleSize,
                    femaleSize: selectedFemaleSize,
                    Quantity: quantity,
                    colorId: color?.id,
                    customerEmail: customEmail, // Use guest email
                });

                // console.log(response.data,'cart data');
                localStorage.setItem('defaultCartItem', response.data.id)

                if (response.status >= 200 && response.status <= 205) {
                    // Cart item added successfully
                    toast.success('Item added to the cart', {
                        duration: 3000,
                    });
                } else {
                    // Handle error
                    toast.error('Failed to add item to the cart');
                }
            } catch (error) {
                console.error('Error:', error);
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
        else if (product.pscs[0].category.category.category.name == 'Couples'
            &&
            (!selectedFemaleSize || !selectedSize)
        ) {
            toast.error('You have to select a size for each')
        }
        else {
            customEmail = user?.email

            setIsAddedToCart(true)
            setShowGotoCart(true)
            // console.log(product,color);
            try {
                // Make a POST request to the backend endpoint for adding to the cart
                const response = await axiosPublic.post('/admin/add-to-cart', {
                    productId: product?.id,
                    category: selectedCategory,
                    size: selectedSize,
                    maleSize: selectedMaleSize,
                    femaleSize: selectedFemaleSize,
                    Quantity: quantity,
                    colorId: color?.id,
                    customerEmail: user?.email
                });

                if (response.status >= 200 && response.status <= 205) {
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

        // console.log('come here');
        // console.log(parseInt(product.sellingPrice - (product.sellingPrice * product.discountPercentage / 100) + (product.sellingPrice * product.vatPercentage / 100)) * quantity);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
                items: [
                    {
                        item_id: product.id,
                        item_name: product.name,
                        item_color: product.color?.name || "Unknown",
                        item_series: product.pscs?.[0]?.category?.category?.category?.name || "N/A",
                        main_category: product.pscs?.[0]?.category?.category?.name || "N/A",
                        sub_category: product.pscs?.[0]?.category?.name || "N/A",
                        item_price: parseInt(product.sellingPrice - (product.sellingPrice * product.discountPercentage / 100) + (product.sellingPrice * product.vatPercentage / 100)) * quantity || 0,
                        total_views: product.totalViews || 0,
                        selected_category: selectedCategory,
                        selected_size: selectedSize,
                        selected_maleSize: selectedMaleSize,
                        selected_femaleSize: selectedFemaleSize,
                        discount_percent: product.discountPercentage || 0,
                        currency: "BDT",
                        quantity: quantity,
                        user_email: customEmail
                    }
                ]
            }
        });
    };

    const handleBuyNow = async () => {
        let customEmail = ''
        if (!user) {
            const guestCustomerInfo = getGuestCustomerInfo();
            customEmail = guestCustomerInfo.email

            try {
                // Add product to the cart for the guest customer
                const response = await axiosPublic.post('/admin/add-to-cart', {
                    productId: product?.id,
                    category: selectedCategory,
                    size: selectedSize,
                    maleSize: selectedMaleSize,
                    femaleSize: selectedFemaleSize,
                    Quantity: quantity,
                    colorId: color?.id,
                    customerEmail: customEmail, // Use guest email
                });

                if (response.status >= 200 && response.status <= 205) {
                    localStorage.setItem('selectedItems', JSON.stringify([response.data]));

                    // Redirect to the buy-now page
                    router.push({
                        pathname: '/buy-now',
                    });
                } else {
                    toast.error('Failed to buy item');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('An error occurred while buying');
            }
        } else if (
            product.pscs[0].category.category.category.name === 'Couples' &&
            (!selectedFemaleSize || !selectedSize)
        ) {
            // Ensure sizes are selected for couples' products
            toast.error('You have to select a size for each');
        } else {
            customEmail = user?.email
            try {
                // Add product to the cart for the logged-in user
                const response = await axiosPublic.post('/admin/add-to-cart', {
                    productId: product?.id,
                    category: selectedCategory,
                    size: selectedSize,
                    maleSize: selectedMaleSize,
                    femaleSize: selectedFemaleSize,
                    Quantity: quantity,
                    colorId: color?.id,
                    customerEmail: user?.email, // Use logged-in user's email
                });

                if (response.status >= 200 && response.status <= 205) {
                    localStorage.setItem('selectedItems', JSON.stringify([response.data]));

                    // Redirect to the buy-now page
                    router.push({
                        pathname: '/buy-now',
                    });
                } else {
                    toast.error('Failed to buy item');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('An error occurred while buying');
            }
        }
    };

    return (
        <div>
            <Head>
                <title>{product.name}</title>
            </Head>
            {/* <NavbarCompTwo /> */}
            <div className="container mx-auto p-4 min-h-screen pt-20 lg:pt-48 pb-10">
                <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="md:w-1/2">
                        {
                            selectedImage ?
                                <ImageZoom photo={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${selectedImage}`} />
                                :
                                <Loading />
                        }
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
                                    className="h-32 w-24 cursor-pointer"
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
                                                className="h-32 w-24 cursor-pointer"
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

                        {/* Discount */}
                        {discountPercentage > 0 && (
                            <p className="text-red-500 line-through mb-2">
                                {sellingPrice} BDT
                            </p>
                        )}

                        {/* price  */}
                        <p className="text-green-600 text-lg mb-2">
                            {

                                discountPercentage > 0
                                    ?
                                    <span>{parseInt(sellingPrice * (100 - discountPercentage) / 100)} </span>
                                    :
                                    <span>{sellingPrice} </span>
                            }
                            BDT
                        </p>

                        {/* Stock Status */}
                        <p className={`mb-2 ${ifStock ? 'text-green-500' : 'text-red-500'}`}>
                            {ifStock ? 'In Stock' : 'Out of Stock'}
                        </p>

                        {/* VAT */}
                        <p className="text-gray-600 mb-4">VAT: {vatPercentage}%</p>

                        {/* views */}
                        {
                            userInfo?.role == 'admin'
                            &&
                            <>
                                <button className='btn btn-accent'><FaEye /> {totalViews}</button>
                            </>
                        }

                        {/* Color Information */}
                        {color && (
                            <div className="mb-4">
                                <p className="text-gray-600 font-semibold">Color:</p>
                                <div
                                    className="p-5 w-32 rounded-full text-center border-black border-2"
                                    style={{ backgroundColor: color.colorCode }}
                                >
                                    <span className={`text-black text-center ${color.colorCode === '#000000' && 'text-white'}`}>{color?.name}</span>
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
                                    <option key={category.id} value={category.id}>{category.category.category.name}
                                        {
                                            category.category.category.isGenderVaried &&
                                            (
                                                category.category.category.isForMen ?
                                                    ', Men' :
                                                    ', Women'
                                            )
                                        }
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Size Selection */}
                        {filteredSizes && filteredSizes.length > 0 && (
                            <div className="mb-4">
                                <label className="text-gray-600 font-semibold">Select Size:</label>
                                {
                                    product.pscs[0].category.category.category.name == 'Couples'
                                    &&
                                    <p className="text-gray-600 p-2 text-xl font-semibold">Male:</p>
                                }
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
                                {
                                    product.pscs[0].category.category.category.name == 'Couples'
                                    &&
                                    <div>
                                        <p className="text-gray-600 p-2 text-xl font-semibold">Female:</p>

                                        <div className="flex gap-3 flex-wrap">
                                            {filteredSizes.map((size) => (
                                                <button
                                                    key={size?.id}
                                                    className={`btn btn-outline ${selectedFemaleSize === size?.name ? 'bg-black text-white' : 'bg-white text-black'} border-black text-black`}
                                                    onClick={() => handleFemaleSizeChange(size?.name)}
                                                >
                                                    {size?.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                }
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {
                            product.pscs[0].category.category.category.name == 'Couples'
                                ?
                                ''
                                :
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
                        }

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

                        {/* size chart  */}
                        {
                            product.pscs[0].category.filename &&
                            <div className='pt-4'>
                                <p className="text-gray-600 font-semibold">Size Chart:</p>
                                <img className="" src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.pscs[0].category.filename}`} alt="Size Chart" />
                            </div>
                        }
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
