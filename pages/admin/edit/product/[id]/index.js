import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Loading from '../../../../../components/Loading';
import useAxiosPublic from '../../../../../Hooks/useAxiosPublic';
import { FiTrash2 } from 'react-icons/fi'; // Importing trash icon from react-icons
import toast from 'react-hot-toast';

const EditProduct = ({ product }) => {
    console.log('product', product);
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
            colorName: product.color.name,
            colorCode: product.color.colorCode,
            // filename: product.filename
        },
    });
    const [loading, setLoading] = useState(false);
    const [existingImages, setExistingImages] = useState(product.productPictures);
    const [filename, setFilename] = useState(product.filename)
    const [deletedImages, setDeletedImages] = useState([])
    const [newImages, setNewImages] = useState([]);
    const router = useRouter();
    const axiosPublic = useAxiosPublic();

    const onSubmit = async (data) => {
        const formData = new FormData();

        // console.log('data',data);

        // Append form fields (text data)
        formData.append('name', data.name);
        formData.append('serialNo', data.serialNo);
        formData.append('description', data.description);
        formData.append('longDescription', data.longDescription);
        formData.append('vatPercentage', data.vatPercentage);
        formData.append('discountPercentage', data.discountPercentage);
        formData.append('buyingPrice', data.buyingPrice);
        formData.append('sellingPrice', parseInt(data.sellingPrice));
        formData.append('ifStock', data.ifStock);
        formData.append('colorName', data.colorName);
        formData.append('colorCode', data.colorCode);
        formData.append('filename', filename);

        // Append sizes data
        data.sizes?.forEach((sizeObj, index) => {
            formData.append(`sizes[${index}][id]`, sizeObj.sizeId);
            formData.append(`sizes[${index}][quantity]`, sizeObj.quantity);
        });

        // Append new images if uploaded
        // newImages.forEach((file, index) => {
        //     if (file) {
        //         formData.append(`newImages[${index}]`, file); // Adding new images
        //     }
        // });

        // console.log(data, 'data');
        // console.log(newImages, 'newImages');
        // console.log(existingImages, 'existingImages');
        // console.log(deletedImages, 'deletedImages');
        // console.log('thumbnail', filename);

        // Append remaining existing images
        // existingImages.forEach((img, index) => {
        //     formData.append(`existingImages[${index}]`, img.filename);
        // });

        try {
            const response = await axiosPublic.put(`/admin/update-product/${product.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Product updated')

            if (newImages.length > 0 || deletedImages.length > 0)
                editPictures()

            // router.push('/admin/products'); // Redirect to product listing page after successful update
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

                    {/* Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color Name</label>
                            <input
                                {...register('colorName')}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color Code</label>
                            <input
                                type="text"
                                {...register('colorCode')}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Product Sizes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {product.pscs.map((pscs, index) => (
                            <div key={pscs.id} className="flex items-center justify-between">
                                <span className="text-gray-700">{pscs.size.name}</span>
                                <input
                                    type="number"
                                    {...register(`sizes[${index}].quantity`)}
                                    defaultValue={pscs.quantity}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                                />
                                <input
                                    type="hidden"
                                    {...register(`sizes[${index}].sizeId`)}
                                    defaultValue={pscs.size.id}
                                />
                            </div>
                        ))}
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
