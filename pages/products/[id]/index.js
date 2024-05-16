import React, { useContext, useEffect, useState } from 'react';
import NavbarCompTwo from '../../components/Header/NavbarComp';
import ShowProduct from '../../components/Product/ShowProduct';
import FilterComp from '../../components/Filter/Filter';
import { FaFilter } from "react-icons/fa";
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import Link from 'next/link';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';

const Product = ({ categories }) => {
    const [sortOption, setSortOption] = useState('default');
    const [selectedProducts, setSelectedProducts] = useState(categories)
    // const [showGotoCart, setShowGotoCart] = useState(false)
    const [selectedColors, setSelectedColors] = useState([]);
    const [priceRange, setPriceRange] = useState([200, 2000]);
    const [selectedAvailability, setSelectedAvailability] = useState('');
    const [selectedOffer, setSelectedOffer] = useState('');
    const [colors, setColors] = useState([])

    const { showGotoCart } = useContext(AuthContext)

    // useEffect(() => {
    //     // Check if setShowGotoCart is available in localStorage
    //     const localStorageShowGotoCart = localStorage.getItem('showGotoCart');
    //     setShowGotoCart(localStorageShowGotoCart === 'true');
    //     console.log(localStorageShowGotoCart,"24");
    // }, []);

    const updateSelectedProducts = () => {
        console.log("updated");
        // Apply filters to the original categories
        let filteredProducts = categories.filter(product => {
            // Check color 
            console.log(selectedColors, product);
            if (selectedColors.length > 0 && !selectedColors.includes(product.color.name)) {
                console.log("22");
                return false;
            }

            // Check price range filter
            const productPrice = parseInt(product.sellingPrice * (100 - product.discountPercentage) / 100);
            if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
                console.log("29");
                return false;
            }

            // Check availability filter
            console.log("selectedAvailability", selectedAvailability);
            if (selectedAvailability !== '' && String(product.ifStock) != selectedAvailability) {
                console.log(typeof product.ifStock, typeof selectedAvailability);

                console.log("39", product.ifStock, selectedAvailability, String(product.ifStock) === selectedAvailability);
                return false;
            }

            // Check offer filter
            if (selectedOffer === 'discount' && product.discountPercentage <= 0) {
                console.log("41");
                return false;
            }

            return true;
        });

        // Apply sorting
        if (sortOption === 'priceLowToHigh') {
            console.log("50")
            filteredProducts = filteredProducts.sort((a, b) => parseInt(a.sellingPrice * (100 - a.discountPercentage) / 100) - parseInt(b.sellingPrice * (100 - b.discountPercentage) / 100));
            console.log(filteredProducts);
        } else if (sortOption === 'priceHighToLow') {
            console.log("53");
            filteredProducts = filteredProducts.sort((a, b) => parseInt(b.sellingPrice * (100 - b.discountPercentage) / 100) - parseInt(a.sellingPrice * (100 - a.discountPercentage) / 100));
            console.log(filteredProducts);
        }

        // Update selected products
        setSelectedProducts(filteredProducts);


    };

    const loadColors = async () => {
        try {
            const result = await axios.get('http://localhost:3000/admin/view-colors');
            // Sort the colors array based on categoryName
            setColors(result.data);
        } catch (error) {
            console.error('Error loading colors:', error);
        }
    };

    useEffect(() => {
        loadColors()
    }, [])

    useEffect(() => {
        // setOriginalProducts(categories);
        updateSelectedProducts();
    }, [selectedColors, priceRange, selectedAvailability, selectedOffer, sortOption, categories]);

    // Function to handle color checkbox changes
    const handleColorChange = (color) => {
        // Check if the color is already selected
        if (selectedColors.includes(color)) {
            setSelectedColors(selectedColors.filter((c) => c !== color));
        } else {
            setSelectedColors([...selectedColors, color]);
        }
    }

    // Function to handle price range change
    const handlePriceChange = (value) => {
        console.log(priceRange);
        setPriceRange(value);
    };

    // Function to handle availability change
    const handleAvailabilityChange = (event) => {
        // Update the selected availability
        setSelectedAvailability(event.target.value);
    };

    // Function to handle offer change
    const handleOfferChange = (event) => {
        // Update the selected offer
        setSelectedOffer(event.target.value);
    };

    const handleSortChange = (event) => {
        console.log(event.target.value);
        setSortOption(event.target.value);
    };

    return (
        <div className=''>
            <NavbarCompTwo />
            <div className='pt-48 mx-10 pb-10'>
                {/* Sort By dropdown */}
                <div className='flex text-end justify-end mr-10 md:mr-14 lg:mr-20 pb-10'>
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
                            {/* Page content here */}
                            <label htmlFor="filter-drawer" className="btn btn-primary drawer-button"><FaFilter></FaFilter>Filter</label>
                        </div>
                        <div className="drawer-side z-50" >
                            <label htmlFor="filter-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                            <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content pt-20 ">
                                {/* Sidebar content here */}
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

                {/* Render your product data here */}
                <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3'>
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
                        selectedProducts.length > 0 ?
                            selectedProducts.map((category, index) => (
                                <ShowProduct key={index} item={category}></ShowProduct>
                            ))
                            :
                            <div className='text-3xl text-center'>No product to show!😢</div>
                    }
                </div>
            </div>
            {
                // showGotoCart &&
                <Link
                    href={'/MyCart'}
                    className={` w-full h-20 bg-slate-700 hover:bg-black text-center flex justify-center items-center text-white text-xl sticky bottom-0 ${!showGotoCart && 'pointer-events-none opacity-0 transition duration-700'}`}
                >Go to cart
                </Link>
            }
            <Footer></Footer>
        </div>
    );
};

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;

    try {
        const response = await fetch(`http://localhost:3000/admin/get-product-by-sub-sub-cat/${id}`);
        const categories = await response.json();

        return {
            props: {
                categories,
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        // Return an empty object if there's an error
        return {
            props: {},
        };
    }
}

export default Product;
