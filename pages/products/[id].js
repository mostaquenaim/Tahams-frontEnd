import React, { useState } from 'react';
import NavbarCompTwo from '../components/Header/NavbarComp';
import ShowProduct from '../components/Product/ShowProduct';
import FilterComp from '../components/Filter/Filter';
import { FaFilter } from "react-icons/fa";

const Product = ({ categories }) => {
    const [sortOption, setSortOption] = useState('default');

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    return (
        <div className=''>
            <NavbarCompTwo />
            <div className='pt-48 mx-10'>
                {/* Sort By dropdown */}
                <div className='flex text-end justify-end mr-10 md:mr-14 lg:mr-20 pb-10'>
                    {/* <label htmlFor="sortDropdown" className=''>Sort By:</label> */}
                    <select id="sortDropdown" value={sortOption} onChange={handleSortChange}>
                        <option value="default">Sort By</option>
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
                        <div className="drawer-side">
                            <label htmlFor="filter-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                            <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content pt-20 z-50">
                                {/* Sidebar content here */}
                                <FilterComp></FilterComp>
                            </ul>
                        </div>
                    </div>

                </div>
                {/* Render your product data here */}
                <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                    <div className='hidden md:row-span-5 md:block'>
                        <FilterComp></FilterComp>
                    </div>
                    {categories.map((category, index) => (
                        <ShowProduct key={index} item={category}></ShowProduct>
                    ))}
                </div>
            </div>
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
