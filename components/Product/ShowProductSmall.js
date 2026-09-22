import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { FiShoppingBag } from 'react-icons/fi';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';
import { formatBDT } from '../../utils/pricing';
import { imageUrl } from '../Storefront/StorefrontUI';

// Compact product card for the home page sections. "Buy now" adds the first
// available size and jumps straight to checkout.
const ShowProductSmall = ({ item }) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [buying, setBuying] = useState(false);
  const axiosPublic = useAxiosPublic();

  const { sellingPrice, discountPercentage, ifStock, productId } = item;
  const discountedPrice = parseInt(
    (sellingPrice * (100 - discountPercentage)) / 100,
  );
  const hasDiscount = discountPercentage > 0;
  const hoverPhoto = item.productPictures?.[0];
  const detailsHref = `/products/details/${productId}`;
  const canBuy = ifStock && userInfo?.role !== 'admin';

  useEffect(() => {
    setUserInfo(JSON.parse(localStorage.getItem('userInfo')));
  }, []);

  const handleBuyNow = async () => {
    if (!canBuy || buying) return;

    const customEmail = user?.email || getGuestCustomerInfo().email;
    setBuying(true);

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
        localStorage.setItem('selectedItems', JSON.stringify([response.data]));
        router.push({ pathname: '/buy-now' });
      } else {
        toast.error("Couldn't start checkout. Please try again.");
        setBuying(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Couldn't start checkout. Please try again.");
      setBuying(false);
    }
  };

  // The category page is remembered so the details page can pre-select it.
  const rememberCategory = () => {
    localStorage.setItem(
      'defaultCategoryId',
      window.location.pathname.split('/').pop(),
    );
  };

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={detailsHref}
        onClick={rememberCategory}
        aria-label={`View ${item.name}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-gray-100"
      >
        <img
          src={imageUrl(item.thumbImage ? item.thumbImage : item.filename)}
          alt={item.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            hoverPhoto
              ? 'group-hover:scale-105 group-hover:opacity-0'
              : 'group-hover:scale-105'
          }`}
        />
        {hoverPhoto && (
          <img
            src={imageUrl(hoverPhoto.thumb ? hoverPhoto.thumb : hoverPhoto.filename)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100"
          />
        )}

        {hasDiscount && ifStock && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
            {discountPercentage}% off
          </span>
        )}
        {!ifStock && (
          <span className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
              Sold out
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="line-clamp-1 text-xs font-medium text-gray-900 sm:text-sm">
          {item.name}
        </h3>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold text-gray-900">
            {formatBDT(discountedPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">
              {formatBDT(sellingPrice)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canBuy || buying}
          className={`mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
            canBuy
              ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60'
              : 'cursor-not-allowed bg-gray-100 text-gray-400'
          }`}
        >
          <FiShoppingBag className="h-3.5 w-3.5" />
          {!ifStock ? 'Sold out' : buying ? 'Please wait...' : 'Buy now'}
        </button>
      </div>
    </article>
  );
};

export default ShowProductSmall;
