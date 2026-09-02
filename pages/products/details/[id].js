import { Fragment, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FaCheckCircle,
  FaEye,
  FaSearchPlus,
  FaShoppingCart,
} from 'react-icons/fa';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import ImageZoom from '../../draft/image-zoom-inner';
import { getGuestCustomerInfo } from '../../../utils/guestCustomer';
import Head from 'next/head';
import Loading from '/components/Loading';
import { pushToDataLayer } from '../../../utils/ga4';
import { AddToWish } from '/utils/WishFunctions';
import { DeleteFromWish } from '/utils/WishFunctions';
import PeopleAlsoLike from '/components/Product/PeopleAlsoLike';
import { AnimatePresence, motion } from 'framer-motion';
import ProductSize from '/components/Product/ProductSize';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Zoom, Thumbs, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';
import 'swiper/css/navigation';

const Product = ({ product }) => {
  // console.log('product-test', product.productPictures);
  const [isAddedToWishlist, setAddedToWishlist] = useState(false);
  const [showGotoCart, setShowGotoCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaleSize, setSelectedMaleSize] = useState('');
  const [selectedFemaleSize, setSelectedFemaleSize] = useState('');
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { user, loading } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [pending, setPending] = useState(false);
  const [wishId, setWishId] = useState(-1);
  const [customEmail, setCustomEmail] = useState('');
  const [showDiscountSuccess, setShowDiscountSuccess] = useState(false);
  const [discountEligible, setDiscountEligible] = useState(false);

  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  const viewCount = async () => {
    // console.log('line 32');
    const customerEmail = user?.email || getGuestCustomerInfo()?.email;

    const item = {
      item_id: product.id,
      item_name: product.name,
      item_color: product.color?.name || 'Unknown',
      item_series:
        product.pscs?.[0]?.category?.category?.category?.name || 'N/A',
      main_category: product.pscs?.[0]?.category?.category?.name || 'N/A',
      sub_category: product.pscs?.[0]?.category?.name || 'N/A',
      item_price:
        parseInt(
          product.sellingPrice -
            (product.sellingPrice * product.discountPercentage) / 100 +
            (product.sellingPrice * product.vatPercentage) / 100,
        ) * quantity || 0,
      total_views: product.totalViews || 0,
      discount_percent: product.discountPercentage || 0,
      currency: 'BDT',
      // quantity: 1,
      user_email: customerEmail,
    };

    // Pushing data to dataLayer
    pushToDataLayer('view_item', {
      item,
    });

    try {
      await axiosPublic.post(
        `/admin/increase-product-view/${product.id}?email=${customerEmail}`,
      );
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  // set selected image
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // view count
  useEffect(() => {
    viewCount();
  }, []);

  // store user data from local storage
  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
    setUserInfo(storedUserInfo);
  }, []);

  // check if wished
  useEffect(() => {
    // Scroll to top of the page
    window.scrollTo(0, 100);

    checkIfWished(product.id, customEmail);

    // Set default selected category and size
    if (product.pscs.length > 0) {
      setSelectedCategory(product.pscs[0].category.id);
      setSelectedSize(product.pscs[0].size?.name);
    }
  }, [product, userInfo, customEmail]);

  // default category id
  useEffect(() => {
    const defaultCategoryId = parseInt(
      localStorage.getItem('defaultCategoryId'),
    );
    if (defaultCategoryId) {
      handleCategoryChange(defaultCategoryId);
    }
  }, [loading]);

  // set custom email
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // console.log('ekhane dhukse');
        const guestCustomerInfo = getGuestCustomerInfo();
        setCustomEmail(guestCustomerInfo.email);
      } else {
        // console.log('acheee');
        setCustomEmail(user?.email);
      }
    }
  }, [loading, user]);

  const checkIfWished = async (productId, customerEmail) => {
    setPending(true);
    try {
      const result = await axiosPublic.get(
        `admin/check-wish-by-user-and-product`,
        {
          params: {
            productId: productId,
            customerEmail: customerEmail,
          },
        },
      );

      // console.log(result.data);

      setWishId(result.data?.wished?.id);
      setAddedToWishlist(result.data.isWished);
    } catch (error) {
      console.error('Error checking wish:', error);
      // Handle the error accordingly
    } finally {
      setPending(false);
    }
  };

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

  const images = [
    `${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`,
    ...(product.productPictures?.map(
      (pp) => `${process.env.NEXT_PUBLIC_API}/admin/getimage/${pp.filename}`,
    ) || []),
  ];
  const displayImages = images.slice(0, 6);

  const uniqueCategories = [
    ...new Map(product.pscs.map((p) => [p.category.id, p.category])).values(),
  ];

  const filteredSizes = selectedCategory
    ? product.pscs
        .filter((p) => p.category.id === selectedCategory && p.quantity > 0)
        .map((p) => p.size)
    : [];

  // add to wish
  const addToWishlist = async () => {
    if (isAddedToWishlist) {
      DeleteFromWish(product, customEmail, wishId, checkIfWished);
    } else {
      AddToWish(product, customEmail, checkIfWished);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQuantity(1);
    if (product.pscs[0].category.category.category.name == 'Couples') {
      setSelectedMaleSize(size);
    }
  };

  const handleFemaleSizeChange = (size) => {
    setSelectedFemaleSize(size);
    setQuantity(1);
  };

  const handleCategoryChange = (categoryId) => {
    // console.log(categoryId, 'catid');
    setSelectedCategory(categoryId);
    const firstSize = product.pscs.find((p) => p.category.id == categoryId)
      ?.size?.name;
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
      if (
        item.category.id === selectedCategory &&
        item.size?.name === selectedSize
      ) {
        if (item.quantity > quantity && quantity < 30) {
          setQuantity(quantity + 1);
        } else {
          toast.error('Sorry! You cannot add more than that');
        }
      }
    });
  };

  // cart add handling
  const handleAddToCart = async () => {
    if (
      product.pscs[0].category.category.category.name == 'Couples' &&
      (!selectedFemaleSize || !selectedSize)
    ) {
      toast.error('You have to select a size for each');
    } else {
      setIsAddedToCart(true);
      setShowGotoCart(true);

      if (quantity >= 3) {
        setDiscountEligible(true);
        setShowDiscountSuccess(true);
        setTimeout(() => setShowDiscountSuccess(false), 3000);
      }

      // Use guest customer info for cart addition
      try {
        // Make a POST request to the backend endpoint for adding to the cart
        const response = await axiosPublic.post('/admin/add-to-cart', {
          productId: product?.productId,
          category: selectedCategory,
          size: selectedSize,
          maleSize: selectedMaleSize,
          femaleSize: selectedFemaleSize,
          Quantity: quantity,
          colorId: color?.id,
          customerEmail: customEmail, // Use guest email
        });

        // console.log(response.data, 'rspdar');

        // console.log(response.data,'cart data');
        localStorage.setItem('defaultCartItem', response.data.id);

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

    pushToDataLayer('add_to_cart', {
      item: product,
      user_email: customEmail,
    });
  };

  // buy now handling
  const handleBuyNow = async () => {
    if (
      product.pscs[0].category.category.category.name === 'Couples' &&
      (!selectedFemaleSize || !selectedSize)
    ) {
      // Ensure sizes are selected for couples' products
      toast.error('You have to select a size for each');
    } else {
      try {
        // Add product to the cart for the logged-in user
        const response = await axiosPublic.post('/admin/add-to-cart', {
          productId: product?.productId,
          category: selectedCategory,
          size: selectedSize,
          maleSize: selectedMaleSize,
          femaleSize: selectedFemaleSize,
          Quantity: quantity,
          colorId: color?.id,
          customerEmail: customEmail,
        });

        if (response.status >= 200 && response.status <= 205) {
          localStorage.setItem(
            'selectedItems',
            JSON.stringify([response.data]),
          );

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

  useEffect(() => {
    setDiscountEligible(quantity >= 2);
  }, [quantity]);

  // Add this component near your price display
  const DiscountBadge = () => (
    <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
      <p className="font-bold">🎉 Special Offer!</p>
      <p>Buy 3 products and get 5% discount on your entire order!</p>
      {discountEligible && (
        <p className="text-green-600 font-semibold mt-1">
          You qualify for the discount! ({3 - quantity} more to add)
        </p>
      )}
    </div>
  );

  return (
    <div>
      <Head>
        <title>{product.name}</title>
      </Head>
      <div className="max-w-7xl mx-auto p-4 min-h-screen pt-48 lg:pt-56 pb-10">
        <div className="flex flex-col md:flex-row gap-5 sm:gap-0 lg:gap-12 xl:gap-0">
          {/* Product Image */}
          <div className="md:w-1/2">
            <Swiper
              modules={[Zoom, Thumbs]}
              zoom={{ maxRatio: 8 }}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              className="w-full h-72 md:h-96 md:w-80 lg:h-[600px] lg:w-[480px] rounded !mx-0 cursor-zoom-in"
            >
              {displayImages.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <div className="swiper-zoom-container">
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="md:hidden flex justify-center mt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <FaSearchPlus className="w-3 h-3" />
                Double tap to zoom
              </span>
            </div>

            <div className="relative mt-3 w-full md:w-80 lg:w-[480px]">
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[Thumbs, Navigation]}
                navigation={{ nextEl: '.thumb-next', prevEl: '.thumb-prev' }}
                spaceBetween={8}
                slidesPerView="auto"
                watchSlidesProgress={true}
                className="px-8"
              >
                {displayImages.map((img, idx) => (
                  <SwiperSlide
                    key={idx}
                    className="group !w-14 lg:!w-24 cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={name}
                      className="h-20 w-14 lg:h-32 lg:w-24 object-cover rounded opacity-60 group-[.swiper-slide-thumb-active]:opacity-100 transition-opacity"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="thumb-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:bg-gray-100 [&.swiper-button-disabled]:opacity-0 [&.swiper-button-disabled]:pointer-events-none transition-opacity">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="thumb-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:bg-gray-100 [&.swiper-button-disabled]:opacity-0 [&.swiper-button-disabled]:pointer-events-none transition-opacity">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 ">
            <h1 className="text-2xl font-bold mb-2">{name}</h1>

            {/* Wishlist Icon */}
            {!loading ? (
              <div className="mb-2">
                <button
                  className={`text-xl ${
                    isAddedToWishlist ? 'text-red-500' : 'text-gray-500'
                  }`}
                  onClick={addToWishlist}
                >
                  {isAddedToWishlist ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            ) : (
              <span className="loading loading-spinner loading-md"></span>
            )}

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
              {discountPercentage > 0 ? (
                <span>
                  {parseInt(
                    (sellingPrice * (100 - discountPercentage)) / 100,
                  )}{' '}
                </span>
              ) : (
                <span>{sellingPrice} </span>
              )}
              BDT
            </p>

            {/* Add the DiscountBadge component below your price display */}
            {/* <DiscountBadge /> */}

            {/* Stock Status */}
            <p
              className={`mb-2 ${ifStock ? 'text-green-500' : 'text-red-500'}`}
            >
              {ifStock ? 'In Stock' : 'Out of Stock'}
            </p>

            {/* VAT */}
            <p className="text-gray-600 mb-4">VAT: {vatPercentage}%</p>

            {/* views */}
            {userInfo?.role == 'admin' && (
              <>
                <button className="btn btn-accent">
                  <FaEye /> {totalViews}
                </button>
              </>
            )}

            {/* Color Information */}
            {color && (
              <div className="mb-4">
                <p className="text-gray-600 font-semibold">Color:</p>
                <div
                  className="p-3 w-24 rounded-full text-center border-black border-1"
                  style={{ backgroundColor: color.colorCode }}
                >
                  <span
                    className={`text-black text-center ${
                      color.colorCode === '#000000' && 'text-white'
                    }`}
                  >
                    {color?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Category Dropdown */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700">
                Category
              </label>
              <select
                id="category"
                className="mt-1 block w-full p-2 border rounded"
                value={selectedCategory || ''}
                onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
              >
                {uniqueCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category.category.name}
                    {category.category.category.isGenderVaried &&
                      (category.category.category.isForMen
                        ? ', Men'
                        : ', Women')}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Selection */}
            <ProductSize
              selectedCategory={selectedCategory}
              product={product}
              selectedSize={selectedSize}
              handleSizeChange={handleSizeChange}
              selectedFemaleSize={selectedFemaleSize}
              handleFemaleSizeChange={handleFemaleSizeChange}
            />

            {/* Quantity Selector */}
            {product.pscs[0].category.category.category.name == 'Couples' ? (
              ''
            ) : (
              <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="block text-gray-700 mr-4">
                  Quantity
                </label>
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
            )}

            {/* Add to Cart and Buy Now Buttons */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
              <button
                className={`btn btn-primary ${
                  isAddedToCart || (userInfo && userInfo.role == 'admin')
                    ? 'btn-disabled'
                    : 'bg-black text-white hover:scale-105 duration-300 hover:shadow-lg hover:shadow-black'
                }`}
                onClick={handleAddToCart}
              >
                <FaShoppingCart /> Add to Cart
              </button>
              <button
                className={`btn btn-accent ${
                  userInfo && userInfo.role == 'admin'
                    ? 'btn-disabled'
                    : 'bg-black text-white hover:scale-105 duration-300 hover:shadow-lg hover:shadow-black'
                }`}
                onClick={handleBuyNow}
              >
                🛍️ Buy Now
              </button>
            </div>

            {/* size chart  */}
            {product.pscs[0].category.filename && (
              <div className="pt-4">
                <p className="text-gray-600 font-semibold">Size Chart:</p>
                <img
                  className=""
                  src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.pscs[0].category.filename}`}
                  alt="Size Chart"
                />
              </div>
            )}
          </div>
        </div>

        {/* Long Description */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            More about this product
          </h2>
          <div className="prose prose-lg" style={{ whiteSpace: 'pre-line' }}>
            {longDescription}
          </div>
        </div>

        {/* people also like  */}
        <PeopleAlsoLike
          category={product.pscs[0].category.id}
          currentProductId={product.id}
        />
      </div>
      {
        <Link
          href="/MyCart"
          className={`fixed bottom-0 left-0 w-full h-16 bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-3 transition-all duration-500 z-[60] shadow-2xl ${
            !showGotoCart
              ? 'translate-y-full opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <span className="font-semibold uppercase tracking-widest text-sm">
            View Cart & Checkout
          </span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">
            NEW
          </span>
        </Link>
      }

      {/* Success Animation */}
      <AnimatePresence>
        {showDiscountSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-10 right-10 bg-green-500 text-white p-4 rounded-lg shadow-xl flex items-center gap-2 z-50"
          >
            <FaCheckCircle className="text-2xl" />
            <div>
              <p className="font-bold">Discount Applied!</p>
              <p>5% discount added to your order</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;
  const { id } = params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/admin/get-product-by-id/${id}`,
    );

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
