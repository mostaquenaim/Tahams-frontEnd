import Link from 'next/link';
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from 'react-icons/ai';
import LeftDrawer from '../Drawers/LeftDrawer';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import PromoBannerCarousel from '../Swiper/PromotionalBanner';
import promoBanners from '/public/promotional-banner-details.json';

const ResponsiveNavBar = ({
  btn,
  fnc,
  ListStyle,
  ListComponent,
  categories,
  genders,
  sideLinks,
}) => {
  const navEndBtnClass = 'btn btn-square btn-sm btn-ghost text-xl';
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchedProducts, setSearchedProducts] = useState([]);
  const axiosPublic = useAxiosPublic();
  const router = useRouter();

  useEffect(() => {
  router.prefetch('/search-product');
}, [router]);

const detailsRef = useRef(null);
useEffect(() => {
  const handleClickOutside = (e) => {
    if (detailsRef.current && !detailsRef.current.contains(e.target)) {
      detailsRef.current.open = false;
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);

  const handleSearch = () => {
    const term = searchInput.trim();
    if (!term) return;
    fnc(!btn);
    router.push(`/search-product?search=${encodeURIComponent(term)}`);
    setSearchInput('');
    setSearchedProducts([]);
  };

  // Debounced suggestions; a slower earlier response never overwrites a newer one.
  const requestId = useRef(0);
  useEffect(() => {
    const term = searchInput.trim();
    const id = (requestId.current += 1);

    if (!term) {
      setSearchedProducts([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axiosPublic.get('admin/search-bar-products', {
          params: { q: term },
        });
        if (id !== requestId.current) return;
        setSearchedProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (id !== requestId.current) return;
        console.error(error);
        setSearchedProducts([]);
      } finally {
        if (id === requestId.current) setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, axiosPublic]);

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };

  const handleResultClick = (id) => {
    setSearchInput('');
    setSearchedProducts([]);
    fnc(!btn);
    router.push(`/products/details/${id}`);
  };

  const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};

  return (
    <div>
      <div data-theme="black" className=" w-full top-0">
        <PromoBannerCarousel banners={promoBanners} />
        <div className="navbar bg-base-100">
          <div className="flex-none">
            <LeftDrawer
              ListStyle={ListStyle}
              ListComponent={ListComponent}
              categories={categories}
              genders={genders}
            ></LeftDrawer>
          </div>
          <div className="flex-1 md:ml-0">
            <Link href="/" className=" btn-ghost normal-case text-xl">
              <img src="/logo-removebg.png" className="h-14" alt="" />
            </Link>
          </div>

          <ul className="menu menu-horizontal px-1">
            <li>
              <button className={navEndBtnClass} onClick={() => fnc(!btn)}>
                <AiOutlineSearch className=""></AiOutlineSearch>
              </button>
            </li>
            <li>
              <Link href="/WishList" className={navEndBtnClass}>
                <AiOutlineHeart></AiOutlineHeart>
              </Link>
            </li>
            <li>
              <Link href="/MyCart" className={navEndBtnClass}>
                <AiOutlineShoppingCart></AiOutlineShoppingCart>
              </Link>
            </li>
            <li>
              <details ref={detailsRef}>
                <summary>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-5 h-5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    ></path>
                  </svg>
                </summary>
                <ul className="p-2 bg-base-100 right-0">{sideLinks}</ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
      {/* search  */}
      <div className={btn ? `w-full text-center` : `hidden`}>
        <div className="join w-full px-10 py-5">
          <div className="w-full relative">
            <input
              className="input input-bordered join-item w-full"
              placeholder="Search"
              value={searchInput}
              onChange={handleSearchInput}
              onKeyDown={handleKeyPress}
              aria-label="Search products"
            />
            {/* Search Results Dropdown with Image */}
            {searchInput.trim() && !isLoading && searchedProducts.length > 0 && (
              <div className="absolute left-0 mt-2 w-full bg-white shadow-xl border border-gray-300 rounded-md z-50 max-h-60 overflow-y-auto">
                {searchedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleResultClick(product.productId)}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer text-left font-medium text-gray-800 transition-colors duration-200"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.filename}`} // make sure this is the correct path
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span>{product.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* search  */}
          <div className="indicator">
            <button
              className="btn join-item"
              onClick={() => handleSearch()}
              disabled={!searchInput.trim()}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveNavBar;
