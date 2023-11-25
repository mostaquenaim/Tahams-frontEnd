import React from 'react';



const FilterComp = () => {

    const headingStyle = 'text-lg md:text-xl lg:text-2xl py-3 border-b-2 font-semibold'

    return (
        <div className="filter-container">
            {/* Sizes */}
            <div className="filter-section">
                <div className='py-5'>
                    <span className={headingStyle}>
                        Filter by Size
                    </span>
                </div>
                <div className='flex flex-col gap-1'>
                    <label>
                        <input type="checkbox" name="size" value="small" />
                        Small
                    </label>
                    <label>
                        <input type="checkbox" name="size" value="medium" />
                        Medium
                    </label>
                    <label>
                        <input type="checkbox" name="size" value="large" />
                        Large
                    </label>
                </div>
            </div>

            {/* Colors */}
            <div className="filter-section">
                <div className='py-5'>
                    <span className={headingStyle}>
                        Filter by Colors
                    </span>
                </div>
                <div className='flex flex-col gap-1'>
                    <label>
                        <input type="checkbox" name="color" value="red" />
                        Red
                    </label>
                    <label>
                        <input type="checkbox" name="color" value="blue" />
                        Blue
                    </label>
                    <label>
                        <input type="checkbox" name="color" value="green" />
                        Green
                    </label>
                </div>
                {/* Add more color options as needed */}
            </div>

            {/* Tags */}
            <div className="filter-section">
                <div className='py-5'>
                    <span className={headingStyle}>
                        Filter by Tags
                    </span>
                </div>
                <div className='flex flex-col gap-1'>
                    <label>
                        <input type="checkbox" name="tag" value="new" />
                        New
                    </label>
                    <label>
                        <input type="checkbox" name="tag" value="sale" />
                        Sale
                    </label>
                </div>
                {/* Add more tag options as needed */}
            </div>
        </div>
    );
};

export default FilterComp;
