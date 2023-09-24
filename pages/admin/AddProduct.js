import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Drawer from '../components/drawer';
import SessionCheck from '../components/sessionCheck';

const AddProduct = () => {
    const [productData, setProductData] = useState({
        name: '',
        tags: '',
        description: '',
        ifStock: '',
        price: '',
        categoryId: '', // Assuming you have a category selection
    });
    const [file, setFile] = useState(null);
    const [success, setSuccess] = useState("");
    const [categories, setCategories] = useState([])
    const [sizes, setSizes] = useState([])
    const [selectedSizes, setSelectedSizes] = useState([])

    const loadCategories = async () => {
        const result = await axios.get(`http://localhost:3000/admin/view-product-categories`);
        setCategories(result.data);
    };

    const loadSizes = async () => {
        const result = await axios.get(`http://localhost:3000/admin/view-product-sizes`);
        setSizes(result.data);
    };

    useEffect(() => {
        loadCategories();
        loadSizes();
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
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


    const handleSubmit = async (e) => {
        const joinedSizes = selectedSizes.join(' ');

        console.log("joinedSizes", joinedSizes)
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('tags', productData.tags);
        formData.append('description', productData.description);
        formData.append('ifStock', productData.ifStock);
        formData.append('price', productData.price);
        // const selectedCategory = await axios.get(`http://localhost:3000/admin/getCategoryById/${productData.categoryId}`)
        formData.append('categoryId', productData.categoryId);
        formData.append('filename', file);
        formData.append('availableSizes', joinedSizes);

        try {
            const response = await axios.post('http://localhost:3000/admin/add-new-product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Product added:', response.data);
            setSuccess("Successfully added")

            // clear values from input fields
            setProductData({
                name: '',
                tags: '',
                description: '',
                ifStock: '',
                price: '',
                categoryId: '',
            });
            setSelectedSizes([])
            setFile(null)


        } catch (error) {
            console.error('Error adding product:', error);
            setSuccess(error)
        }
    };

    return (
        <>
        <Drawer title="Add Product"/>
        <SessionCheck/>
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-zinc-50 to-blue-100">
            <div className="bg-white shadow-md hover:shadow-lg hover:shadow-black p-6 rounded-lg">
                <h2 className="font-bold text-xl text-center mb-4">Add Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* product name  */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={productData.name}
                            onChange={handleInputChange}
                            className="border p-2 rounded focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                        />
                    </div>
                    {/* product tags  */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Tags:</label>
                        <input
                            type="text"
                            name="tags"
                            placeholder="Use comma to separate tags"
                            value={productData.tags}
                            onChange={handleInputChange}
                            className="border p-2 rounded focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                        />
                    </div>
                    {/* description  */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Description:</label>
                        <input
                            type="text"
                            name="description"
                            value={productData.description}
                            onChange={handleInputChange}
                            className="border p-2 rounded focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                        />
                    </div>
                    {/* in stock  */}
                    <div className="mt-2">
                        <label className="text-sm font-semibold mb-1">In stock?</label>
                        <select
                            name="ifStock"
                            value={productData.ifStock}
                            onChange={handleInputChange}
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-400 transition duration-300 ease-in-out"
                        >
                            <option value="">Choose one</option>
                            <option value="YES">
                                YES
                            </option>
                            <option value="YES">
                                NO
                            </option>
                        </select>
                    </div>
                    {/* price  */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Price:</label>
                        <input
                            type="text"
                            name="price"
                            value={productData.price}
                            onChange={handleInputChange}
                            className="border p-2 rounded focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                        />
                    </div>
                    {/* categories  */}
                    <div className="mt-2">
                        <label className="text-sm font-semibold mb-1">Category:</label>
                        <select
                            name="categoryId"
                            value={productData.categoryId}
                            onChange={handleInputChange}
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-400 transition duration-300 ease-in-out"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* sizes  */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-semibold mb-1">Sizes:</label>
                        <div className="space-y-1">
                            {sizes.map((size) => (
                                <div key={size.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name={`size_${size.size}`}
                                        id={`size_${size.size}`}
                                        value={size.size}
                                        checked={selectedSizes.includes(size.size)}
                                        onChange={(e) => handleSizeChange(e, size.size)}
                                        className="h-4 w-4 text-blue-500 focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                                    />
                                    <label htmlFor={`size_${size.size}`} className="ml-2">{size.size}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label>Image:</label>
                        <input
                            name="filename"
                            type="file"
                            accept=".png, .jpg, .jpeg"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                        >
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default AddProduct;
