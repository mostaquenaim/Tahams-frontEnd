import React, { useContext, useEffect, useState } from 'react';
import ShowProduct from '/components/Product/ShowProduct';
import FilterComp from '/components/Filter/Filter';
import { FaFilter } from "react-icons/fa";
import useLoadColors from '../../Hooks/useLoadColors';
import Link from 'next/link';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import Loading from '../Loading';

const FetchProducts = ({ categories, admin = false, query = '', isLoading=false }) => {
    const [sortOption, setSortOption] = useState('default');
    const [selectedProducts, setSelectedProducts] = useState(categories);
    const [selectedColors, setSelectedColors] = useState([]);
    const [priceRange, setPriceRange] = useState([1, 4000]);
    const [selectedAvailability, setSelectedAvailability] = useState('');
    const [selectedOffer, setSelectedOffer] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [windowWidth, setWindowWidth] = useState();

    const colors = useLoadColors();
    const { showGotoCart } = useContext(AuthContext);

    useEffect(() => {
        typeof window !== 'undefined' ? setWindowWidth(window.innerWidth) : setWindowWidth(0)

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Set initial width
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const updateSelectedProducts = () => {
        setSelectedProducts(categories);

        let filteredProducts = categories.filter(product => {
            // Check color 
            if (selectedColors.length > 0 && !selectedColors.includes(product.color?.name)) {
                return false;
            }

            // Check price range filter
            const productPrice = parseInt(product.sellingPrice * (100 - product.discountPercentage) / 100);
            if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
                return false;
            }

            // Check availability filter
            if (selectedAvailability !== '' && String(product.ifStock) != selectedAvailability) {
                return false;
            }

            // Check offer filter
            if (selectedOffer === 'discount' && product.discountPercentage <= 0) {
                return false;
            }

            return true;
        });

        // Apply sorting
        if (sortOption === 'priceLowToHigh') {
            filteredProducts = filteredProducts.sort((a, b) => parseInt(a.sellingPrice * (100 - a.discountPercentage) / 100) - parseInt(b.sellingPrice * (100 - b.discountPercentage) / 100));
        } else if (sortOption === 'priceHighToLow') {
            filteredProducts = filteredProducts.sort((a, b) => parseInt(b.sellingPrice * (100 - b.discountPercentage) / 100) - parseInt(a.sellingPrice * (100 - a.discountPercentage) / 100));
        }

        // Update selected products
        setSelectedProducts(filteredProducts);
    };

    useEffect(() => {
        if (categories) {
            updateSelectedProducts();
        }
    }, [selectedColors, priceRange, selectedAvailability, selectedOffer, sortOption, categories]);

    if (!categories || isLoading) {
        return <div className='min-h-screen flex justify-center items-center text-center'>
            <Loading />
        </div>;
    }

    const handleColorChange = (color) => {
        if (selectedColors.includes(color)) {
            setSelectedColors(selectedColors.filter((c) => c !== color));
        } else {
            setSelectedColors([...selectedColors, color]);
        }
    };

    const handlePriceChange = (value) => {
        setPriceRange(value);
    };

    const handleAvailabilityChange = (event) => {
        setSelectedAvailability(event.target.value);
    };

    const handleOfferChange = (event) => {
        setSelectedOffer(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginatedProducts = selectedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(selectedProducts.length / itemsPerPage);

    return (
        <div>
            <div className='pt-20 lg:pt-48 mx-10'>
                {/* Sort By dropdown */}
                <div className='flex flex-col items-center md:flex-row gap-4 justify-between mr-10 md:mr-14 lg:mr-20  lg:pb-10'>
                    <div className='font-semibold text-3xl uppercase underline'>{categories[0]?.pscs[0]?.category?.category?.category?.name}</div>
                    <select id="sortDropdown" value={sortOption} onChange={handleSortChange}>
                        <option value="default">Sort by: Default</option>
                        <option value="priceLowToHigh">Price: Low to High</option>
                        <option value="priceHighToLow">Price: High to Low</option>
                    </select>
                </div>

                <div className='flex text-center items-center justify-center gap-2 py-3 md:hidden'>
                    <div className="drawer">
                        <input id="filter-drawer" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label htmlFor="filter-drawer" className="btn btn-primary drawer-button"><FaFilter></FaFilter>Filter</label>
                        </div>
                        <div className="drawer-side z-50">
                            <label htmlFor="filter-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                            <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content pt-20">
                                <FilterComp
                                    handleColorChange={handleColorChange}
                                    handlePriceChange={handlePriceChange}
                                    handleAvailabilityChange={handleAvailabilityChange}
                                    handleOfferChange={handleOfferChange}
                                    selectedColors={selectedColors}
                                    priceRange={priceRange}
                                    selectedOffer={selectedOffer}
                                    selectedAvailability={selectedAvailability}
                                    colors={colors}
                                ></FilterComp>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                    <div className='hidden md:row-span-5 md:block'>
                        <FilterComp
                            handleColorChange={handleColorChange}
                            handlePriceChange={handlePriceChange}
                            handleAvailabilityChange={handleAvailabilityChange}
                            handleOfferChange={handleOfferChange}
                            selectedColors={selectedColors}
                            priceRange={priceRange}
                            selectedOffer={selectedOffer}
                            selectedAvailability={selectedAvailability}
                            colors={colors}
                        ></FilterComp>
                    </div>
                    {
                        paginatedProducts ?
                            paginatedProducts.length > 0 ? (
                                paginatedProducts.map((category, index) => (
                                    <ShowProduct key={index} item={category}></ShowProduct>
                                ))
                            ) : (
                                <div className="text-3xl text-center">No product to show! 😢</div>
                            )
                            :
                            <div className="text-3xl text-center">Loading...</div>
                    }
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-center items-center my-5 space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-lg transition-all duration-300 border border-black text-black hover:bg-black hover:text-white 
                                ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => {
                            const page = index + 1;

                            if (page === 1 || page === totalPages) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-lg transition-all duration-300 border border-black text-black hover:bg-black hover:text-white 
                                            ${currentPage === page ? "bg-black text-white scale-105" : "bg-white"}`}
                                    >
                                        {page}
                                    </button>
                                );
                            }

                            if (
                                (page === currentPage - 1 || page === currentPage || page === currentPage + 1) &&
                                windowWidth >= 640
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-lg transition-all duration-300 border border-black text-black hover:bg-black hover:text-white 
                                            ${currentPage === page ? "bg-black text-white scale-105" : "bg-white"}`}
                                    >
                                        {page}
                                    </button>
                                );
                            }

                            if (
                                windowWidth >= 640 &&
                                (page === currentPage - 2 ||
                                    page === currentPage + 2 ||
                                    (currentPage === 1 && page === 3) ||
                                    (currentPage === totalPages && page === totalPages - 2))
                            ) {
                                return <span key={page} className="px-2 text-gray-500">...</span>;
                            }

                            if (
                                (page === currentPage - 1 || page === currentPage || page === currentPage + 1) &&
                                windowWidth < 640
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-lg transition-all duration-300 border border-black text-black hover:bg-black hover:text-white 
                                            ${currentPage === page ? "bg-black text-white scale-105" : "bg-white"}`}
                                    >
                                        {page}
                                    </button>
                                );
                            }

                            return null;
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-lg transition-all duration-300 border border-black text-black hover:bg-black hover:text-white 
                                ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            {
                // showGotoCart &&
                <Link
                    href={'/MyCart'}
                    className={` w-full h-20 bg-slate-700 hover:bg-black text-center flex justify-center items-center text-white text-xl sticky bottom-0 ${!showGotoCart && 'pointer-events-none opacity-0 transition duration-700'}`}
                >Go to cart
                </Link>
            }
        </div>
    );
};

export default FetchProducts;