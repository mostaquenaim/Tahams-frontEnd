import axios from 'axios';
import React, { useEffect, useState } from 'react';

const ProductAdd = () => {
    // State for product data
    const [productData, setProductData] = useState({
        name: '',
        serialNo: '',
        note: '',
        purchaseDate: '',
        vatPercentage: 0,
        discountPercentage: 0,
        buyingPrice: '',
        sellingPrice: '',
        tags: '',
        description: '',
        isStock: true,
        colors: [
            {
                name: '',
                colorCode: '',
                sizes: [
                    {
                        name: '',
                        quantity: 0,
                    },
                ],
                files: [
                    {
                        filename: '',
                        isThumbnail: false,
                        isFeatured: false,
                    },
                ],
            },
        ],
        subCategories: [],
    });
    const [currentState, setCurrentState] = useState('');
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subSubCategories, setSubSubCategories] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [color, setColor] = useState("#aabbcc");
    // loads 
    const loadCategories = async () => {
        const result = await axios.get('http://localhost:3000/admin/view-product-categories');
        setCategories(result.data);
    };
    const loadSubCategories = async () => {
        const result = await axios.get('http://localhost:3000/admin/view-product-sub-categories');
        setSubCategories(result.data);
    };
    const loadSubSubCategories = async () => {
        const result = await axios.get('http://localhost:3000/admin/view-product-sub-sub-categories');
        setSubSubCategories(result.data);
    };
    const loadSizes = async () => {
        const result = await axios.get('http://localhost:3000/admin/view-product-sizes');
        setSizes(result.data);
    };

    // use effect 
    useEffect(() => {
        loadCategories();
        loadSizes();
        loadSubCategories();
        loadSubSubCategories();
    }, []);

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Add logic to handle the submission of productData
        console.log('Product Data:', productData);
        // Add API calls or other actions here
    };

    return (
        <div>
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                {/* Input fields */}
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={productData.name}
                    // onChange={(e) => handleInputChange(e)}
                    />
                </div>
                <div>
                    <label>Serial No:</label>
                    <input
                        type="text"
                        name="serialNo"
                        value={productData.serialNo}
                    // onChange={(e) => handleInputChange(e)}
                    />
                </div>
                <div>
                    <label>Note:</label>
                    <input
                        type="text"
                        name="note"
                        value={productData.note}
                    // onChange={(e) => handleInputChange(e)}
                    />
                </div>

                {/* Color section */}
                <div>
                    <h3>Colors</h3>
                    {productData.colors.map((color, index) => (
                        <div key={index}>
                            <label>Color Name:</label>
                            <input
                                type="text"
                                name={`colors[${index}].name`}
                                value={color.name}
                            // onChange={(e) => handleInputChange(e, index)}
                            />
                            <label>Color Code:</label>
                            <input
                                type="text"
                                name={`colors[${index}].colorCode`}
                                value={color.colorCode}
                            // onChange={(e) => handleInputChange(e, index)}
                            />
                            {/* Sizes */}
                            {color.sizes.map((size, subIndex) => (
                                <div key={subIndex}>
                                    <label>{size.name} Quantity:</label>
                                    <input
                                        type="number"
                                        name={`colors[${index}].sizes[${subIndex}].quantity`}
                                        value={size.quantity}
                                    // onChange={(e) => handleSizeChange(e, index, subIndex)}
                                    />
                                </div>
                            ))}
                            {/* Files */}
                            {color.files.map((file, subIndex) => (
                                <div key={subIndex}>
                                    <label>File Name:</label>
                                    <input
                                        type="text"
                                        name={`colors[${index}].files[${subIndex}].filename`}
                                        value={file.filename}
                                    // onChange={(e) => handleFileChange(e, index)}
                                    />
                                    <label>Is Thumbnail:</label>
                                    <input
                                        type="checkbox"
                                        name={`colors[${index}].files[${subIndex}].isThumbnail`}
                                        checked={file.isThumbnail}
                                    // onChange={(e) => handleInputChange(e, index, subIndex)}
                                    />
                                    <label>Is Featured:</label>
                                    <input
                                        type="checkbox"
                                        name={`colors[${index}].files[${subIndex}].isFeatured`}
                                        checked={file.isFeatured}
                                    // onChange={(e) => handleInputChange(e, index, subIndex)}
                                    />
                                </div>
                            ))}
                            {/* Remove color button */}
                            <button type="button"
                                // onClick={() => removeColor(index)}
                            >
                                Remove Color
                            </button>
                        </div>
                    ))}
                    {/* Add color button */}
                    <button type="button"
                        // onClick={addColor}
                    >
                        Add Color
                    </button>
                </div>

                {/* Subcategories */}
                <div>
                    <h3>Subcategories</h3>
                    {productData.subCategories.map((subCategory, index) => (
                        <div key={index}>
                            <label>{subCategory}:</label>
                            <input
                                type="checkbox"
                                name={`subCategories[${index}]`}
                                checked={true}
                            // onChange={(e) => handleInputChange(e, index)}
                            />
                        </div>
                    ))}
                </div>

                {/* Submit button */}
                <div>
                    <button type="submit">Add Product</button>
                </div>
            </form>
        </div>
    );
};

export default ProductAdd;
