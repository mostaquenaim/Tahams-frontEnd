import React, { useState, useEffect } from 'react';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useLoadSubSubCategories from '../../../Hooks/useLoadSubSubCategories';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Image from 'next/image';
import { compressImage } from '../edit/product/[id]';
import Loading from '/components/Loading';

const AddNewArrivals = () => {
  const [subSubCategories] = useLoadSubSubCategories();
  const axiosPublic = useAxiosPublic();

  // Initialize form data with existing arrivals and empty slots
  const [formData, setFormData] = useState([]);
  const [isEditing, setIsEditing] = useState([]);
  const [previousArrivals, setPreviousArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState('');
  const [isUploading, setIsUploading] = useState({});

  // access token
  useEffect(() => {
    const at = localStorage.getItem('access_token');
    setToken(at);
  }, []);

  // fetch new arrivals
  useEffect(() => {
    const fetchArrivals = async () => {
      try {
        const res = await axiosPublic.get('/admin/view-new-arrivals');

        const sortedArrivals = res.data
          .filter((item) => item.isActive)
          .sort((a, b) => a.serial - b.serial);

        setPreviousArrivals(sortedArrivals);
      } catch (error) {
        console.error('Error fetching previous arrivals:', error);
        toast.error('Failed to load arrivals');
      } finally {
        setLoading(false);
      }
    };

    fetchArrivals();
  }, []);

  // set formdata
  useEffect(() => {
    if (!previousArrivals.length) return;

    const existingArrivals = previousArrivals.map((item) => ({
      ...item,
      subSubCategory: item.subsub?.id || '',
      filename: item.filename || null,
      preview: item.filename
        ? `${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.filename}`
        : null,
    }));

    const emptySlots = Array(Math.max(0, 4 - existingArrivals.length)).fill({
      name: '',
      description: '',
      category: '',
      subSubCategory: '',
      filename: null,
      preview: null,
    });

    const finalData = [...existingArrivals, ...emptySlots];

    setFormData(finalData);
    setIsEditing(Array(finalData.length).fill(false));
  }, [previousArrivals]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      formData.forEach((item) => {
        if (item.preview && item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const handleAddNewArrival = () => {
    setFormData((prev) => [
      ...prev,
      {
        name: '',
        description: '',
        category: '',
        subSubCategory: '',
        filename: null,
        preview: null,
      },
    ]);

    setIsEditing((prev) => [...prev, false]);
  };

  const handleChange = (index, e) => {
    const { name, value, files } = e.target;

    setFormData((prevState) => {
      const updatedFormData = [...prevState];
      const currentItem = updatedFormData[index];

      // Clean up previous blob URL if exists
      if (
        name === 'filename' &&
        currentItem.preview &&
        currentItem.preview.startsWith('blob:')
      ) {
        URL.revokeObjectURL(currentItem.preview);
      }

      updatedFormData[index] = {
        ...currentItem,
        [name]: name === 'filename' ? files[0] : value,
        preview:
          name === 'filename'
            ? files[0]
              ? URL.createObjectURL(files[0])
              : null
            : currentItem.preview,
      };

      return updatedFormData;
    });
  };

  const handleUpload = async (index) => {
    const item = formData[index];

    // Validation
    if (!item.name.trim() || !item.description.trim() || !item.subSubCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading((prev) => ({ ...prev, [index]: true }));

    const formDataToSend = new FormData();
    formDataToSend.append('name', item.name.trim());
    formDataToSend.append('serial', index + 1);
    formDataToSend.append('description', item.description.trim());
    formDataToSend.append('category', item.subSubCategory);

    try {
      // Compress image if present
      if (item.filename) {
        const compressed = await compressImage(item.filename);
        formDataToSend.append('filename', compressed);
      }

      const response = await axiosPublic.post(
        'admin/add-new-arrivals',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status >= 200 && response.status <= 205) {
        toast.success('New Arrival added successfully');

        // Update the form data with server response if needed
        if (response.data.filename) {
          setFormData((prev) => {
            const newData = [...prev];
            newData[index] = {
              ...newData[index],
              filename: response.data.filename,
              preview: `${process.env.NEXT_PUBLIC_API}/admin/getimage/${response.data.filename}`,
            };
            return newData;
          });
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(
        error.response?.data?.message || 'Failed to upload new arrival',
      );
    } finally {
      setIsUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleDiscontinue = async (index) => {
    const item = formData[index];

    if (!item.id) {
      toast.error('This item is not saved yet');
      return;
    }

    const confirm = window.confirm(
      'Are you sure you want to discontinue this arrival?',
    );

    if (!confirm) return;

    try {
      await axiosPublic.patch(
        `/admin/discontinue-new-arrival/${item.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success('Arrival discontinued');

      // Remove from UI immediately
      setFormData((prev) => prev.filter((_, i) => i !== index));

      setIsEditing((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to discontinue arrival',
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading></Loading>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Head>
        <title>Add New Arrivals - Admin Dashboard</title>
        <meta
          name="description"
          content="Manage new arrivals on the platform"
        />
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            New Arrivals Management
          </h1>
          <p className="text-gray-600 mt-2">
            Add and manage new arrival products
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-700">
              Current Arrivals
            </h2>
          </div>

          <div className="p-6">
            {formData.map(
              (item, index) =>
                item.isActive && (
                  <div
                    key={index}
                    className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Serial Number */}
                      <div className="flex-shrink-0">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          #{item.serial || index + 1}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Name Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={item.name}
                            onChange={(e) => handleChange(index, e)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter product name"
                            required
                          />
                        </div>

                        {/* Description Input */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={item.description}
                            onChange={(e) => handleChange(index, e)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            placeholder="Enter product description"
                            rows="2"
                            required
                          />
                        </div>

                        {/* Category Selection */}
                        <div className="lg:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          {!isEditing[index] ? (
                            <div className="flex items-center justify-between p-2.5 border border-gray-300 rounded-lg bg-white">
                              <span className="text-gray-700">
                                {item?.subsub?.name || 'Select category'}
                              </span>
                              <button
                                onClick={() => {
                                  const editState = [...isEditing];
                                  editState[index] = true;
                                  setIsEditing(editState);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2 transition-colors"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <select
                                name="subSubCategory"
                                value={item.subSubCategory}
                                onChange={(e) => handleChange(index, e)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                              >
                                <option value="" disabled>
                                  Select Sub-Subcategory
                                </option>
                                {subSubCategories.map((subSubCategory) => (
                                  <option
                                    key={subSubCategory.id}
                                    value={subSubCategory.id}
                                  >
                                    {subSubCategory.name} ›{' '}
                                    {subSubCategory.category.name} ›{' '}
                                    {subSubCategory.category.category.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  const editState = [...isEditing];
                                  editState[index] = false;
                                  setIsEditing(editState);
                                }}
                                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                              >
                                Cancel Selection
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Image
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              name="filename"
                              onChange={(e) => handleChange(index, e)}
                              accept="image/*"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                            />

                            {/* Image Preview */}
                            {(item.preview || item.filename) && (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                  src={
                                    item.preview ||
                                    `${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.filename}`
                                  }
                                  alt="Product preview"
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Upload Button */}
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        {/* Save */}
                        <button
                          onClick={() => handleUpload(index)}
                          disabled={isUploading[index]}
                          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                            isUploading[index]
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isUploading[index] ? 'Uploading...' : 'Save Arrival'}
                        </button>

                        {/* Discontinue */}
                        {item.id && (
                          <button
                            onClick={() => handleDiscontinue(index)}
                            className="px-5 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                          >
                            Discontinue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ),
            )}

            {/* Add More Button */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleAddNewArrival}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Arrival
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewArrivals;
