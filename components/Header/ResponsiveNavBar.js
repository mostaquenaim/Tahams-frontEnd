import Link from 'next/link';
import { Heart, Search, ShoppingBag, X } from 'lucide-react';
import LeftDrawer from '../Drawers/LeftDrawer';
import PromoBannerCarousel from '../Swiper/PromotionalBanner';
import promoBanners from '/public/promotional-banner-details.json';
import NavSearch from './components/NavSearch';
import AccountMenu from './components/AccountMenu';
import NavIconLink, { NAV_ICON_BTN_CLASS } from './components/NavIconLink';

const ResponsiveNavBar = ({
  btn,
  fnc,
  categories,
  genders,
  isPending,
  sideLinks,
  user,
  authLoading,
  onLogout,
  cartCount = 0,
}) => {
  return (
    <div>
      <div data-theme="black" className="w-full top-0">
        <PromoBannerCarousel banners={promoBanners} />
        <div className="navbar bg-base-100 border-b border-white/10 px-2 sm:px-4">
          <div className="flex-none">
            <LeftDrawer
              categories={categories}
              genders={genders}
              isPending={isPending}
              user={user}
              authLoading={authLoading}
              onLogout={onLogout}
              cartCount={cartCount}
            ></LeftDrawer>
          </div>
          <div className="flex-1 md:ml-0">
            <Link href="/" className="inline-block" aria-label="Tahams home">
              <img src="/logo-removebg.png" className="h-14 w-auto" alt="Tahams" />
            </Link>
          </div>

          <div className="flex flex-none items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              className={NAV_ICON_BTN_CLASS}
              onClick={() => fnc(!btn)}
              aria-label={btn ? 'Close search' : 'Open search'}
              aria-expanded={btn}
              title="Search"
            >
              {btn ? (
                <X size={20} strokeWidth={1.75} />
              ) : (
                <Search size={20} strokeWidth={1.75} />
              )}
            </button>
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
      {/* search  */}
      <div className={btn ? 'w-full px-4 py-3 sm:px-10' : 'hidden'}>
        <div className="mx-auto max-w-2xl">
          <NavSearch autoFocus={btn} onNavigate={() => fnc(false)} />
        </div>
      </div>
    </div>
  );
};

export default ResponsiveNavBar;
