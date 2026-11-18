import { useContext, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiCheck, FiX } from 'react-icons/fi';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useCart from '/Hooks/useCart';

const VISIBLE_MS = 8000;

// "Added to cart" confirmation with a clear way to the cart. Shown after a
// successful add: callers do `setShowGotoCart(Date.now())` (a new value each
// time, so a second add restarts the timer). Shared by product listings and
// the product page.
//
// `raised` lifts it above the product page's sticky buy bar on phones.
const AddedToCartBar = ({ raised = false }) => {
  const { showGotoCart, setShowGotoCart } = useContext(AuthContext);
  const [, cart, refetchCart] = useCart();
  const timer = useRef(null);
  const visible = !!showGotoCart;

  const hide = () => setShowGotoCart(false);
  const stopTimer = () => clearTimeout(timer.current);
  const startTimer = () => {
    stopTimer();
    timer.current = setTimeout(hide, VISIBLE_MS);
  };

  useEffect(() => {
    if (!showGotoCart) return undefined;
    // Refresh the cart so this bar and the navbar badge show the new count.
    refetchCart();
    startTimer();
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGotoCart]);

  // The flag lives in app-wide context; clear it when leaving the page so the
  // bar doesn't pop up again later on another page.
  useEffect(() => () => setShowGotoCart(false), [setShowGotoCart]);

  const count = cart.length;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 z-[60] px-3 transition-all duration-300 ease-out ${
        raised ? 'bottom-24 lg:bottom-6' : 'bottom-4 sm:bottom-6'
      } ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <div
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
        onTouchStart={stopTimer}
        onFocus={stopTimer}
        className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
          <FiCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">Added to cart</p>
          {count > 0 && (
            <p className="truncate text-xs text-gray-500">
              {count} item{count === 1 ? '' : 's'} in your cart
            </p>
          )}
        </div>
        <Link
          href="/MyCart"
          onClick={hide}
          tabIndex={visible ? 0 : -1}
          className="shrink-0 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          View cart
        </Link>
        <button
          type="button"
          onClick={hide}
          tabIndex={visible ? 0 : -1}
          aria-label="Close"
          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AddedToCartBar;
