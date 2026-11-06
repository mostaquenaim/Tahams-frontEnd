import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { User } from 'lucide-react';

// Account dropdown for the navbar. `children` are the <li> menu items.
const AccountMenu = ({ user, triggerClass, children }) => {
  const detailsRef = useRef(null);
  const router = useRouter();

  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (detailsRef.current && !detailsRef.current.contains(e.target)) close();
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    router.events.on('routeChangeStart', close);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      router.events.off('routeChangeStart', close);
    };
  }, [router.events]);

  const userLabel = user ? user.displayName || user.email : '';

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className={`${triggerClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
        aria-label="Account menu"
        title="Account"
      >
        <User size={20} strokeWidth={1.75} />
      </summary>
      <ul
        onClick={(e) => {
          if (e.target.closest('a, button')) close();
        }}
        className="menu absolute right-0 top-full z-50 mt-2 w-56 rounded-box border border-white/10 bg-base-100 p-2 text-sm font-normal normal-case tracking-normal text-white shadow-2xl"
      >
        {userLabel && (
          <li className="menu-title">
            <span className="block truncate normal-case">{userLabel}</span>
          </li>
        )}
        {children}
      </ul>
    </details>
  );
};

export default AccountMenu;
