import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Loading from '../../../../../components/Loading';
import useAxiosPublic from '../../../../../Hooks/useAxiosPublic';
import { FiTrash2, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useLoadColors from '../../../../../Hooks/useLoadColors';
import useLoadSubSubCategories from '../../../../../Hooks/useLoadSubSubCategories';
import useLoadSizes from '../../../../../Hooks/useLoadSizes';
import Head from 'next/head';
import imageCompression from 'browser-image-compression';

export const compressImage = async (item) => {
  const options = {
    maxSizeMB: 0.6,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.9,
  };

  try {
    const compressedFile = await imageCompression(item, options);
    const newFileName = item.name || `image_${Date.now()}.jpg`;

    const renamedFile = new File([compressedFile], newFileName, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });

    return renamedFile;
  } catch (error) {
    console.error('Compression failed for:', item.name, error);
    return item;
  }
};

const EditProduct = ({ product }) => {
  const colors = useLoadColors();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
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

  const [subSubCategories] = useLoadSubSubCategories();
  const sizes = useLoadSizes();

  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState(product.productPictures);
  const [filename, setFilename] = useState(product.filename);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedCatsInfo, setSelectedCatsInfo] = useState([]);
  const [isSizeApplicable, setIsSizeApplicable] = useState([]);

  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    const tempCats = new Set();
    const tempCatsInfo = new Map();
    const tempSizeApp = new Set();

    product?.pscs?.forEach((cat) => {
      tempCats.add(cat.category.id);

      if (!tempCatsInfo.has(cat.category.id)) {
        tempCatsInfo.set(cat.category.id, {
          category: cat.category.id,
          sizes: [],
        });
      }

      if (cat.size?.id) {
        tempSizeApp.add(cat.category.id);
        tempCatsInfo.get(cat.category.id).sizes.push({
          id: cat.size.id,
          quantity: cat.quantity,
        });
      }
    });

    setSelectedCats([...tempCats]);
    setSelectedCatsInfo([...tempCatsInfo.values()]);
    setIsSizeApplicable([...tempSizeApp]);
  }, [product.pscs]);

  const [token, setToken] = useState('');

  useEffect(() => {
    const at = localStorage.getItem('access_token');
    setToken(at);
  }, []);

  const handleCategoryChange = (event, catID) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedCats([...selectedCats, catID]);
      setSelectedCatsInfo([
        ...selectedCatsInfo,
        {
          category: catID,
          sizes: [],
        },
      ]);
      return;
    }

    const res = selectedCats.filter((cat) => cat !== catID);
    setSelectedCats([...res]);

    const infoRes = selectedCatsInfo.filter((cat) => cat.category !== catID);
    setSelectedCatsInfo([...infoRes]);
  };

  const handleSizeApplicableChange = (event, catID) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setIsSizeApplicable([...isSizeApplicable, catID]);
      return;
    }

    const res = isSizeApplicable.filter((category) => category !== catID);
    setIsSizeApplicable([...res]);
  };

  const handleSizeAndQuantityChange = (event, catID, sizeId) => {
    const categoryWiseItem = selectedCatsInfo.find(
      (cat) => cat.category == catID,
    );

    if (!sizeId) {
      categoryWiseItem.sizes = [
        {
          quantity: event.target.value,
        },
      ];
    } else {
      let sizeNotAvailable = true;

      categoryWiseItem.sizes.forEach((item) => {
        if (item.id == sizeId) {
          sizeNotAvailable = false;
          item.quantity = event.target.value;
          return;
        }
      });

      if (sizeNotAvailable) {
        const newSize = {
          id: sizeId,
          quantity: event.target.value,
        };

        categoryWiseItem.sizes = [...categoryWiseItem.sizes, newSize];
      }
    }

    const result = selectedCatsInfo.filter((item) => item.category != catID);
    setSelectedCatsInfo([...result, categoryWiseItem]);
  };

  const colorName = watch('colorName');
  const selectedColor = colors.find((color) => color.name === colorName);
  setValue('colorCode', selectedColor?.colorCode || '');

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();

    let catsInfo = [];
    selectedCatsInfo.forEach((info) => {
      catsInfo.push(info.category);
      info.sizes.forEach((item) => {
        catsInfo.push([item.id, parseInt(item.quantity)]);
      });
    });

    formData.append('catsInfo', JSON.stringify(catsInfo));
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
    selectedColor && formData.append('colorCode', selectedColor.colorCode);
    formData.append('filename', filename);

    data.sizes?.forEach((sizeObj, index) => {
      formData.append(`sizes[${index}][id]`, sizeObj.sizeId);
      formData.append(`sizes[${index}][quantity]`, sizeObj.quantity);
    });

    try {
      const response = await axiosPublic.put(
        `/admin/update-product/${product.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success('Product updated successfully');
      if (newImages.length > 0 || deletedImages.length > 0) editPictures();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const editPictures = async () => {
    const formData = new FormData();

    const filesToUpload = newImages.length > 0 ? newImages : existingImages;

    for (const item of filesToUpload) {
      if (item && item.type && item.type.startsWith('image/')) {
        formData.append('myfiles', item);
      } else {
        console.warn('Skipping unsupported file:', item);
      }
    }

    formData.append('id', product.id);

    try {
      const response = await axiosPublic.post(
        '/admin/update-product-pictures',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      toast.success('Product pictures updated successfully');
    } catch (error) {
      console.error(error.message);
      toast.error('Product pictures update unsuccessful: ' + error.message);
    }
  };

  const removeImage = (index) => {
    if (confirm('Are you sure you want to remove this image?')) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
      setDeletedImages([
        ...deletedImages,
        existingImages.find((_, i) => i == index),
      ]);
    }
  };

  const handleAddNewImage = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
  };

  const validateFile = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = [
        'image/jpg',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        return 'Please upload a valid image file (PNG, JPG, GIF, WebP)';
      }
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Head>
        <title>Edit Product - {product.name} | Admin</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-gray-600 mt-2">
            Update product information and inventory details
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Product ID: <span className="font-medium">{product.id}</span> |
            Current Name: <span className="font-medium">{product.name}</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    {...register('name', {
                      required: 'Product name is required',
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    {...register('serialNo')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter serial number"
                  />
                </div>
              </div>
            </div>

            {/* Product Descriptions */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Product Descriptions
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Brief description shown on product cards..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <textarea
                    {...register('longDescription')}
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Detailed description shown on product page..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Pricing Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buying Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('buyingPrice', {
                      required: 'Buying price is required',
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                  {errors.buyingPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.buyingPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('sellingPrice', {
                      required: 'Selling price is required',
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sellingPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT Percentage
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('vatPercentage')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('discountPercentage')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Product Attributes */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Product Attributes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    {...register('colorName')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value={product.color?.name}>
                      {product.color?.name || 'Select color'}
                    </option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.name}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      {...register('colorCode')}
                      value={selectedColor?.colorCode || ''}
                      disabled
                      className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      placeholder="Auto-filled"
                    />
                    {selectedColor?.colorCode && (
                      <div
                        className="w-10 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: selectedColor.colorCode }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      {...register('ifStock')}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">
                      Product is in stock
                    </label>
                    <p className="text-xs text-gray-500">
                      Check if product is available for purchase
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Product Images
              </h2>

              {/* Thumbnail Image */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Thumbnail Image
                </h3>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`}
                      alt="Product Thumbnail"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Thumbnail
                    </label>
                    <div className="flex items-center justify-center w-full max-w-xs">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                          <FiUpload className="w-6 h-6 mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500 text-center">
                            <span className="font-semibold">
                              Click to upload
                            </span>{' '}
                            or drag
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setFilename(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Gallery */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Product Gallery
                </h3>

                {/* Warning Message */}
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-amber-400 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-amber-800">
                        Important Notice
                      </h4>
                      <p className="mt-1 text-sm text-amber-700">
                        Adding new photos will replace all existing gallery
                        images. Current images will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Existing Images */}
                {existingImages && existingImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      Current Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {existingImages.map((pic, index) => (
                        <div key={pic.id} className="relative group">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${pic.filename}`}
                            alt={`Product image ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-gray-300 shadow-sm"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            onClick={() => removeImage(index)}
                            title="Remove image"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Images */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    Add New Images
                  </h4>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiImage className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, WebP (MAX. 5MB each)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAddNewImage}
                      />
                    </label>
                  </div>
                </div>

                {/* Preview New Images */}
                {newImages.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      New Images to Upload
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New upload ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-gray-300 shadow-sm"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categories & Inventory */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Categories & Inventory
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Select Categories
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subSubCategories.map((category, index) => (
                      <div
                        key={category.id}
                        className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            id={`selectedCategories_${category.id}`}
                            onChange={(e) =>
                              handleCategoryChange(e, category.id)
                            }
                            checked={selectedCats.includes(category.id)}
                            className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`selectedCategories_${category.id}`}
                            className="ml-4 block"
                          >
                            <span className="font-semibold text-lg text-gray-800">
                              {category.name}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {category.category.name} →{' '}
                              {category.category.category.name}
                              {category.category.category.isGenderVaried &&
                                (category.category.category.isForMen
                                  ? ' (Men)'
                                  : ' (Women)')}
                            </p>
                          </label>
                        </div>

                        {selectedCats.includes(category.id) && (
                          <div className="mt-6 border-l-2 border-blue-200">
                            <div className="flex items-center mb-4">
                              <input
                                type="checkbox"
                                id={`size-applicable-${category.id}`}
                                checked={isSizeApplicable.includes(category.id)}
                                onChange={(e) =>
                                  handleSizeApplicableChange(e, category.id)
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`size-applicable-${category.id}`}
                                className="ml-3 text-sm font-medium text-gray-700"
                              >
                                This product has size variations
                              </label>
                            </div>

                            {isSizeApplicable.includes(category.id) ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-">
                                {sizes.map((size) => {
                                  const categoryInfo = selectedCatsInfo.find(
                                    (cat) => cat.category === category.id,
                                  );
                                  const sizeInfo = categoryInfo?.sizes.find(
                                    (s) => s.id === size.id,
                                  );
                                  return (
                                    <div
                                      key={size.id}
                                      className="bg-white p-3 rounded border border-gray-200"
                                    >
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {size.name}
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Qty"
                                        defaultValue={
                                          sizeInfo ? sizeInfo.quantity : 0
                                        }
                                        onInput={(e) =>
                                          handleSizeAndQuantityChange(
                                            e,
                                            category.id,
                                            size.id,
                                          )
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="bg-white p-4 rounded border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Total Quantity
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder={`Quantity for ${category.name}`}
                                  onInput={(e) =>
                                    handleSizeAndQuantityChange(e, category.id)
                                  }
                                  {...register(
                                    `categories[${index}].quantity`,
                                    {
                                      required: false,
                                    },
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm('Are you sure you want to reset all changes?')
                    ) {
                      window.location.reload();
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Reset Changes
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          title="Scroll to top"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>

        <button
          onClick={() =>
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'instant',
            })
          }
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          title="Scroll to bottom"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const { id } = context.params;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/admin/get-product-by-id/${id}`,
    );
    const product = response.data;

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
