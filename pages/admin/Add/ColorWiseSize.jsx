import axios from "axios";
import { useEffect, useState } from "react";

const ColorWiseSize = ({ color, colorIndex, sizes, handleSizeChange, handleSizeQuantityChange }) => {

    const handleCheckChange = (e, colorIndex, index, name) => {
        handleSizeChange(e, colorIndex, index, name)
    }

    const handleQuantityChange = (e, colorIndex, index) =>{
        handleSizeQuantityChange(e, colorIndex, index)
    }
    return (
        <div>
            <h1 className="text-xl font-semibold">Sizes</h1>
            {sizes.length > 0 && sizes.map((size, index) => (
                <div key={size.id} className="flex gap-8">
                    <div>
                        <input type="checkbox" name={`color-${colorIndex}-size-${index}`} onChange={(e) => handleCheckChange(e, colorIndex, index, size.name)} />
                        {size.name}
                    </div>
                    <div>
                        <input type="number" name={`color-${colorIndex}-size-${index}-quantity`} placeholder="quantity" onChange={(e)=>handleQuantityChange(e, colorIndex, index)}></input>
                    </div>

                </div>
            ))}
        </div>
    );
};

export default ColorWiseSize;
