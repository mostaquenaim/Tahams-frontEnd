import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Drawer from '../components/drawer';
import SessionCheck from '../components/sessionCheck';
import InputField from '../components/InputField';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { HexColorPicker } from "react-colorful";

const AddProduct = () => {
    // const [file, setFile] = useState(null);
    const [currentState, setCurrentState] = useState('');
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [color, setColor] = useState("#aabbcc");
    const [productData, setProductData] = useState({
        name: '',
        serialNo: '',
        // quantity: 0,
        note: '',
        purchaseDate: '',
        vatPercentage: '',
        discountPercentage: '',
        buyingPrice: '',
        sellingPrice: '',
        tags: '',
        description: '',
        ifStock: '',
        categories: [],
        colors: [{ colorCode: '', colorName: '', quantity: 0 }],
        // colorCode: '',
        // colorName:'',
        subCategories: []
    });

    const addColorField = () => {
        setProductData({
            ...productData,
            colors: [...productData.colors, { colorCode: '', colorName: '', quantity: 0 }],
        });
    };

    const removeColorField = (index) => {
        const updatedColors = [...productData.colors];
        updatedColors.splice(index, 1);
        setProductData({ ...productData, colors: updatedColors });
    };

    const loadCategories = async () => {
        const result = await axios.get('http://localhost:3000/admin/view-product-categories');
        setCategories(result.data);
    };
    const loadSubCategories = async () => {
        const result = await axios.get('http://localhost:3000/admin/view-product-sub-categories');
        setSubCategories(result.data);
    };
    const loadSizes = async () => {
        const result = await axios.get('http://localhost:3000/admin/view-product-sizes');
        setSizes(result.data);
    };
    useEffect(() => {
        loadCategories();
        loadSizes();
        loadSubCategories();
    }, []);

    // const handleFileChange = (e) => {
    //     const selectedFile = e.target.files[0];
    //     setFile(selectedFile);
    // };

    const handleArrayChange = (e, arrayName, id) => {
        const isChecked = e.target.checked;

        setProductData((prevData) => {
            const newArray = [...prevData[arrayName]];

            if (isChecked) {
                newArray.push(id);
            } else {
                const index = newArray.indexOf(id);
                if (index > -1) {
                    newArray.splice(index, 1);
                }
            }

            return {
                ...prevData,
                [arrayName]: newArray,
            };
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
        console.log(productData)
    };

    const handleColorChange = (e, index) => {
        const { name, value } = e.target;
        const updatedColors = [...productData.colors];
        updatedColors[index] = { ...updatedColors[index], [name]: value };
        setProductData({ ...productData, colors: updatedColors });
    };

    const handleDateChange = (date) => {
        setProductData({ ...productData, purchaseDate: date });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newCategories = []
        for(const selectedCategory of selectedCategories){
            newCategories.push(categories.find((cat)=>cat.id === selectedCategory))
        }

        const newSubCategories = []
        for(const selectedCategory of selectedSubCategories){
            newSubCategories.push(subCategories.find((cat)=>cat.id === selectedCategory))
        }
        
        productData.categories = [...newCategories]
        productData.subCategories = [...newSubCategories]
        console.log("product-Data ", productData)

        try {
            const response = await axios.post('http://localhost:3000/admin/addProduct', productData)
            // , 
            // {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });
            console.log('Product added:', response.data);
            setCurrentState('Successfully added');

            // Clear values from input fields
            setProductData({
                name: '',
                serialNo: '',
                // quantity: 0,
                note: '',
                purchaseDate: '',
                vatPercentage: '',
                discountPercentage: '',
                buyingPrice: '',
                sellingPrice: '',
                tags: '',
                description: '',
                ifStock: '',
                categories: [],
                colors: [{ colorCode: '', colorName: '', quantity: 0 }],
                // colorCode: '',
                // colorName:'',
                subCategories: []
            });
            setSelectedCategories([]);
            setSelectedSizes([])
            setSelectedSubCategories([])
        } catch (error) {
            console.error('Error adding product:', error);
            setCurrentState(error.response?.data?.message || 'An error occurred.');
        }
    };

    const handleSizeChange = (e, size) => {
        const isChecked = e.target.checked;

        setSelectedSizes((prevSizes) => {
            if (isChecked) {
                return [...prevSizes, size];
            } else {
                return prevSizes.filter((prevSize) => prevSize !== size);
            }
        });
    };

    const handleCategoryChange = (e, categoryId) => {
        const isChecked = e.target.checked;

        setSelectedCategories((prevSelected) => {
            if (isChecked) {
                return [...prevSelected, categoryId];
            } else {
                return prevSelected.filter((id) => id !== categoryId);
            }
        });
    };

    const handleSubCategoryChange = (e, categoryId) => {
        const isChecked = e.target.checked;

        setSelectedSubCategories((prevSelected) => {
            if (isChecked) {
                return [...prevSelected, categoryId];
            } else {
                return prevSelected.filter((id) => id !== categoryId);
            }
        });
    };


    return (
        <>
            <Drawer title="Add Product" />
            <SessionCheck />
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-zinc-50 to-blue-100">
                <div className="bg-white shadow-md hover:shadow-lg p-6 rounded-lg">
                    <h2 className="font-bold text-xl text-center mb-4">Add Product</h2>
                    <div>{currentState && currentState}</div>
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                        <table>
                            <tbody className=''>
                                <InputField label="Name" type="text" name="name" value={productData.name} handleChange={handleInputChange} />
                                <InputField label="Serial no" type="text" name="serialNo" value={productData.serialNo} handleChange={handleInputChange} />
                                <InputField label="Tags" type="text" name="tags" value={productData.tags} handleChange={handleInputChange} placeholder='use space to separate tags' />
                                <InputField label="Description" type="text" name="description" value={productData.description} handleChange={handleInputChange} />
                                {/* <InputField label="Quantity" type="number" name="quantity" value={productData.quantity} handleChange={handleInputChange} /> */}
                                <InputField label="Note" type="text" name="note" value={productData.note} handleChange={handleInputChange} />
                                <InputField label="Vat Percentage" type="text" name="vatPercentage" value={productData.vatPercentage} handleChange={handleInputChange} />
                                <InputField label="Discount Percentage" type="text" name="discountPercentage" value={productData.discountPercentage} handleChange={handleInputChange} />
                                <InputField label="Buying Price" type="text" name="buyingPrice" value={productData.buyingPrice} handleChange={handleInputChange} />
                                <InputField label="Selling Price" type="text" name="sellingPrice" value={productData.sellingPrice} handleChange={handleInputChange} />
                                {/* purchase date  */}
                                <tr>
                                    <td>
                                        <label className="text-sm font-semibold mb-1">Purchase date:</label>
                                    </td>
                                    <td>
                                        <DateTimePicker onChange={handleDateChange} value={productData.purchaseDate} />
                                    </td>
                                </tr>
                                {/* in stock?  */}
                                <tr>
                                    <td>
                                        <label className="text-sm font-semibold mb-1">In stock?</label>
                                    </td>
                                    <td>
                                        <select
                                            name="ifStock"
                                            value={productData.ifStock}
                                            onChange={handleInputChange}
                                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-400 transition duration-300 ease-in-out"
                                        >
                                            <option value="">Choose one</option>
                                            <option value="YES">YES</option>
                                            <option value="NO">NO</option>
                                        </select>
                                    </td>
                                </tr>
                                {/* sub categories  */}
                                <tr>
                                    <td>
                                        <label className="text-sm font-semibold mb-1">Sub Categories:</label>
                                    </td>
                                    <td>
                                        <div className="space-y-1">
                                            {subCategories.map((category) => (
                                                <div key={category.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name={`sub_category_${category.id}`}
                                                        id={`sub_category_${category.id}`}
                                                        value={category.id}
                                                        checked={selectedSubCategories.includes(category.id)}
                                                        onChange={(e) => handleSubCategoryChange(e, category.id)}
                                                        className="h-4 w-4 text-blue-500 focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                                                    />
                                                    <label htmlFor={`sub_category_${category.id}`} className="ml-2">
                                                        {category.categoryName}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                                {/* categories  */}
                                <tr>
                                    <td>
                                        <label className="text-sm font-semibold mb-1">Categories:</label>
                                    </td>
                                    <td>
                                        <div className="space-y-1">
                                            {categories.map((category) => (
                                                <div key={category.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name={`category_${category.id}`}
                                                        id={`category_${category.id}`}
                                                        value={category.id}
                                                        checked={selectedCategories.includes(category.id)}
                                                        onChange={(e) => handleCategoryChange(e, category.id)}
                                                        className="h-4 w-4 text-blue-500 focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                                                    />
                                                    <label htmlFor={`category_${category.id}`} className="ml-2">
                                                        {category.categoryName}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                                {/* Color picker  */}
                                <tr>
                                    <td className="">
                                        <HexColorPicker color={color} onChange={setColor} />
                                        <small> Copy this code with hash and paste it in color code</small>
                                    </td>
                                    <td>
                                        <span className="font-bold">{color}</span>
                                    </td>
                                </tr>
                                {/* Colors  */}
                                <tr>
                                    <label className="text-sm font-semibold mb-1">Colors & quantity:</label>
                                </tr>
                                {productData.colors.map((color, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="text"
                                                name="colorCode"
                                                value={color.colorCode}
                                                onChange={(e) => handleColorChange(e, index)}
                                                placeholder="Color Code"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="colorName"
                                                value={color.colorName}
                                                onChange={(e) => handleColorChange(e, index)}
                                                placeholder="Color Name"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={color.quantity}
                                                onChange={(e) => handleColorChange(e, index)}
                                                placeholder=""
                                            />
                                            <button type="button" className='btn' onClick={() => removeColorField(index)}>
                                                Remove Color
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <button type="button" className='btn btn-primary' onClick={addColorField}>
                                    Add Color
                                </button>
                                {/* Color name  */}
                                {/* <InputField label="Color name" type="text" name="colorName" value={productData.colorName} handleChange={handleInputChange} /> */}
                                <tr>
                                    <td></td>
                                    <td className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                                        >
                                            Add Product
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddProduct;
