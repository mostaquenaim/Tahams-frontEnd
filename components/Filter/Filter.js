import React, { useState } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const FilterComp = ({
    handleColorChange,
    handlePriceChange,
    handleAvailabilityChange,
    handleOfferChange,
    selectedColors,
    priceRange,
    selectedAvailability,
    selectedOffer,
    colors
}) => {
    const headingStyle = 'text-lg md:text-xl lg:text-2xl py-3 font-semibold text-gray-800';

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">

            {/* Colors */}
            <div className="filter-section">
                <div className='py-3'>
                    <span className={headingStyle}>
                        Colors
                    </span>
                </div>
                <div className='space-y-2'>
                    {colors.map((color) => (
                        <label key={color.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="color"
                                value={color.name}
                                checked={selectedColors.includes(color.name)}
                                onChange={() => handleColorChange(color.name)}
                                className="form-checkbox text-indigo-600"
                            />
                            <span className="text-gray-700">{color.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
                <div className='py-3'>
                    <span className={headingStyle}>
                        Price Range
                    </span>
                </div>
                <RangeSlider
                    min={1}
                    max={10000}
                    defaultValue={priceRange}
                    onInput={(value) => handlePriceChange(value)}
                    className="w-full"
                />
                <div className="mt-2 text-gray-600">
                    <span>৳{priceRange[0]} - ৳{priceRange[1]}</span>
                </div>
            </div>

            {/* Availability */}
            <div className="filter-section">
                <div className='py-3'>
                    <span className={headingStyle}>
                        Availability
                    </span>
                </div>
                <div className="space-y-2">
                    <div>
                        <input
                            type="radio"
                            name="availability"
                            value=""
                            checked={selectedAvailability === ''}
                            onChange={handleAvailabilityChange}
                            className="form-radio text-indigo-600"
                        />
                        <label className="ml-2 text-gray-700">All</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="availability"
                            value="true"
                            checked={selectedAvailability === 'true'}
                            onChange={handleAvailabilityChange}
                            className="form-radio text-indigo-600"
                        />
                        <label className="ml-2 text-gray-700">In Stock</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="availability"
                            value="false"
                            checked={selectedAvailability === 'false'}
                            onChange={handleAvailabilityChange}
                            className="form-radio text-indigo-600"
                        />
                        <label className="ml-2 text-gray-700">Out of Stock</label>
                    </div>
                </div>
            </div>

            {/* Offers */}
            <div className="filter-section">
                <div className='py-3'>
                    <span className={headingStyle}>
                        Offer
                    </span>
                </div>
                <div className="space-y-2">
                    <div>
                        <input
                            type="radio"
                            name="offer"
                            value="all"
                            checked={selectedOffer === 'all'}
                            onChange={handleOfferChange}
                            className="form-radio text-indigo-600"
                        />
                        <label className="ml-2 text-gray-700">All</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="offer"
                            value="discount"
                            checked={selectedOffer === 'discount'}
                            onChange={handleOfferChange}
                            className="form-radio text-indigo-600"
                        />
                        <label className="ml-2 text-gray-700">Discount</label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterComp;
