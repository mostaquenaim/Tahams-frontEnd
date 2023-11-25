import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Drawer from '../../components/Drawers/drawer';
import SessionCheck from '../../components/Auth/sessionCheck';
import InputField from '../../components/Forms/InputField';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { HexColorPicker } from "react-colorful";
import BurgerMenu from '../../Drafts/BurgerMenu';
import AdminDrawer from '../../Drafts/AdminDrawer';
import FileUpload from './FileUpload';
import ColorUpload from './ColorUpload';

const AddProduct = () => {
    // const [file, setFile] = useState(null);
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

    const [productData, setProductData] = useState({
        name: '',
        serialNo: '',
        note: '',
        purchaseDate: '',
        vatPercentage: 0,
        discountPercentage: 0,
        buyingPrice: 0,
        sellingPrice: 0,
        tags: '',
        description: '',
        ifStock: true,
        colors: [{
            colorCode: '',
            name: '',
            quantity: '',
            sizes: [{
                name: '',
                quantity: 0
            }],
            files: [{
                filename: '',
                isThumbnail: false,
                isFeatured: false
            }]
        }],
        subCategories: [],
        // colorCode: '',
        // name:'',
        // subCategories: []
    });

    useEffect(() => {

    }, [])

    const addColorField = () => {
        setProductData({
            ...productData,
            colors: [
                ...productData.colors,
                { colorCode: '', name: '', quantity: 0, files: [] },
            ],
        });
    };
    const removeColorField = (index) => {
        const updatedColors = [...productData.colors];
        updatedColors.splice(index, 1);
        setProductData({ ...productData, colors: updatedColors });
    };

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
        try {
            const result = await axios.get('http://localhost:3000/admin/view-product-sub-sub-categories');
            console.log(result.data, "699999");

            // Sort the subSubCategories array based on categoryName
            const sortedSubSubCategories = result.data.sort((a, b) => {
                // Convert category names to lowercase for case-insensitive sorting
                const categoryA = a.categoryName.toLowerCase();
                const categoryB = b.categoryName.toLowerCase();

                // Compare category names
                if (categoryA < categoryB) {
                    return -1;
                }
                if (categoryA > categoryB) {
                    return 1;
                }
                return 0;
            });

            setSubSubCategories(sortedSubSubCategories);
        } catch (error) {
            console.error('Error loading sub-sub-categories:', error);
        }
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

    // handle size change 
    const handleSizeChange = (e, colorIndex, sizeIndex, name) => {
        const isChecked = e.target.checked

        // const updatedColor = [...productData.colors]
        const updatedSizes = [...productData.colors[colorIndex].sizes]
        console.log(updatedSizes, "147 size");

        if (isChecked) {
            updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], 'name': name }
            const updatedColors = [...productData.colors];
            setProductData({ ...productData, colors: updatedColors });
        }
        else {
            updatedSizes[sizeIndex] = updatedSizes.filter((item) => item.name !== name)
            const updatedColors = [...productData.colors];
            setProductData({ ...productData, colors: updatedColors });
        }
    }

    const handleSizeQuantityChange = (e, colorIndex, sizeIndex) => {
        const { name, value } = e.target;
        const updatedSizes = [...productData.colors[colorIndex].sizes]
        updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], [name]: value };
        const updatedColors = [...productData.colors];
        setProductData({ ...productData, colors: updatedColors });
    }

    // handle category 
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

    // date change 
    const handleDateChange = (date) => {
        setProductData({ ...productData, purchaseDate: date });
    };

    // handle file 
    const handleFileChange = (e, colorIndex) => {
        const selectedFiles = e.target.files;

        const updatedColors = [...productData.colors];
        const files = [];

        // Assuming you want to handle multiple files for each color
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            // You may want to generate a unique filename or handle it differently
            const filename = file.name;

            const newFile = {
                filename: filename,
                isThumbnail: false, // Adjust as needed
                isFeatured: false, // Adjust as needed
            };

            files.push(newFile);
        }

        updatedColors[colorIndex].files = files;

        setProductData((prevData) => ({
            ...prevData,
            colors: updatedColors,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newCategories = []
        for (const selectedCategory of selectedCategories) {
            newCategories.push(subSubCategories.find((cat) => cat.id === selectedCategory))
        }

        productData.subCategories = [...newCategories]
        console.log(selectedCategories,"product-Data ", productData)

        try {
            const response = await axios.post('http://localhost:3000/admin/add-product', productData)
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
                colors: [{ colorCode: '', name: '', quantity: 0 }],
                // colorCode: '',
                // name:'',
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


    return (
        <>
            <AdminDrawer></AdminDrawer>
            <SessionCheck />
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-zinc-50 to-blue-100">
                <div className="bg-white shadow-md hover:shadow-lg p-6 rounded-lg">
                    <h2
                        className="font-bold text-xl text-center mb-4">
                        Add Product
                    </h2>
                    <div>{currentState && currentState}</div>
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                        <div className='grid grid-cols-2 gap-2'>
                            <InputField label="Name" type="text" name="name" value={productData.name} handleChange={handleInputChange} />
                            <InputField label="Serial no" type="text" name="serialNo" value={productData.serialNo} handleChange={handleInputChange} />
                            <InputField label="Tags" type="text" name="tags" value={productData.tags} handleChange={handleInputChange} placeholder='use space to separate tags' />
                            <InputField label="Note" type="text" name="note" value={productData.note} handleChange={handleInputChange} />
                            <InputField label="Vat Percentage" type="number" name="vatPercentage" value={productData.vatPercentage} handleChange={handleInputChange} />
                            <InputField label="Discount Percentage" type="number" name="discountPercentage" value={productData.discountPercentage} handleChange={handleInputChange} />
                            <InputField label="Buying Price" type="number" name="buyingPrice" value={productData.buyingPrice} handleChange={handleInputChange} />
                            <InputField label="Selling Price" type="number" name="sellingPrice" value={productData.sellingPrice} handleChange={handleInputChange} />
                            {/* purchase date  */}
                            <div className='flex justify-around'>
                                <label className="text-sm font-semibold mb-1">Purchase date:</label>
                                <DateTimePicker onChange={handleDateChange} value={productData.purchaseDate} />
                            </div>
                            {/* in stock?  */}
                            <div className='flex justify-around'>
                                <label className="text-sm font-semibold mb-1">In stock?</label>
                                <select
                                    name="ifStock"
                                    value={productData.ifStock}
                                    onChange={handleInputChange}
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-400 transition duration-300 ease-in-out"
                                >
                                    <option value="">Choose one</option>
                                    <option value='true'>YES</option>
                                    <option value='false'>NO</option>
                                </select>
                            </div>
                        </div>
                        {/* <InputField label="Description" type="text" name="description" value={productData.description} handleChange={handleInputChange} /> */}
                        <div className='flex justify-around'>
                            <label className="text-sm font-semibold mb-1">Description</label>
                            < textarea
                                name='description'
                                value={productData.description}
                                placeholder='description'
                                onChange={handleInputChange}
                                className="border p-2 rounded focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                            />
                        </div>
                        {/* categories  */}
                        <div className='flex justify-around'>
                            <label className="text-sm font-semibold mb-1">Categories:</label>
                            <div className="space-y-1">
                                {subSubCategories.map((category) => (
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
                                            <span className='font-semibold text-xl'> {category.categoryName} </span>
                                            ({category.category.categoryName}, <span className=''>{category.category.category.categoryName}</span>)
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>




                        {/* Color picker  */}
                        <div className='flex justify-around sticky top-0 bg-base-100'>
                            <HexColorPicker color={color} onChange={setColor} />
                            <small> Copy this code with hash and paste it in color code</small>
                            <span className="font-bold">{color}</span>
                        </div>
                        {/* Colors  */}
                        <div>
                            <label className="text-sm font-semibold mb-1">Colors & quantity:</label>
                        </div>
                        {productData.colors.map((color, colorIndex) => (
                            <ColorUpload
                                key={colorIndex}
                                color={color}
                                colorIndex={colorIndex}
                                handleSizeChange={handleSizeChange}
                                handleSizeQuantityChange={handleSizeQuantityChange}
                                handleColorChange={handleColorChange}
                                removeColorField={removeColorField}
                                handleFileChange={handleFileChange}
                                sizes={sizes}
                            />
                        ))}
                        <button type="button" className='btn btn-primary' onClick={addColorField}>
                            Add Color
                        </button>




                        <div className='flex justify-around'>
                            <div></div>
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                                >
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddProduct;
