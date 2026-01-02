import React from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { IoCloseCircleOutline } from "react-icons/io5";

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
    const sectionTitle = "text-xs font-bold uppercase tracking-widest text-slate-900 mb-4 flex justify-between items-center";

    const clearAll = () => {
        // Reset logic - call your handler functions with default values
        handlePriceChange([1, 10000]);
        if (selectedColors.length > 0) colors.forEach(c => selectedColors.includes(c.name) && handleColorChange(c.name));
        handleAvailabilityChange({ target: { value: '' } });
        handleOfferChange({ target: { value: 'all' } });
    };

    console.log(colors);
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-grow space-y-8 pb-24 md:pb-6">
                
                {/* Colors Section - Visual Swatches */}
                <div className="filter-section">
                    <h3 className={sectionTitle}>Colors</h3>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => {
                            const isSelected = selectedColors.includes(color.name);
                            return (
                                <button
                                    key={color.id}
                                    onClick={() => handleColorChange(color.name)}
                                    className={`group relative flex items-center justify-center p-1 rounded-full border-2 transition-all ${
                                        isSelected ? 'border-black scale-110' : 'border-transparent hover:border-slate-200'
                                    }`}
                                    title={color.name}
                                >
                                    <span 
                                        className="w-6 h-6 rounded-full border border-slate-100 shadow-inner"
                                        style={{ backgroundColor: color.colorCode || color.name.toLowerCase() }}
                                    />
                                    {isSelected && (
                                        <span className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5">
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price Range Section */}
                <div className="filter-section">
                    <h3 className={sectionTitle}>Price Range</h3>
                    <div className="px-2">
                        <RangeSlider
                            min={1}
                            max={10000}
                            step={50}
                            value={priceRange}
                            onInput={(value) => handlePriceChange(value)}
                            className="modern-slider"
                        />
                        <div className="flex justify-between mt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Min</span>
                                <span className="text-sm font-semibold">৳{priceRange[0]}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Max</span>
                                <span className="text-sm font-semibold">৳{priceRange[1]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Availability Section - Toggle Chips */}
                <div className="filter-section">
                    <h3 className={sectionTitle}>Stock Status</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { label: 'All Items', value: '' },
                            { label: 'In Stock Only', value: 'true' },
                            { label: 'Out of Stock', value: 'false' }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleAvailabilityChange({ target: { value: opt.value } })}
                                className={`text-left px-4 py-2.5 text-sm transition-all rounded-lg border ${
                                    selectedAvailability === opt.value 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Offers Section */}
                <div className="filter-section">
                    <h3 className={sectionTitle}>Promotions</h3>
                    <div className="flex gap-2">
                        {[
                            { label: 'All', value: 'all' },
                            { label: 'On Sale', value: 'discount' }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleOfferChange({ target: { value: opt.value } })}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-tighter rounded-full border transition-all ${
                                    selectedOffer === opt.value 
                                    ? 'bg-red-600 text-white border-red-600' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Action Footer - Sticky for small devices */}
            <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-slate-100 flex gap-3 z-50">
                <button 
                    onClick={clearAll}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                    <IoCloseCircleOutline size={18}/>
                    Clear
                </button>
                <label 
                    htmlFor="filter-drawer" // This closes the DaisyUI drawer
                    className="flex-[2] flex items-center justify-center py-3 bg-black text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform cursor-pointer"
                >
                    Apply Filters
                </label>
            </div>
        </div>
    );
};

export default FilterComp;