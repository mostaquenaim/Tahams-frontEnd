import React, { useContext, useEffect, useMemo, useState } from 'react';
import ShowProduct from '/components/Product/ShowProduct';
import FilterComp from '/components/Filter/Filter';
import { FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useLoadColors from '../../Hooks/useLoadColors';
import Link from 'next/link';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import {
  SkeletonGrid,
  CONTACT,
  buttonPrimary,
  buttonSecondary,
} from '../Storefront/StorefrontUI';
import { FiSearch } from 'react-icons/fi';
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';

const DEFAULT_PRICE_RANGE = [1, 10000];

const FetchProducts = ({
  categories,
  admin = false,
  query = '',
  isLoading = false,
}) => {
  // console.log(categories,'categories');
  const [sortOption, setSortOption] = useState('default');
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [windowWidth, setWindowWidth] = useState(0);

  const colors = useLoadColors();
  const { showGotoCart } = useContext(AuthContext);

  // Dynamic Category Name Extraction
  const categoryName = useMemo(() => {
    return (
      categories?.[0]?.pscs?.[0]?.category?.category?.category?.name ||
      'Collection'
    );
  }, [categories]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasActiveFilters =
    selectedColors.length > 0 ||
    selectedAvailability !== '' ||
    selectedOffer === 'discount' ||
    priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
    priceRange[1] !== DEFAULT_PRICE_RANGE[1];

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedAvailability('');
    setSelectedOffer('');
    setPriceRange(DEFAULT_PRICE_RANGE);
  };

  // Filters shrink the result set, so go back to page 1 or the customer can
  // end up on a page that no longer exists.
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedColors,
    priceRange,
    selectedAvailability,
    selectedOffer,
    sortOption,
    categories,
  ]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!categories) return [];
    let filtered = categories.filter((product) => {
      if (
        selectedColors.length > 0 &&
        !selectedColors.includes(product.color?.name)
      )
        return false;
      const productPrice = parseInt(
        (product.sellingPrice * (100 - product.discountPercentage)) / 100,
      );
      if (productPrice < priceRange[0] || productPrice > priceRange[1])
        return false;
      if (
        selectedAvailability !== '' &&
        String(product.ifStock) !== selectedAvailability
      )
        return false;
      if (selectedOffer === 'discount' && product.discountPercentage <= 0)
        return false;
      return true;
    });

    if (sortOption === 'priceLowToHigh') {
      filtered.sort(
        (a, b) =>
          (a.sellingPrice * (100 - a.discountPercentage)) / 100 -
          (b.sellingPrice * (100 - b.discountPercentage)) / 100,
      );
    } else if (sortOption === 'priceHighToLow') {
      filtered.sort(
        (a, b) =>
          (b.sellingPrice * (100 - b.discountPercentage)) / 100 -
          (a.sellingPrice * (100 - a.discountPercentage)) / 100,
      );
    }
    return filtered;
  }, [
    categories,
    selectedColors,
    priceRange,
    selectedAvailability,
    selectedOffer,
    sortOption,
  ]);

  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  if (!categories || isLoading) {
    return (
      <div className="min-h-screen bg-white px-4 pb-16 pt-40 lg:pt-56">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-56 animate-pulse rounded bg-gray-100" />
          <div className="mt-10">
            <SkeletonGrid count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="pt-40 lg:pt-56 pb-8 px-6 lg:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-light tracking-tight text-gray-900 uppercase">
              {query ? `Results for "${query}"` : categoryName}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {filteredAndSortedProducts.length}{' '}
              {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
              {hasActiveFilters &&
              categories.length !== filteredAndSortedProducts.length
                ? ` (of ${categories.length})`
                : ''}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="md:hidden drawer w-auto">
              <input
                id="filter-drawer"
                type="checkbox"
                className="drawer-toggle"
              />
              <label
                htmlFor="filter-drawer"
                className="btn btn-outline btn-sm rounded-full px-5 flex gap-2"
              >
                <FaFilter className="text-xs" /> Filter
                {hasActiveFilters && (
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                )}
              </label>
              <div className="drawer-side z-[100]">
                <label
                  htmlFor="filter-drawer"
                  className="drawer-overlay"
                ></label>
                <div className="p-6 w-80 min-h-full bg-white text-base-content pt-10">
                  <h2 className="text-xl font-bold mb-6">Filters</h2>
                  <FilterComp
                    handleColorChange={(c) =>
                      setSelectedColors((prev) =>
                        prev.includes(c)
                          ? prev.filter((x) => x !== c)
                          : [...prev, c],
                      )
                    }
                    handlePriceChange={setPriceRange}
                    handleAvailabilityChange={(e) =>
                      setSelectedAvailability(e.target.value)
                    }
                    handleOfferChange={(e) => setSelectedOffer(e.target.value)}
                    selectedColors={selectedColors}
                    priceRange={priceRange}
                    selectedOffer={selectedOffer}
                    selectedAvailability={selectedAvailability}
                    colors={colors}
                  />
                </div>
              </div>
            </div>

            <select
              aria-label="Sort products"
              className="select select-bordered select-sm rounded-full bg-white text-gray-700"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sort by: Featured</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                Refine By
              </h3>
              <FilterComp
                handleColorChange={(c) =>
                  setSelectedColors((prev) =>
                    prev.includes(c)
                      ? prev.filter((x) => x !== c)
                      : [...prev, c],
                  )
                }
                handlePriceChange={setPriceRange}
                handleAvailabilityChange={(e) =>
                  setSelectedAvailability(e.target.value)
                }
                handleOfferChange={(e) => setSelectedOffer(e.target.value)}
                selectedColors={selectedColors}
                priceRange={priceRange}
                selectedOffer={selectedOffer}
                selectedAvailability={selectedAvailability}
                colors={colors}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {selectedColors.map((color) => (
                  <FilterChip
                    key={color}
                    label={color}
                    onRemove={() =>
                      setSelectedColors((prev) =>
                        prev.filter((c) => c !== color),
                      )
                    }
                  />
                ))}
                {selectedAvailability !== '' && (
                  <FilterChip
                    label={
                      selectedAvailability === 'true'
                        ? 'In stock'
                        : 'Out of stock'
                    }
                    onRemove={() => setSelectedAvailability('')}
                  />
                )}
                {selectedOffer === 'discount' && (
                  <FilterChip
                    label="On sale"
                    onRemove={() => setSelectedOffer('')}
                  />
                )}
                {(priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
                  priceRange[1] !== DEFAULT_PRICE_RANGE[1]) && (
                  <FilterChip
                    label={`৳${priceRange[0]} - ৳${priceRange[1]}`}
                    onRemove={() => setPriceRange(DEFAULT_PRICE_RANGE)}
                  />
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-1 text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {paginatedProducts.map((item, index) => (
                  <ShowProduct key={item.id || index} item={item} />
                ))}
              </div>
            ) : (
              <EmptyStateSection
                filtered={hasActiveFilters}
                onClear={clearFilters}
                query={query}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 space-x-2">
                <button
                  onClick={() => {
                    setCurrentPage((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="p-2 border rounded-full disabled:opacity-30 hover:bg-gray-50 transition"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      aria-current={currentPage === page ? 'page' : undefined}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => {
                    setCurrentPage((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="p-2 border rounded-full disabled:opacity-30 hover:bg-gray-50 transition"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Sticky Cart Bar */}
      <Link
        href="/MyCart"
        className={`fixed bottom-0 left-0 w-full h-16 bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-3 transition-all duration-500 z-[60] shadow-2xl ${
          !showGotoCart
            ? 'translate-y-full opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <span className="font-semibold uppercase tracking-widest text-sm">
          View Cart & Checkout
        </span>
      </Link>
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-1.5 text-xs font-medium text-gray-700">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-300 hover:text-black"
    >
      ×
    </button>
  </span>
);

const EmptyStateSection = ({ filtered, onClear, query }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
      <FiSearch className="h-7 w-7" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800">
      {filtered
        ? 'Nothing matches those filters'
        : query
        ? `No results for "${query}"`
        : 'No products here yet'}
    </h3>
    <p className="mt-2 max-w-sm text-sm text-gray-500">
      {filtered
        ? 'Try removing a filter or widening the price range.'
        : query
        ? 'Check the spelling, try a more general word, or browse our collections.'
        : 'New pieces are added regularly. Check back soon, or reach out and we can help you find something.'}
    </p>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {filtered && (
        <button type="button" onClick={onClear} className={buttonPrimary}>
          Clear filters
        </button>
      )}
      <Link href="/" className={filtered ? buttonSecondary : buttonPrimary}>
        Back to home
      </Link>
    </div>

    <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
      <SocialBtn
        icon={<Phone size={18} />}
        label="Call"
        href={`tel:${CONTACT.phone}`}
      />
      <SocialBtn
        icon={<Facebook size={18} />}
        label="Facebook"
        href={CONTACT.facebook}
      />
      <SocialBtn
        icon={<Instagram size={18} />}
        label="Instagram"
        href={CONTACT.instagram}
      />
      <SocialBtn
        icon={<MessageCircle size={18} />}
        label="Chat"
        href={CONTACT.messenger}
      />
    </div>
  </div>
);

const SocialBtn = ({ icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-black transition-all group"
  >
    <div className="text-gray-400 group-hover:text-black transition-colors">
      {icon}
    </div>
    <span className="text-xs font-medium text-gray-600 group-hover:text-black">
      {label}
    </span>
  </a>
);

export default FetchProducts;
