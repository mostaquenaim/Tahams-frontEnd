import React, { useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Package,
  ShoppingBag,
} from 'lucide-react';

// Components
import ResponsiveNavBar from './ResponsiveNavBar';
import ListComponent from './components/ListComponent';
import NavSearch from './components/NavSearch';
import AccountMenu from './components/AccountMenu';
import NavIconLink, { NAV_ICON_BTN_CLASS } from './components/NavIconLink';
import PromoBannerCarousel from '../Swiper/PromotionalBanner';

// Hooks
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import useLoadCats from '../../Hooks/useLoadCats';
import useCart from '../../Hooks/useCart';

// Context
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import { DrawerContext } from '/Contexts/DrawerProvider';
import promoBanners from '/public/promotional-banner-details.json';

const NavBarCompRe = () => {
  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const { user, logOut, loading: authLoading } = useContext(AuthContext);
  const [categories, , isPending] = useLoadCats();
  const [, cart] = useCart();
  const { setIsLeftDrawerOpen } = useContext(DrawerContext);

  // State
  const [searchBtn, setSearchBtn] = useState(false);
  const [genders, setGenders] = useState([]);

  const [megaSuppressed, setMegaSuppressed] = useState(false);

  const cartCount = Array.isArray(cart) ? cart.length : 0;

  // Hover menus are pure CSS, so after clicking a link inside one it would stay
  // open under the cursor. Hide them on navigation until the mouse moves again.
  useEffect(() => {
    const release = () => setMegaSuppressed(false);
    const suppress = () => {
      window.removeEventListener('mousemove', release);
      setMegaSuppressed(true);
    };
    const releaseOnMove = () => {
      window.addEventListener('mousemove', release, { once: true });
    };
    router.events.on('routeChangeStart', suppress);
    router.events.on('routeChangeComplete', releaseOnMove);
    router.events.on('routeChangeError', releaseOnMove);
    return () => {
      router.events.off('routeChangeStart', suppress);
      router.events.off('routeChangeComplete', releaseOnMove);
      router.events.off('routeChangeError', releaseOnMove);
      window.removeEventListener('mousemove', release);
    };
  }, [router.events]);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const response = await axiosPublic.get('/admin/view-genders');
        setGenders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching genders:', error);
      }
    };
    fetchGenders();
  }, [axiosPublic]);

  // Handlers
  const handleLogout = useCallback(async () => {
    try {
      await logOut();
      localStorage.removeItem('userInfo');
      localStorage.removeItem('access_token');
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
  }, [logOut]);

  const currentPath = (router.asPath || '').split('?')[0];

  const menuItemClass = 'flex items-center gap-3 py-2.5';

  const sideLinks = (
    <>
      <li>
        <Link href="/dashboard" className={menuItemClass}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
      </li>
      <li>
        <Link href="/my-orders" className={menuItemClass}>
          <Package size={16} /> My orders
        </Link>
      </li>
      <li>
        <Link href="/contact" className={menuItemClass}>
          <Mail size={16} /> Contact Us
        </Link>
      </li>
      {!authLoading && (
        <li className="mt-1 border-t border-white/10 pt-1">
          {user ? (
            <button type="button" onClick={handleLogout} className={menuItemClass}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link href="/login" className={menuItemClass}>
              <LogIn size={16} /> Login
            </Link>
          )}
        </li>
      )}
    </>
  );

  // Used inside mega menus and the mobile drawer.
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
    );
  };

  // Top-level desktop link with an animated underline; underlined while active.
  const TopLink = ({ href, children }) => {
    const isActive = currentPath === href;
    return (
      <li>
        <Link
          href={href}
          className={`relative inline-block py-1 transition-opacity hover:text-white hover:opacity-100 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 ${
            isActive ? 'opacity-100 after:scale-x-100' : 'opacity-90 after:scale-x-0'
          }`}
        >
          {children}
        </Link>
      </li>
    );
  };

  // navlinks
  const links = (
    <>
      <TopLink href="/">Home</TopLink>
      {isPending ? (
        <li className="text-white/40">Loading menu…</li>
      ) : (
        <>
          {genders.map((gender, index) => (
            <li key={`gender-${gender.id ?? index}`}>
              <ListComponent
                cat={gender}
                cats={categories}
                ListStyle={ListStyle}
              ></ListComponent>
            </li>
          ))}
          {categories &&
            categories.map(
              (cat, index) =>
                cat.name != 'Customize' &&
                !cat.isGenderVaried && (
                  <li key={`cat-${cat.id ?? index}`}>
                    <ListComponent cat={cat} ListStyle={ListStyle}></ListComponent>
                  </li>
                ),
            )}
        </>
      )}
    </>
  );

  return (
    <div data-theme="black" className="relative">
      {/* Desktop Navigation */}
      <header
        className={
          searchBtn
            ? 'hidden'
            : `hidden lg:block absolute top-0 z-20 left-0 right-0 bg-black text-white ${
                megaSuppressed ? 'nav-mega-suppressed' : ''
              }`
        }
      >
        <PromoBannerCarousel banners={promoBanners} />

        <div className="border-b border-white/10">
          <div className="grid h-20 grid-cols-3 items-center gap-6 px-8 xl:px-12">
            {/* Search */}
            <div className="w-full max-w-sm">
              <NavSearch />
            </div>

            {/* Logo */}
            <Link href="/" className="justify-self-center" aria-label="Tahams home">
              <img
                src="/logo-removebg.png"
                alt="Tahams"
                className="h-16 w-auto"
                loading="eager"
              />
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1 justify-self-end">
              <NavIconLink href="/WishList" label="Wishlist">
                <Heart size={20} strokeWidth={1.75} />
              </NavIconLink>
              <NavIconLink href="/MyCart" label="Cart" count={cartCount}>
                <ShoppingBag size={20} strokeWidth={1.75} />
              </NavIconLink>
              <AccountMenu user={user} triggerClass={NAV_ICON_BTN_CLASS}>
                {sideLinks}
              </AccountMenu>
            </div>
          </div>
        </div>

        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-8 pt-3 text-sm font-semibold uppercase tracking-wider">
            {links}
          </ul>
          <ul className="flex items-center justify-center gap-8 px-8 pb-3 pt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            <TopLink href="/collabs/artist">Artist Collabs</TopLink>
            <TopLink href="/collabs/influencer">Influencer Collabs</TopLink>
          </ul>
        </nav>
      </header>

      {/* second nav */}
      <section className="fixed top-0 w-full bg-black z-10">
        <ResponsiveNavBar
          btn={searchBtn}
          fnc={setSearchBtn}
          categories={categories}
          genders={genders}
          isPending={isPending}
          sideLinks={sideLinks}
          user={user}
          authLoading={authLoading}
          onLogout={handleLogout}
          cartCount={cartCount}
        ></ResponsiveNavBar>
      </section>
    </div>
  );
};

export default NavBarCompRe;
