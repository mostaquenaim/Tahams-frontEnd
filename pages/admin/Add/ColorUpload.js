import React from 'react';
import FileUpload from './FileUpload';
import ColorWiseSize from './ColorWiseSize';

const ColorUpload = ({
    color,
    colorIndex,
    handleColorChange,
    removeColorField,
}) => {

    return (
        <div>

            <div className='flex justify-around' >
                <input
                    type="text"
                    name="colorCode"
                    value={color.colorCode}
                    onChange={(e) => handleColorChange(e, colorIndex)}
                    placeholder="Color Code"
                />

                <input
                    type="text"
                    name="name"
                    value={color.name}
                    onChange={(e) => handleColorChange(e, colorIndex)}
                    placeholder="Color Name"
                />

                <input
                    type="number"
                    name="quantity"
                    placeholder="quantity"
                    value={color.quantity}
                    onChange={(e) => handleColorChange(e, colorIndex)}
                />


            </div>

            <div>
                <button type="button" className='btn' onClick={() => removeColorField(colorIndex)}>
                    Remove Color
                </button>
            </div>

        </div>
    );
};

export default ColorUpload;