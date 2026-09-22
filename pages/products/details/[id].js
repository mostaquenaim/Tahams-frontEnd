import { Fragment, useContext, useEffect, useState, useRef } from 'react';
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
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import { formatBDT } from '../../../utils/pricing';
import {
  Breadcrumbs,
  buttonPrimary,
  buttonSecondary,
} from '/components/Storefront/StorefrontUI';

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
    if (!ifStock) {
      return;
    }

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

        goToCartTimeoutRef.current = setTimeout(() => {
          setShowGotoCart(false);
        }, 10000);
      }
    }

    pushToDataLayer('add_to_cart', {
      item: product,
      user_email: customEmail,
    });
  };

  const goToCartTimeoutRef = useRef(null);

  const handleCartBarMouseEnter = () => {
    if (goToCartTimeoutRef.current) {
      clearTimeout(goToCartTimeoutRef.current);
    }
  };

  const handleCartBarMouseLeave = () => {
    goToCartTimeoutRef.current = setTimeout(() => {
      setShowGotoCart(false);
    }, 3000);
  };

  // buy now handling
  const handleBuyNow = async () => {
    if (!ifStock) {
      return;
    }

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

  const isCouples =
    product.pscs[0].category.category.category.name == 'Couples';
  const isAdmin = userInfo && userInfo.role == 'admin';
  const hasDiscount = discountPercentage > 0;
  const finalPrice = hasDiscount
    ? parseInt((sellingPrice * (100 - discountPercentage)) / 100)
    : sellingPrice;
  const seriesName = product.pscs[0].category.category.category.name;
  const canBuy = ifStock && !isAdmin;

  return (
    <div className="bg-white">
      <Head>
        <title>{`${product.name} - Tahams`}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <div className="max-w-7xl mx-auto px-4 min-h-screen pt-40 lg:pt-56 pb-16">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: seriesName },
            { label: name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Product Image */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              {hasDiscount && (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  {discountPercentage}% OFF
                </span>
              )}
              {!ifStock && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  Out of stock
                </span>
              )}
              <Swiper
                modules={[Zoom, Thumbs]}
                zoom={{ maxRatio: 8 }}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                className="aspect-[3/4] w-full cursor-zoom-in"
              >
                {displayImages.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="swiper-zoom-container">
                      <img
                        src={img}
                        alt={`${name} - photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <FaSearchPlus className="h-3 w-3" />
              <span className="md:hidden">Double tap to zoom</span>
              <span className="hidden md:inline">Click to zoom</span>
            </p>

            {displayImages.length > 1 && (
              <div className="relative mt-3">
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
                      className="group !w-16 cursor-pointer lg:!w-20"
                    >
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="h-20 w-16 rounded-lg border-2 border-transparent object-cover opacity-60 transition group-[.swiper-slide-thumb-active]:border-black group-[.swiper-slide-thumb-active]:opacity-100 lg:h-24 lg:w-20"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  type="button"
                  aria-label="Previous photos"
                  className="thumb-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-100 bg-white p-1.5 shadow-sm transition-opacity hover:bg-gray-50 [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:opacity-0"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next photos"
                  className="thumb-next absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-100 bg-white p-1.5 shadow-sm transition-opacity hover:bg-gray-50 [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:opacity-0"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {seriesName}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  {name}
                </h1>
              </div>

              {/* Wishlist Icon */}
              {!loading ? (
                <button
                  type="button"
                  className={`shrink-0 rounded-full border p-3 text-lg transition ${
                    isAddedToWishlist
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                  onClick={addToWishlist}
                  aria-pressed={isAddedToWishlist}
                  aria-label={
                    isAddedToWishlist
                      ? 'Remove from wishlist'
                      : 'Add to wishlist'
                  }
                >
                  {isAddedToWishlist ? <FaHeart /> : <FaRegHeart />}
                </button>
              ) : (
                <span className="loading loading-spinner loading-md"></span>
              )}
            </div>

            {/* price  */}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-gray-900">
                {formatBDT(finalPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatBDT(sellingPrice)}
                  </span>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                    Save {formatBDT(sellingPrice - finalPrice)}
                  </span>
                </>
              )}
            </div>
            {vatPercentage > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                + {vatPercentage}% VAT added at checkout
              </p>
            )}

            {/* Stock Status */}
            <p
              className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${
                ifStock ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  ifStock ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              {ifStock ? 'In stock' : 'Out of stock'}
            </p>

            {/* views */}
            {userInfo?.role == 'admin' && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                <FaEye /> {totalViews} views
              </p>
            )}

            {/* description  */}
            {description && (
              <p
                className="mt-4 text-sm leading-relaxed text-gray-600"
                style={{ whiteSpace: 'pre-line' }}
              >
                {description}
              </p>
            )}

            <div className="mt-6 space-y-5 border-t border-gray-100 pt-6">
              {/* Color Information */}
              {color && (
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-700">Color</p>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3 text-sm text-gray-700">
                    <span
                      className="h-5 w-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: color.colorCode }}
                    />
                    {color?.name}
                  </span>
                </div>
              )}

              {/* Category Dropdown */}
              {uniqueCategories.length > 1 && (
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={selectedCategory || ''}
                    onChange={(e) =>
                      handleCategoryChange(parseInt(e.target.value))
                    }
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
              )}

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
              {!isCouples && (
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="quantity"
                    className="text-sm font-medium text-gray-700"
                  >
                    Quantity
                  </label>
                  <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="px-3 py-2.5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                      onClick={handleQuantityDecrease}
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                    <input
                      id="quantity"
                      type="text"
                      className="w-12 border-x border-gray-200 py-2 text-center text-sm font-medium outline-none"
                      value={quantity}
                      readOnly
                    />
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="px-3 py-2.5 text-gray-600 transition hover:bg-gray-50"
                      onClick={handleQuantityIncrease}
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart and Buy Now Buttons */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className={buttonSecondary}
                disabled={!canBuy || isAddedToCart}
                onClick={handleAddToCart}
              >
                <FaShoppingCart />
                {!ifStock
                  ? 'Out of stock'
                  : isAddedToCart
                  ? 'Adding...'
                  : 'Add to cart'}
              </button>
              <button
                type="button"
                className={buttonPrimary}
                disabled={!canBuy}
                onClick={handleBuyNow}
              >
                {ifStock ? 'Buy now' : 'Out of stock'}
              </button>
            </div>
            {isAdmin && (
              <p className="mt-2 text-xs text-gray-500">
                Admin accounts can&apos;t place orders.
              </p>
            )}

            {/* size chart  */}
            {product.pscs[0].category.filename && (
              <details className="group mt-6 rounded-2xl border border-gray-100 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-800">
                  Size chart
                  <FiChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <img
                  className="mt-3 w-full rounded-lg"
                  loading="lazy"
                  src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.pscs[0].category.filename}`}
                  alt="Size chart"
                />
              </details>
            )}
          </div>
        </div>

        {/* Long Description */}
        {longDescription && (
          <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              More about this product
            </h2>
            <div
              className="text-sm leading-relaxed text-gray-600"
              style={{ whiteSpace: 'pre-line' }}
            >
              {longDescription}
            </div>
          </section>
        )}

        {/* people also like  */}
        <PeopleAlsoLike
          category={product.pscs[0].category.id}
          currentProductId={product.id}
        />
      </div>
      <Link
        href="/MyCart"
        onMouseEnter={handleCartBarMouseEnter}
        onMouseLeave={handleCartBarMouseLeave}
        className={`fixed bottom-0 left-0 z-[60] flex h-16 w-full items-center justify-center gap-3 bg-slate-900 text-white shadow-2xl transition-all duration-500 hover:bg-black ${
          !showGotoCart
            ? 'pointer-events-none translate-y-full opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <span className="text-sm font-semibold uppercase tracking-widest">
          View Cart & Checkout
        </span>
      </Link>

      {/* Success Animation */}
      <AnimatePresence>
        {showDiscountSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-green-600 p-4 text-white shadow-xl sm:right-10"
          >
            <FaCheckCircle className="text-2xl" />
            <div>
              <p className="font-bold">Discount Applied!</p>
              <p className="text-sm">5% discount added to your order</p>
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
