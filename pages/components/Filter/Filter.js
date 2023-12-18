import React, { useState } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const FilterComp = (
    {
        handleColorChange,
        handlePriceChange,
        handleAvailabilityChange,
        handleOfferChange,
        selectedColors,
        priceRange,
        selectedAvailability,
        selectedOffer,
        colors
    }
) => {
    console.log(colors);
    const headingStyle = 'text-lg md:text-xl lg:text-2xl py-3 border-b-2 font-semibold';

    return (
        <div className="filter-container">
            {/* Colors */}
            <div className="filter-section">
                <div className='py-5'>
                    <span className={headingStyle}>
                        Color
                    </span>
                </div>
                <div className='flex flex-col gap-1'>
                    {
                        colors.map((color) => (
                            <label key={color.id}>
                                <input
                                    type="checkbox"
                                    name="color"
                                    value={color.name}
                                    checked={selectedColors.includes(color.name)}
                                    onChange={() => handleColorChange(color.name)}
                                />
                                {color.name}
                            </label>
                        ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
                <div className='py-5'>
                    <span className={headingStyle}>
                        Price Range
                    </span>
                </div>
                <RangeSlider
                    min={100}
                    max={3000}
                    defaultValue={priceRange}
                    onInput={(value) => handlePriceChange(value)}
                />
                ৳{priceRange[0]} - ৳{priceRange[1]}
            </div>

            {/* Availability */}
            <div className="filter-section">
                <div className='py-5'>
                    <span className={headingStyle}>
                        Availability
                    </span>
                </div>
                <div>
                    <div>
                        <input
                            type="radio"
                            name="availability"
                            value=''
                            checked={selectedAvailability === ''}
                            onChange={handleAvailabilityChange}
                        />
                        All
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="availability"
                            value='true'
                            checked={selectedAvailability === 'true'}
                            onChange={handleAvailabilityChange}
                        />
                        In Stock
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="availability"
                            value='false'
                            checked={selectedAvailability === 'false'}
                            onChange={handleAvailabilityChange}
                        />
                        Out of Stock
                    </div>
                </div>
            </div>

            {/* Offers */}
            <div className="filter-section">
                <div className='py-5'>
                    <span className={headingStyle}>
                        Offer
                    </span>
                </div>
                <div>
                    <div>
                        <input
                            type="radio"
                            name="offer"
                            value="all"
                            checked={selectedOffer === 'all'}
                            onChange={handleOfferChange}
                        />
                        All
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="offer"
                            value="discount"
                            checked={selectedOffer === 'discount'}
                            onChange={handleOfferChange}
                        />
                        Discount
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterComp;
