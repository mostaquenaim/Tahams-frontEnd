import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Search, X } from 'lucide-react';
import useAxiosPublic from '/Hooks/useAxiosPublic';

const SEARCH_DEBOUNCE_DELAY = 300;

// Product search used by both the desktop and the mobile navbar.
// onNavigate runs right before we leave the page (e.g. to close the mobile panel).
const NavSearch = ({ onNavigate, autoFocus = false }) => {
  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const requestId = useRef(0);

  useEffect(() => {
    router.prefetch('/search-product');
  }, [router]);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced suggestions; a slower earlier response never overwrites a newer one.
  useEffect(() => {
    const query = term.trim();
    const id = (requestId.current += 1);

    if (!query) {
      setResults([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axiosPublic.get('admin/search-bar-products', {
          params: { q: query },
        });
        if (id !== requestId.current) return;
        setResults(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (id !== requestId.current) return;
        console.error('Search error:', error);
        setResults([]);
      } finally {
        if (id === requestId.current) setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [term, axiosPublic]);

  const reset = () => {
    setTerm('');
    setResults([]);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const query = term.trim();
    if (!query) return;
    reset();
    if (onNavigate) onNavigate();
    router.push(`/search-product?search=${encodeURIComponent(query)}`);
  };

  const handleResultClick = (productId) => {
    reset();
    if (onNavigate) onNavigate();
    router.push(`/products/details/${productId}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      e.currentTarget.blur();
    }
  };

  const query = term.trim();

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          enterKeyHint="search"
          autoComplete="off"
          className="h-11 w-full rounded-full border border-white/15 bg-white/10 pl-11 pr-28 text-sm text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/40 focus:bg-white/15"
          placeholder="Search products..."
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
        />
        {term && (
          <button
            type="button"
            onClick={() => {
              reset();
              if (inputRef.current) inputRef.current.focus();
            }}
            className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 rounded-full p-1 text-white/50 transition-colors hover:text-white"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={!query}
          className="absolute bottom-1 right-1 top-1 rounded-full bg-white px-4 text-xs font-semibold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Search
        </button>
      </form>

      {isOpen && query && (
        <div
          data-theme="light"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-white text-left text-gray-900 shadow-2xl ring-1 ring-black/5"
        >
          {isLoading ? (
            <div className="px-4 py-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="max-h-80 overflow-y-auto py-1">
                {results.map((product) => (
                  <li key={product.id ?? product.productId}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(product.productId)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-100"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.filename}`}
                        alt={product.name}
                        className="h-12 w-12 flex-none rounded-md bg-gray-100 object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                      <span className="truncate text-sm font-medium">
                        {product.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleSubmit}
                className="block w-full border-t border-gray-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50"
              >
                See all results for &ldquo;{query}&rdquo;
              </button>
            </>
          ) : (
            <div className="px-4 py-4 text-center text-sm text-gray-500">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavSearch;
