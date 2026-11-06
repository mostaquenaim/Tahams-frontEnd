import { DrawerContext } from '/Contexts/DrawerProvider';
import {
  useNavSubCategories,
  useNavSubSubCategories,
} from '/Hooks/useNavSubCategories';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Package,
  ShoppingBag,
  X,
} from 'lucide-react';

const ROW_CLASS =
  'flex w-full min-h-[52px] items-center justify-between gap-3 px-5 py-3 text-left text-[15px] font-medium text-gray-900 transition-colors active:bg-gray-100 hover:bg-gray-50';

const SectionLabel = ({ children }) => (
  <p className="px-5 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
    {children}
  </p>
);

const NavRow = ({ href, onClick, icon, children, trailing }) => {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        {icon && <span className="flex-none text-gray-500">{icon}</span>}
        <span className="truncate">{children}</span>
      </span>
      {trailing}
    </>
  );

  return (
    <li>
      {href ? (
        <Link href={href} className={ROW_CLASS}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={ROW_CLASS}>
          {content}
        </button>
      )}
    </li>
  );
};

const DrillRow = ({ onClick, children }) => (
  <NavRow
    onClick={onClick}
    trailing={<ChevronRight size={18} className="flex-none text-gray-400" />}
  >
    {children}
  </NavRow>
);

const Loading = () => (
  <div className="flex justify-center py-6" aria-label="Loading">
    <span className="loading loading-spinner loading-sm text-gray-400"></span>
  </div>
);

const LeafLinks = ({ items }) =>
  items.map((item) => (
    <li key={item.id}>
      <Link
        href={`/products/${item.id}`}
        className="block py-2.5 pl-9 pr-5 text-[14px] text-gray-600 transition-colors active:bg-gray-100 hover:text-gray-900"
      >
        {item.name}
      </Link>
    </li>
  ));

const GroupLabel = ({ children }) => (
  <li className="pb-1 pl-9 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
    {children}
  </li>
);

// One collapsible sub-category inside a category panel.
const SubCategorySection = ({ sub, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  const { regular, printed, isPending, isError } = useNavSubSubCategories(sub.id, open);

  let body;
  if (isPending) body = <Loading />;
  else if (isError) body = <p className="py-3 pl-9 text-sm text-gray-400">Couldn&apos;t load. Try again.</p>;
  else if (sub.isEnablePremium) {
    const elite = regular.filter((item) => item.isPremium);
    const standard = regular.filter((item) => !item.isPremium);
    body = (
      <ul className="pb-2">
        {elite.length > 0 && <GroupLabel>Elite</GroupLabel>}
        <LeafLinks items={elite} />
        {standard.length > 0 && <GroupLabel>Regular</GroupLabel>}
        <LeafLinks items={standard} />
      </ul>
    );
  } else {
    body = (
      <ul className="pb-2">
        <LeafLinks items={regular} />
        {printed.length > 0 && <GroupLabel>Printed</GroupLabel>}
        <LeafLinks items={printed} />
      </ul>
    );
  }

  const isEmpty =
    !isPending && !isError && regular.length === 0 && printed.length === 0;

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={ROW_CLASS}
        aria-expanded={open}
      >
        <span className="truncate">{sub.name}</span>
        <ChevronDown
          size={18}
          className={`flex-none text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open &&
        (isEmpty ? (
          <p className="pb-3 pl-9 text-sm text-gray-400">Coming soon</p>
        ) : (
          body
        ))}
    </li>
  );
};

const CategoryPanel = ({ cat }) => {
  const { subCategories, isPending, isError } = useNavSubCategories(cat.id);
  const [imgOk, setImgOk] = useState(true);

  return (
    <div>
      {cat.filename && imgOk && (
        <div className="px-5 pt-4">
          <img
            src={cat.filename}
            alt={cat.name}
            className="h-32 w-full rounded-xl bg-gray-100 object-cover"
            onError={() => setImgOk(false)}
          />
        </div>
      )}
      <div className="px-5 pt-4">
        <Link
          href={`/categories/${encodeURIComponent(cat.name)}`}
          className="flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-semibold uppercase tracking-wider text-white transition-opacity active:opacity-80"
        >
          Shop all {cat.name}
        </Link>
      </div>
      {isPending ? (
        <Loading />
      ) : isError ? (
        <p className="px-5 py-6 text-sm text-gray-400">Couldn&apos;t load this menu.</p>
      ) : (
        <ul className="mt-3 border-t border-gray-100">
          {subCategories.map((sub) => (
            <SubCategorySection
              key={sub.id}
              sub={sub}
              defaultOpen={subCategories.length === 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const LeftDrawer = ({
  categories = [],
  genders = [],
  isPending,
  user,
  authLoading,
  onLogout,
  cartCount = 0,
}) => {
  const { isLeftDrawerOpen, setIsLeftDrawerOpen } = useContext(DrawerContext);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // Navigation stack: [{ type: 'root' }, { type: 'gender', item }, { type: 'category', item }]
  const [stack, setStack] = useState([{ type: 'root' }]);
  const [direction, setDirection] = useState('forward');
  const scrollRef = useRef(null);
  const closeBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const touchStart = useRef(null);
  const wasOpen = useRef(false);

  const close = () => setIsLeftDrawerOpen(false);

  useEffect(() => setMounted(true), []);

  // Close on navigation (covers every link inside the drawer).
  useEffect(() => {
    const handleRouteChange = () => setIsLeftDrawerOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events, setIsLeftDrawerOpen]);

  // Escape to close
  useEffect(() => {
    if (!isLeftDrawerOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsLeftDrawerOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isLeftDrawerOpen, setIsLeftDrawerOpen]);

  // Lock page scroll while open; move focus in, and back to the toggle on close.
  useEffect(() => {
    let resetTimer;
    if (isLeftDrawerOpen) {
      document.body.style.overflow = 'hidden';
      if (closeBtnRef.current) closeBtnRef.current.focus({ preventScroll: true });
    } else {
      document.body.style.overflow = '';
      if (wasOpen.current && toggleBtnRef.current) {
        toggleBtnRef.current.focus({ preventScroll: true });
      }
      // Reset to the main menu once the slide-out has finished.
      resetTimer = setTimeout(() => {
        setDirection('forward');
        setStack([{ type: 'root' }]);
      }, 300);
    }
    wasOpen.current = isLeftDrawerOpen;
    return () => {
      clearTimeout(resetTimer);
      document.body.style.overflow = '';
    };
  }, [isLeftDrawerOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [stack]);

  const push = (view) => {
    setDirection('forward');
    setStack((s) => [...s, view]);
  };

  const back = () => {
    setDirection('back');
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  };

  // Swipe left to close
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (dx < -70 && Math.abs(dy) < 60) close();
  };

  const view = stack[stack.length - 1];

  const genderCategories = (gender) =>
    categories.filter(
      (cat) =>
        cat.isGenderVaried &&
        ((gender.name === 'Men' && cat.isForMen) ||
          (gender.name === 'Women' && cat.isForWomen)),
    );

  const shopCategories = categories.filter(
    (cat) => cat.name !== 'Customize' && !cat.isGenderVaried,
  );

  const renderRoot = () => (
    <>
      {user && (
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="truncate text-sm font-semibold text-gray-900">
            {user.displayName || user.email}
          </p>
        </div>
      )}

      <ul className="pt-2">
        <NavRow href="/">Home</NavRow>
      </ul>

      <SectionLabel>Shop</SectionLabel>
      {isPending ? (
        <Loading />
      ) : (
        <ul>
          {genders.map((gender) => (
            <DrillRow
              key={`g-${gender.id ?? gender.name}`}
              onClick={() => push({ type: 'gender', item: gender })}
            >
              {gender.name}
            </DrillRow>
          ))}
          {shopCategories.map((cat) => (
            <DrillRow
              key={`c-${cat.id}`}
              onClick={() => push({ type: 'category', item: cat })}
            >
              {cat.name}
            </DrillRow>
          ))}
        </ul>
      )}

      <SectionLabel>Collabs</SectionLabel>
      <ul>
        <NavRow href="/collabs/artist">Artist Collabs</NavRow>
        <NavRow href="/collabs/influencer">Influencer Collabs</NavRow>
      </ul>

      <SectionLabel>Account</SectionLabel>
      <ul className="pb-4">
        <NavRow href="/my-orders" icon={<Package size={18} />}>
          My orders
        </NavRow>
        <NavRow href="/WishList" icon={<Heart size={18} />}>
          Wishlist
        </NavRow>
        <NavRow
          href="/MyCart"
          icon={<ShoppingBag size={18} />}
          trailing={
            cartCount > 0 ? (
              <span className="flex h-5 min-w-[20px] flex-none items-center justify-center rounded-full bg-black px-1.5 text-[11px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : null
          }
        >
          Cart
        </NavRow>
        <NavRow href="/dashboard" icon={<LayoutDashboard size={18} />}>
          Dashboard
        </NavRow>
        <NavRow href="/contact" icon={<Mail size={18} />}>
          Contact Us
        </NavRow>
        {!authLoading &&
          (user ? (
            <NavRow
              icon={<LogOut size={18} />}
              onClick={() => {
                close();
                if (onLogout) onLogout();
              }}
            >
              Logout
            </NavRow>
          ) : (
            <NavRow href="/login" icon={<LogIn size={18} />}>
              Login
            </NavRow>
          ))}
      </ul>
    </>
  );

  const renderGender = (gender) => {
    const items = genderCategories(gender);
    return items.length === 0 ? (
      <p className="px-5 py-8 text-center text-sm text-gray-400">Coming soon</p>
    ) : (
      <ul className="pt-2">
        {items.map((cat) => (
          <DrillRow
            key={`gc-${cat.id}`}
            onClick={() => push({ type: 'category', item: cat })}
          >
            {cat.name}
          </DrillRow>
        ))}
      </ul>
    );
  };

  const drawer = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1000] bg-black/50 transition-opacity duration-300 ${
          isLeftDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        data-theme="light"
        className={`fixed inset-y-0 left-0 z-[1001] flex w-[86vw] max-w-sm flex-col bg-white text-gray-900 shadow-2xl transition-[transform,visibility] duration-300 ease-out ${
          isLeftDrawerOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // Also close for links to the page we're already on (no route change).
          if (e.target.closest('a[href]')) close();
        }}
      >
        {/* Header */}
        <div className="flex h-16 flex-none items-center justify-between border-b border-gray-100 px-3">
          {view.type === 'root' ? (
            <Link href="/" className="flex items-center pl-2" aria-label="Tahams home">
              <img src="/logo-removebg.png" alt="Tahams" className="h-10 w-auto invert" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={back}
              className="flex min-w-0 items-center gap-1 rounded-full py-2 pl-1 pr-3 text-[15px] font-semibold text-gray-900 active:bg-gray-100"
              aria-label="Back"
            >
              <ChevronLeft size={22} className="flex-none" />
              <span className="truncate">{view.item.name}</span>
            </button>
          )}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <nav
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
        >
          <div
            key={`${stack.length}-${view.item ? view.item.id ?? view.item.name : 'root'}`}
            className={stack.length > 1 || direction === 'back' ? `nav-panel-${direction}` : ''}
          >
            {view.type === 'root' && renderRoot()}
            {view.type === 'gender' && renderGender(view.item)}
            {view.type === 'category' && <CategoryPanel cat={view.item} />}
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <button
        ref={toggleBtnRef}
        type="button"
        className="drawer-button inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        onClick={() => setIsLeftDrawerOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isLeftDrawerOpen}
      >
        <Menu size={24} strokeWidth={1.75} />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
};

export default LeftDrawer;
