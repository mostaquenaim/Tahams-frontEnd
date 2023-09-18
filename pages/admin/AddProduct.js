import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        console.log("ok")
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

        try {
            const response = await axios.post('http://localhost:3000/admin/add-new-product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Product added:', response.data);
            setSuccess("Successfully added")

        } catch (error) {
            console.error('Error adding product:', error);
            setSuccess(error)
        }
    };

    return (
        <div>
            <h2>Add Product</h2>
            <p>{success}</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Tags:</label>
                    <input
                        type="text"
                        name="tags"
                        placeholder="Use comma to separate tags"
                        value={productData.tags}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <input
                        type="text"
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>In stock? </label>
                    <select
                        name="ifStock"
                        value={productData.ifStock}
                        onChange={handleInputChange}
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
                <div>
                    <label>Price:</label>
                    <input
                        type="text"
                        name="price"
                        value={productData.price}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Category:</label>
                    <select
                        name="categoryId"
                        value={productData.categoryId}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>
                {/* <div >
                    <label>Sizes:</label>
                    <div>
                        {sizes.map((size) => (
                            <div key={size.id}>
                                <input
                                    type="checkbox"
                                    name={`size_${size.size}`}
                                    id={`size_${size.size}`}
                                    value={size.size}
                                    checked={selectedSizes.includes(size.size)}
                                    onChange={(e) => handleSizeChange(e, size.size)}
                                />
                                {console.log(selectedSizes)}
                                <label>{size.size}</label>
                            </div>
                        ))}

                    </div>
                </div> */}

                <div>
                    <label>Image:</label>
                    <input
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <button type="submit">Add Product</button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
