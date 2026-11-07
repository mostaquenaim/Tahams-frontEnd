import Link from 'next/link';

export const NAV_ICON_BTN_CLASS =
  'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

// Navbar icon link with an optional count badge (cart).
const NavIconLink = ({ href, label, count = 0, children }) => (
  <Link href={href} className={NAV_ICON_BTN_CLASS} aria-label={label} title={label}>
    {children}
    {count > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold leading-none text-black">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </Link>
);

export default NavIconLink;
