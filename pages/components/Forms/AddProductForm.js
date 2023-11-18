import React, { useState } from 'react';

const AddProductForm = () => {
    const [productData, setProductData] = useState({
        name: '',
        serialNo: '',
        colors: [{ colorCode: '', colorName: '' }],
    });

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedColors = [...productData.colors];
        updatedColors[index] = { ...updatedColors[index], [name]: value };
        setProductData({ ...productData, colors: updatedColors });
    };

    const addColorField = () => {
        setProductData({
            ...productData,
            colors: [...productData.colors, { colorCode: '', colorName: '' }],
        });
    };

    const removeColorField = (index) => {
        const updatedColors = [...productData.colors];
        updatedColors.splice(index, 1);
        setProductData({ ...productData, colors: updatedColors });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // You can now access the data in productData
        console.log(productData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                />
            </div>
            <div>
                <label>Serial No:</label>
                <input
                    type="text"
                    name="serialNo"
                    value={productData.serialNo}
                    onChange={(e) => setProductData({ ...productData, serialNo: e.target.value })}
                />
            </div>
            <div>
                <label>Colors:</label>
                {productData.colors.map((color, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            name="colorCode"
                            value={color.colorCode}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="Color Code"
                        />
                        <input
                            type="text"
                            name="colorName"
                            value={color.colorName}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="Color Name"
                        />
                        <button type="button" onClick={() => removeColorField(index)}>
                            Remove Color
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addColorField}>
                    Add Color
                </button>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default AddProductForm;
