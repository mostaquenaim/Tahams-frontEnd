import React, { useContext, useEffect, useMemo, useState } from 'react';
import ShowProduct from '/components/Product/ShowProduct';
import FilterComp from '/components/Filter/Filter';
import { FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useLoadColors from '../../Hooks/useLoadColors';
import Link from 'next/link';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import Loading from '../Loading';
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';

const FetchProducts = ({
  categories,
  admin = false,
  query = '',
  isLoading = false,
}) => {
  // console.log(categories,'categories');
  const [sortOption, setSortOption] = useState('default');
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([1, 4000]);
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
      <div className="min-h-[70vh] flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="pt-40 lg:pt-56 pb-8 px-6 lg:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 uppercase">
              {categoryName}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {filteredAndSortedProducts.length} Products Found
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
              className="select select-bordered select-sm rounded-full bg-white text-gray-700"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sort by: Default</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-10">
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
            {/* show filters above product section  */}
            {(selectedColors.length > 0 ||
              selectedAvailability !== '' ||
              selectedOffer !== 'all') && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedColors.map((color) => (
                  <span
                    key={color}
                    className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-[11px] font-bold uppercase rounded-full"
                  >
                    {color}
                    <button
                      onClick={() =>
                        setSelectedColors((prev) =>
                          prev.filter((c) => c !== color),
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedAvailability !== '' && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-[11px] font-bold uppercase rounded-full">
                    {selectedAvailability === 'true'
                      ? 'In Stock'
                      : 'Out of Stock'}
                    <button onClick={() => setSelectedAvailability('')}>
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedColors([]);
                    setSelectedAvailability('');
                    setSelectedOffer('all');
                  }}
                  className="text-[11px] font-bold uppercase text-red-600 ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {paginatedProducts.map((item, index) => (
                  <ShowProduct key={item.id || index} item={item} />
                ))}
              </div>
            ) : (
              <EmptyStateSection />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-full disabled:opacity-30 hover:bg-gray-50 transition"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
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
        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">NEW</span>
      </Link>
    </div>
  );
};

// Extracted Empty State for Cleaner Code
const EmptyStateSection = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 px-6">
    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
      <svg
        className="w-10 h-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 8l3 3 3-3"
        />
      </svg>
    </div>
    <h3 className="text-2xl font-semibold text-gray-800">No Products Found</h3>
    <p className="text-gray-500 mt-2 max-w-sm">
      We couldn't find any products matching your current filters. Try adjusting
      them or contact us.
    </p>

    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
      <SocialBtn
        icon={<Phone size={18} />}
        label="Call"
        href="tel:+8801602054102"
      />
      <SocialBtn
        icon={<Facebook size={18} />}
        label="Facebook"
        href="https://facebook.com/tahamsbd/"
      />
      <SocialBtn
        icon={<Instagram size={18} />}
        label="Instagram"
        href="https://instagram.com/tahams_bd/"
      />
      <SocialBtn
        icon={<MessageCircle size={18} />}
        label="Chat"
        href="https://m.me/111664024670524"
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
