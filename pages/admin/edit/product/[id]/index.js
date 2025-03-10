import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Loading from '../../../../../components/Loading';
import useAxiosPublic from '../../../../../Hooks/useAxiosPublic';
import { FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useLoadColors from '../../../../../Hooks/useLoadColors';
import useLoadSubSubCategories from '../../../../../Hooks/useLoadSubSubCategories';
import useLoadSizes from '../../../../../Hooks/useLoadSizes';

const EditProduct = ({ product }) => {
    // console.log('product', product);
    const colors = useLoadColors(); // Fetch colors from the hook
    // console.log(colors);
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            name: product.name,
            serialNo: product.serialNo,
            description: product.description,
            longDescription: product.longDescription,
            vatPercentage: product.vatPercentage,
            discountPercentage: product.discountPercentage,
            buyingPrice: product.buyingPrice,
            sellingPrice: product.sellingPrice,
            ifStock: product.ifStock,
            colorName: product.color?.name || '',
        },
    });

    const [subSubCategories] = useLoadSubSubCategories()
    const sizes = useLoadSizes()
    // console.log(subSubCategories, 'subSubCategories');

    const [loading, setLoading] = useState(false);
    const [existingImages, setExistingImages] = useState(product.productPictures);
    const [filename, setFilename] = useState(product.filename);
    const [deletedImages, setDeletedImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [selectedCats, setSelectedCats] = useState([])
    const [selectedCatsInfo, setSelectedCatsInfo] = useState([])
    const [isSizeApplicable, setIsSizeApplicable] = useState([]);

    const router = useRouter();
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        // selected categories 
        const tempCats = new Set(); // Use a Set to store unique category IDs
        const tempCatsInfo = new Map(); // Use a Map to store category info with sizes
        const tempSizeApp = new Set();

        product.pscs.forEach((cat) => {
            console.log(cat);
            tempCats.add(cat.category.id); // Add category ID to the Set

            // Initialize category info if not already present
            if (!tempCatsInfo.has(cat.category.id)) {
                tempCatsInfo.set(cat.category.id, {
                    category: cat.category.id,
                    sizes: []
                });
            }

            // Check if size is applicable and add size info
            if (cat.size?.id) {
                tempSizeApp.add(cat.category.id);
                tempCatsInfo.get(cat.category.id).sizes.push({
                    id: cat.size.id,
                    quantity: cat.quantity
                });
            }

        });

        console.log(tempCatsInfo);
        setSelectedCats([...tempCats]);
        setSelectedCatsInfo([...tempCatsInfo.values()]); // Convert Map values to an array
        setIsSizeApplicable([...tempSizeApp]);

    }, [product.pscs]); // Add product.pscs as a dependency to re-run the effect when it changes

    // category change 
    const handleCategoryChange = (event, catID) => {
        const isChecked = event.target.checked

        if (isChecked) {
            setSelectedCats([...selectedCats,
                catID,
            ])

            setSelectedCatsInfo([...selectedCatsInfo,
            {
                category: catID,
                sizes: []
            }
            ])

            return
        }

        const res = selectedCats.filter(cat => cat !== catID)
        setSelectedCats([...res])

        const infoRes = selectedCatsInfo.filter(cat => cat.category !== catID)
        setSelectedCatsInfo([...infoRes])
    }

    // check if size available 
    const handleSizeApplicableChange = (event, catID) => {
        const isChecked = event.target.checked

        if (isChecked) {
            setIsSizeApplicable([...isSizeApplicable, catID])
            return
        }

        const res = isSizeApplicable.filter(category => category !== catID)
        setIsSizeApplicable([...res])
    }

    // size and quantity handle 
    const handleSizeAndQuantityChange = (event, catID, sizeId) => {
        // console.log("selectedCatsInfo", selectedCatsInfo, 'event',event.target.value, 'catID',catID, 'sizeId',sizeId);

        const categoryWiseItem = selectedCatsInfo.find(cat => cat.category == catID) //find the item

        // if size id not availble only keep quantity
        if (!sizeId) {
            categoryWiseItem.sizes = [
                {
                    quantity: event.target.value
                }
            ]
        }
        else {
            // initially size not available 
            let sizeNotAvailable = true

            categoryWiseItem.sizes.forEach(item => {
                if (item.id == sizeId) {
                    sizeNotAvailable = false
                    item.quantity = event.target.value
                    return
                }
            })

            if (sizeNotAvailable) {
                const newSize = {
                    id: sizeId,
                    quantity: event.target.value
                }

                categoryWiseItem.sizes = [...categoryWiseItem.sizes, newSize]
            }
        }

        const result = selectedCatsInfo.filter(item => item.category != catID)
        setSelectedCatsInfo([...result, categoryWiseItem])
    }

    // onsubmit 
    const colorName = watch('colorName');
    const selectedColor = colors.find((color) => color.name === colorName);
    setValue('colorCode', selectedColor?.colorCode || '');

    const onSubmit = async (data) => {
        const formData = new FormData();

        let catsInfo = []
        selectedCatsInfo.forEach((info) => {
            catsInfo.push(info.category)
            info.sizes.forEach((item) => {
                catsInfo.push([item.id, parseInt(item.quantity)])
            })
        })

        // Append form fields (text data)
        formData.append('catsInfo', JSON.stringify(catsInfo))
        formData.append('name', data.name);
        formData.append('serialNo', data.serialNo);
        formData.append('description', data.description);
        formData.append('longDescription', data.longDescription);
        formData.append('vatPercentage', data.vatPercentage);
        formData.append('discountPercentage', data.discountPercentage);
        formData.append('buyingPrice', data.buyingPrice);
        formData.append('sellingPrice', parseInt(data.sellingPrice));
        formData.append('ifStock', data.ifStock);
        data.colorName && formData.append('colorName', data.colorName);
        selectedColor && formData.append('colorCode', selectedColor.colorCode); // Use selected color code
        formData.append('filename', filename);

        // Append sizes data
        data.sizes?.forEach((sizeObj, index) => {
            formData.append(`sizes[${index}][id]`, sizeObj.sizeId);
            formData.append(`sizes[${index}][quantity]`, sizeObj.quantity);
        });

        try {
            const response = await axiosPublic.put(`/admin/update-product/${product.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Product updated');
            if (newImages.length > 0 || deletedImages.length > 0) editPictures();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const editPictures = async () => {
        console.log(newImages);

        const formData = new FormData();

        if (newImages.length > 0) {
            console.log('dukse');
            Array.from(newImages).forEach((file) => {
                formData.append('myfiles', file);
            });
        }
        else {
            console.log('dukse ekhane');
            // console.log(existingImages);
            Array.from(existingImages).forEach((file) => {
                formData.append('myfiles', file);
            });
        }

        formData.append('id', product.id)

        try {
            const response = await axiosPublic.post("/admin/update-product-pictures",
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success('Product pictures updated successfully');
            // reset();

        } catch (error) {
            console.error(error.message);
            toast.error('Product pictures update unsuccessful: ' + error.message);
        }
    }

    const removeImage = (index) => {
        if (confirm('Are you sure you want to remove this image?')) {
            setExistingImages(existingImages.filter((_, i) => i !== index));
            setDeletedImages([...deletedImages, existingImages.find((_, i) => i == index)])
        }
    };

    const handleAddNewImage = (e) => {
        const files = Array.from(e.target.files);
        setNewImages([...newImages, ...files]);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-5xl p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Edit Product - {product.name}</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input
                                {...register('name', { required: true })}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* Serial No */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Serial No</label>
                            <input
                                {...register('serialNo')}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...register('description')}
                            rows="4"
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    {/* Long Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Long Description</label>
                        <textarea
                            {...register('longDescription')}
                            rows="4"
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Buying Price</label>
                            <input
                                type="number"
                                {...register('buyingPrice', { required: true })}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                            <input
                                type="number"
                                {...register('sellingPrice', { required: true })}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* VAT & Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">VAT Percentage</label>
                            <input
                                type="number"
                                {...register('vatPercentage')}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                            <input
                                type="number"
                                {...register('discountPercentage')}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center">
                        <label className="block text-sm font-medium text-gray-700">In Stock</label>
                        <input
                            type="checkbox"
                            {...register('ifStock')}
                            className="ml-2 h-5 w-5 text-blue-600 border-gray-300 rounded"
                        />
                    </div>

                    {/* Categories and Sizes */}
                    <div className='flex justify-around'>
                        <label className="text-sm font-semibold mb-1">Categories:</label>
                        <div className="space-y-1">
                            {subSubCategories.map((category, index) => (
                                <div key={category.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name={`selectedCategories[${category.id}]`}
                                        id={`selectedCategories_${category.id}`}
                                        onChange={(e) => handleCategoryChange(e, category.id)}
                                        checked={selectedCats.includes(category.id)}
                                        className="h-4 w-4 text-blue-500 focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                                    />
                                    <label htmlFor={`selectedCategories_${index}`} className="ml-2">
                                        <span className='font-semibold text-xl'> {category.name} </span>
                                        ({category.category.name}, <span className=''>{category.category.category.name}
                                            {
                                                category.category.category.isGenderVaried &&
                                                    category.category.category.isForMen ?
                                                    ', Men' :
                                                    ', Women'
                                            }
                                        </span>)
                                    </label>
                                    {selectedCats.includes(category.id) && (
                                        <div className="ml-4 mt-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                                Size Selection
                                            </label>

                                            <div className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    id={`categories[${index}].sizeApplicable`}
                                                    checked={isSizeApplicable.includes(category.id)}
                                                    onChange={(e) => handleSizeApplicableChange(e, category.id)}
                                                    className="mr-2"
                                                />
                                                <label htmlFor={`categories[${index}].sizeApplicable`} className="text-sm font-medium text-gray-900">
                                                    Size applicable
                                                </label>
                                            </div>
                                            {isSizeApplicable.includes(category.id) ? (
                                                sizes.map((size) => {
                                                    const categoryInfo = selectedCatsInfo.find(cat => cat.category === category.id);
                                                    const sizeInfo = categoryInfo?.sizes.find(s => s.id === size.id);
                                                    return (
                                                        <div key={size.id} className="flex items-center mb-2">
                                                            <label className="text-sm font-medium text-gray-900 mr-2">{size.name}</label>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                                                                placeholder={`Quantity for ${size.name}`}
                                                                defaultValue={sizeInfo ? sizeInfo.quantity : 0} // Set default value here
                                                                onInput={(e) => handleSizeAndQuantityChange(e, category.id, size.id)}
                                                            />
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-900 mr-2">Quantity</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                                                        placeholder={`Quantity for ${category.name}`}
                                                        onInput={(e) => handleSizeAndQuantityChange(e, category.id)}
                                                        {...register(`categories[${index}].quantity`, { required: false })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Sizes */}
                    {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {product.pscs.map((pscs, index) => (
                            <div key={pscs.id} className="flex items-center justify-between">
                                <span className="text-gray-700">{pscs.size?.name}</span>
                                <input
                                    type="number"
                                    {...register(`sizes[${index}].quantity`)}
                                    defaultValue={pscs.quantity}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                                />
                                <input
                                    type="hidden"
                                    {...register(`sizes[${index}].sizeId`)}
                                    defaultValue={pscs.size?.id}
                                />
                            </div>
                        ))}
                    </div> */}

                    {/* Color Dropdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color Name</label>
                            <select
                                {...register('colorName')}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            >
                                <option value={product.color?.name}>{product.color?.name}</option>
                                {colors.map((color) => (
                                    <option key={color.id} value={color.name}>
                                        {color.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color Code</label>
                            <input
                                type="text"
                                {...register('colorCode')}
                                value={selectedColor?.colorCode || ''}
                                disabled
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* thumbnail image  */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                        <div className="relative flex flex-col items-center">
                            <img
                                src={`${process.env.NEXT_PUBLIC_API}/admin/getImage/${filename}`}
                                alt="Product"
                                className="h-24 w-24 object-cover"
                            />
                            {/* Edit Thumbnail Button */}
                            <input
                                type="file"
                                onChange={(e) => {
                                    setFilename(e.target.files[0]);
                                }}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* product Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                        <h1 className='text-warning'>IF YOU ADD NEW PHOTOS, PREVIOUS ONES WILL BE REMOVED</h1>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {existingImages.map((pic, index) => (
                                <div key={pic.id} className="relative flex flex-col items-center">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API}/admin/getImage/${pic.filename}`}
                                        alt="Product"
                                        className="h-24 w-24 object-cover"
                                    />
                                    {/* Trash Icon for removing image */}
                                    <button
                                        type="button"
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                                        onClick={() => removeImage(index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* New Images Section */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Add New Images</label>
                            <input
                                type="file"
                                multiple
                                onChange={handleAddNewImage}
                                className="mt-2"
                            />
                        </div>

                        {/* Preview new images */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {newImages.map((file, index) => (
                                <div key={index} className="relative flex flex-col items-center">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="New Upload"
                                        className="h-24 w-24 object-cover"
                                    />
                                    <span className="text-xs mt-1">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const getServerSideProps = async (context) => {
    const { id } = context.params;

    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/admin/get-product-by-id/${id}`);
        const product = response.data;
        // console.log('product',product);

        return {
            props: { product },
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        return {
            notFound: true,
        };
    }
};

export default EditProduct;
