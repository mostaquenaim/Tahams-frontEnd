import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import CartButton from '../Buttons/CartButton';
import { FaCartShopping, FaDisplay, FaEye } from 'react-icons/fa6';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import toast from 'react-hot-toast';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';

const ShowProduct = ({ item }) => {
  //   console.log(item, 'atimm');

  const router = useRouter();
  const { user, setShowGotoCart } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [hovered, setHovered] = useState(false);

  const {
    sellingPrice,
    discountPercentage,
    id,
    ifStock,
    productId,
    name,
    thumbImage,
    productPictures,
  } = item;
  const discountedPrice = parseInt(
    (sellingPrice * (100 - discountPercentage)) / 100,
  );
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userInfo'));
    setUserInfo(storedData);
  }, []);

  const [hoveredImage, setHoveredImage] = useState('');
  const [ftImage, setFtImage] = useState(
    'https://static-01.daraz.com.bd/p/13e6157acd98dfb45b8f2c9de90fe6bd.jpg',
  );

  const image = `/admin/get-ft-photo-by-product-id/${id}`;

  //   useEffect(() => {
  //     const storedData = JSON.parse(localStorage.getItem('userInfo'));
  //     setUserInfo(storedData);

  //     axiosPublic.get(image).then((res) => {
  //       setFtImage(res.data.filename);
  //     });
  //   }, []);

  //   const handleAddToCart = async () => {
  //     let customEmail = user?.email || '';

  //     if (!user) {
  //       const guestCustomerInfo = getGuestCustomerInfo();
  //       customEmail = guestCustomerInfo.email;
  //     }

  //     setIsAddedToCart(true);
  //     setShowGotoCart(true);
  //     localStorage.setItem('showGotoCart', true);

  //     try {
  //       // Make a POST request to the backend for adding to the cart
  //       const response = await axiosPublic.post('/admin/add-to-cart', {
  //         productId: item.productId,
  //         size: item.pscs[0].size.name,
  //         category: item.pscs[0].category.id,
  //         Quantity: item.pscs[0].quantity > 0 ? 1 : 0,
  //         colorId: item.color?.id,
  //         customerEmail: customEmail, // Use guest or logged-in user email
  //       });

  //       if (response.status >= 200 && response.status <= 205) {
  //         toast.success('Item added to the cart', { duration: 3000 });
  //       } else {
  //         toast.error('Failed to add item to the cart');
  //       }
  //     } catch (error) {
  //       console.error('Error:', error);
  //       toast.error('An error occurred while adding to the cart');
  //     } finally {
  //       setTimeout(() => setIsAddedToCart(false), 700);
  //       setTimeout(() => setShowGotoCart(false), 4000);
  //     }
  //   };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent triggering handleProductClick
    let customEmail = user?.email || '';
    if (!user) {
      const guestCustomerInfo = getGuestCustomerInfo();
      customEmail = guestCustomerInfo.email;
    }

    setIsAddedToCart(true);
    setShowGotoCart(true);
    localStorage.setItem('showGotoCart', true);

    try {
      const response = await axiosPublic.post('/admin/add-to-cart', {
        productId: item.productId,
        size: item.pscs[0].size.name,
        category: item.pscs[0].category.id,
        Quantity: item.pscs[0].quantity > 0 ? 1 : 0,
        colorId: item.color?.id,
        customerEmail: customEmail,
      });

      if (response.status >= 200 && response.status <= 205) {
        toast.success('Added to cart');
      }
    } catch (error) {
      toast.error('Error adding to cart');
    } finally {
      setTimeout(() => setIsAddedToCart(false), 700);
      setTimeout(() => setShowGotoCart(false), 4000);
    }
  };

  const handleProductClick = () => {
    const url = new URL(window.location.href);
    const CatId = url.pathname.split('/').pop();
    localStorage.setItem('defaultCategoryId', CatId);
    router.push(`/products/details/${productId}`);
  };

  const handleMouseEnter = () => {
    // Set the source of the first image in productPictures as the hoveredImage
    if (item.productPictures.length > 0) {
      // console.log(item.productPictures[0].filename);
      setHovered(true);
      setHoveredImage(item.productPictures[0].filename);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  //   const handleProductClick = () => {
  //     const url = new URL(window.location.href);
  //     const CatId = url.pathname.split('/').pop();
  //     // console.log(CatId);
  //     localStorage.setItem('defaultCategoryId', CatId);
  //     router.push(`/products/details/${productId}`);
  //   };

  const savedAmount = sellingPrice - discountedPrice;

  const cardBtnStyle =
    'bg-black text-white duration-300 hover:shadow-lg hover:shadow-black hover:scale-105 hover:-translate-y-1';

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container */}
      <div
        onClick={handleProductClick}
        className="relative aspect-[3/4] w-full overflow-hidden cursor-pointer bg-slate-50"
      >
        {/* Out of Stock Overlay */}
        {!ifStock && (
          <div className="absolute inset-0 z-20 bg-white/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Main Image */}
        <img
          src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${thumbImage}`}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
            !hovered
              ? 'scale-100 opacity-100'
              : productPictures?.[0]?.thumb
              ? 'scale-110 opacity-0'
              : 'scale-110'
          }`}
        />

        {/* Hover Image */}
        {productPictures?.[0]?.thumb && (
          <img
            src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${productPictures[0].thumb}`}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              hovered ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
            }`}
          />
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-black text-white px-2 py-1 rounded text-[10px] font-bold uppercase">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-slate-800 font-medium text-sm md:text-base line-clamp-1 mb-1 italic">
          {name}
        </h2>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-slate-900">
            {discountedPrice} BDT
          </span>
          {discountPercentage > 0 && (
            <span className="text-xs text-slate-400 line-through">
              {sellingPrice} BDT
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddedToCart || userInfo?.role === 'admin' || !ifStock}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              !ifStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-black active:scale-95 disabled:opacity-50'
            }`}
          >
            <FaCartShopping className="text-sm" />
            {isAddedToCart ? 'Adding...' : 'Add'}
          </button>

          <button
            onClick={handleProductClick}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="View Details"
          >
            <FaEye />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowProduct;
