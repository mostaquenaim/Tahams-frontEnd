import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AiOutlineHeart, AiOutlineShoppingCart } from 'react-icons/ai';

// Components
import ResponsiveNavBar from './ResponsiveNavBar';
import ListComponent from './components/ListComponent';

// Hooks
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import useLoadCats from '../../Hooks/useLoadCats';

// Context
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import DrawerProvider from '/Contexts/DrawerProvider';
import { DrawerContext } from '/Contexts/DrawerProvider';
import promoBanners from '/public/promotional-banner-details.json';
import PromoBannerCarousel from '../Swiper/PromotionalBanner';

// Constants
const NAV_END_BTN_CLASS = 'btn btn-square btn-ghost text-xl';
const SEARCH_DEBOUNCE_DELAY = 300;

const NavBarCompRe = () => {
  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const { user, logOut, loading: authLoading } = useContext(AuthContext);
  const [categories, , isPending] = useLoadCats();
  const { isLeftDrawerOpen, setIsLeftDrawerOpen } = useContext(DrawerContext);

  // State
  const [searchBtn, setSearchBtn] = useState(false);
  const [genders, setGenders] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const response = await axiosPublic.get('/admin/view-genders');
        setGenders(response.data);
      } catch (error) {
        console.error('Error fetching genders:', error);
      }
    };
    fetchGenders();
  }, [axiosPublic]);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    router.prefetch('/search-product');
  }, [router]);

  // Handlers
  const handleLogout = useCallback(async () => {
    try {
      await logOut();
      localStorage.removeItem('userInfo');
      localStorage.removeItem('access_token');
      // console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error.message);
      // You might want to show a toast notification here
    }
  }, [logOut]);

  // handle search
  const handleSearch = useCallback(() => {
    if (!searchInput.trim()) return;

    router.push(`/search-product?search=${encodeURIComponent(searchInput)}`);
    setSearchInput('');
    setSearchedProducts([]);
  }, [searchInput, router]);

  // handle search input
  const handleSearchInput = useCallback(
    async (e) => {
      const query = e.target.value;
      setSearchInput(query);

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (!query.trim()) {
        setSearchedProducts([]);
        setIsSearchLoading(false);
        return;
      }

      setIsSearchLoading(true);

      // Debounce search
      const newTimeout = setTimeout(async () => {
        try {
          const response = await axiosPublic.get(
            `admin/search-bar-products?q=${encodeURIComponent(query)}`,
          );
          setSearchedProducts(response.data || []);
        } catch (error) {
          console.error('Search error:', error);
          setSearchedProducts([]);
        } finally {
          setIsSearchLoading(false);
        }
      }, SEARCH_DEBOUNCE_DELAY);

      setSearchTimeout(newTimeout);
    },
    [axiosPublic, searchTimeout],
  );

  // handle result click
  const handleResultClick = useCallback(
    (id) => {
      setSearchInput('');
      setSearchedProducts([]);
      router.push(`/products/details/${id}`);
    },
    [router],
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // styles
  const navEndBtnClass = 'btn btn-square btn-ghost text-xl';

  const Li = ({ children }) => (
    <li className="transition md:hover:scale-105">{children}</li>
  );

  const sideLinks = (
    <>
      <Li>
        <Link href="/dashboard">Dashboard</Link>
      </Li>
      <Li>
        <Link href="/my-orders">My orders</Link>
      </Li>
      <Li>
        <Link href="/contact">Contact Us</Link>
      </Li>
      <Li>
        {authLoading ? null : user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </Li>
    </>
  );

  const ListStyle = ({ goto, pageName, extraClass }) => {
    const onBtnClick = () => {
      router.push(goto);
      setIsLeftDrawerOpen(false);
    };

    return (
      <li
        className={`hover:text-zinc-400 md:border-b-2 border-transparent hover:border-zinc-600 text-opacity-70 ${extraClass}`}
      >
        <button onClick={onBtnClick}>{pageName}</button>
        <hr className="nav-underline hidden hover:inline-block border-black duration-300 transition-width"></hr>
      </li>
      // hidden hover:inline-block
    );
  };

  // navlinks
  const links = (
    <>
      <ListStyle goto="/" pageName="Home" />
      {isPending ? (
        <li className="text-sm text-gray-300 px-2">Loading menu…</li>
      ) : (
        <>
          {genders &&
            genders.map((gender, index) => (
              <ListComponent
                key={index}
                cat={gender}
                cats={categories}
                ListStyle={ListStyle}
              ></ListComponent>
            ))}
          {categories &&
            categories.map(
              (cat, index) =>
                cat.name != 'Customize' &&
                (!cat.isGenderVaried ? (
                  <ListComponent
                    key={index}
                    cat={cat}
                    ListStyle={ListStyle}
                  ></ListComponent>
                ) : (
                  ''
                )),
            )}
        </>
      )}
    </>
  );

  const collabs = (
    <>
      <ListStyle goto="/collabs/artist" pageName="Artist Collabs" />
      <ListStyle goto="/collabs/influencer" pageName="Influencer Collabs" />
    </>
  );

  const SearchResults = () =>
    searchInput && (
      <div className="absolute left-0 mt-2 w-full bg-white shadow-xl border border-gray-300 rounded-md z-50 max-h-60 overflow-y-auto">
        {isSearchLoading ? (
          <div className="px-4 py-3 text-gray-500 text-center">
            Searching...
          </div>
        ) : searchedProducts.length > 0 ? (
          searchedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleResultClick(product.productId)}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer text-left font-medium text-gray-800 transition-colors duration-200"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.filename}`}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="truncate">{product.name}</span>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-gray-500 text-center">
            No products found
          </div>
        )}
      </div>
    );

  return (
    <div data-theme="black" className="relative">
      {/* Desktop Navigation */}
      <div
        className={
          searchBtn
            ? 'hidden'
            : 'hidden lg:block absolute top-0 z-20 left-0 right-0 bg-black text-white'
        }
      >
        <PromoBannerCarousel banners={promoBanners} />
        <div className="flex items-center justify-between">
          {/* Search Section */}
          <div className="w-1/3 text-center z-40">
            <div className="join w-full px-20 py-5">
              <div className="w-full relative">
                <input
                  className="input input-bordered join-item w-full"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={handleSearchInput}
                  onKeyPress={handleKeyPress}
                  aria-label="Search products"
                />
                <SearchResults />
              </div>
              <div className="indicator">
                <button
                  className="btn join-item"
                  onClick={handleSearch}
                  disabled={!searchInput.trim()}
                  type="button"
                  aria-label="Search"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="absolute w-full">
            <Link href="/" className="w-20 mx-auto text-center block">
              <img
                src="/logo-removebg.png"
                alt="Company Logo"
                className="w-20 p-2 mx-auto"
                loading="eager"
              />
            </Link>
          </div>

          {/* menu  */}
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link href={`/WishList`} className={navEndBtnClass}>
                <AiOutlineHeart></AiOutlineHeart>
              </Link>
            </li>
            <li>
              <Link href="/MyCart" className={navEndBtnClass}>
                <AiOutlineShoppingCart></AiOutlineShoppingCart>
              </Link>
            </li>
            <li>
              <details>
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

        <div>
          <ul className="hidden md:flex gap-5 justify-center items-center text-base px-5 font-semibold w-full">
            {links}
          </ul>
          <ul className="hidden md:flex gap-5 text-center justify-center items-center text-base px-5 py-3 font-semibold w-full">
            {collabs}
          </ul>
        </div>
      </div>

      {/* second nav */}
      <section className="fixed top-0 w-full bg-black z-10">
        <ResponsiveNavBar
          btn={searchBtn}
          fnc={setSearchBtn}
          ListStyle={ListStyle}
          ListComponent={ListComponent}
          categories={categories}
          genders={genders}
          sideLinks={sideLinks}
        ></ResponsiveNavBar>
      </section>
    </div>
  );
};

export default NavBarCompRe;
