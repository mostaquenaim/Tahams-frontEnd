import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiShoppingBag } from 'react-icons/fi';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';
import { formatBDT } from '../../utils/pricing';
import { imageUrl } from '../Storefront/StorefrontUI';

const ShowProduct = ({ item }) => {
  const { user, setShowGotoCart } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const axiosPublic = useAxiosPublic();

  const {
    sellingPrice,
    discountPercentage,
    ifStock,
    productId,
    name,
    thumbImage,
    productPictures,
  } = item;
  const discountedPrice = parseInt(
    (sellingPrice * (100 - discountPercentage)) / 100,
  );
  const hasDiscount = discountPercentage > 0;
  const hoverThumb = productPictures?.[0]?.thumb;
  const detailsHref = `/products/details/${productId}`;

  useEffect(() => {
    setUserInfo(JSON.parse(localStorage.getItem('userInfo')));
  }, []);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const customEmail = user?.email || getGuestCustomerInfo().email;

    setIsAddedToCart(true);
    setShowGotoCart(true);
    localStorage.setItem('showGotoCart', true);

    try {
      const firstSize = item.pscs[0];
      const response = await axiosPublic.post('/admin/add-to-cart', {
        productId,
        size: firstSize.size.name,
        category: firstSize.category.id,
        Quantity: firstSize.quantity > 0 ? 1 : 0,
        colorId: item.color?.id,
        customerEmail: customEmail,
      });

      if (response.status >= 200 && response.status <= 205) {
        toast.success(`Added to cart (size ${firstSize.size.name})`);
      }
    } catch (error) {
      toast.error("Couldn't add that to your cart. Please try again.");
    } finally {
      setTimeout(() => setIsAddedToCart(false), 700);
      setTimeout(() => setShowGotoCart(false), 4000);
    }
  };

  // The category page is remembered so the details page can pre-select it.
  const rememberCategory = () => {
    const catId = window.location.pathname.split('/').pop();
    localStorage.setItem('defaultCategoryId', catId);
  };

  const canAdd = ifStock && userInfo?.role !== 'admin';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={detailsHref}
        onClick={rememberCategory}
        aria-label={`View ${name}`}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-gray-100"
      >
        <img
          src={imageUrl(thumbImage)}
          alt={name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out ${
            hoverThumb
              ? 'group-hover:scale-105 group-hover:opacity-0'
              : 'group-hover:scale-105'
          }`}
        />
        {hoverThumb && (
          <img
            src={imageUrl(hoverThumb)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        )}

        {hasDiscount && ifStock && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {discountPercentage}% off
          </span>
        )}

        {!ifStock && (
          <span className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
              Sold out
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h2 className="line-clamp-1 text-sm font-medium text-gray-900 sm:text-base">
          <Link href={detailsHref} onClick={rememberCategory} className="hover:underline">
            {name}
          </Link>
        </h2>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-semibold text-gray-900 sm:text-lg">
            {formatBDT(discountedPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatBDT(sellingPrice)}
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAddedToCart || !canAdd}
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition sm:text-sm ${
            canAdd
              ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60'
              : 'cursor-not-allowed bg-gray-100 text-gray-400'
          }`}
        >
          <FiShoppingBag className="h-4 w-4" />
          {!ifStock ? 'Sold out' : isAddedToCart ? 'Adding...' : 'Quick add'}
        </button>
      </div>
    </article>
  );
};

export default ShowProduct;
