import { useEffect, useState } from 'react';
import { TagsInput } from 'react-tag-input-component';
import 'react-datetime-picker/dist/DateTimePicker.css';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import ProductFormComp from '../../../components/Product/ProductFormComp';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import SelectionFormComp from '../../../components/Product/SelectionFormComp';
import useLoadSubSubCategories from '../../../Hooks/useLoadSubSubCategories';
import useLoadColors from '../../../Hooks/useLoadColors';
import useLoadFabrics from '../../../Hooks/useLoadFabrics';
import useLoadSizes from '../../../Hooks/useLoadSizes';
import Head from 'next/head';

export default function AddProduct() {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedCatsInfo, setSelectedCatsInfo] = useState([]);
  const [selectedTags, setSelectedTags] = useState(['cloth']);
  const [success, setSuccess] = useState('');
  const [isSizeApplicable, setIsSizeApplicable] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);

  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm();

  // load hooks
  const [subSubCategories] = useLoadSubSubCategories();
  const colors = useLoadColors();
  const fabrics = useLoadFabrics();
  const sizes = useLoadSizes();

  const [token, setToken] = useState('');

  useEffect(() => {
    const at = localStorage.getItem('access_token');
    setToken(at);

    // Check for duplicate product data in localStorage
    const duplicateProductData = localStorage.getItem('duplicate_product_data');
    if (duplicateProductData) {
      try {
        const productData = JSON.parse(duplicateProductData);
        populateFormWithDuplicateData(productData);
        // Remove the data from localStorage after using it
        localStorage.removeItem('duplicate_product_data');
      } catch (error) {
        console.error('Error parsing duplicate product data:', error);
      }
    }
  }, []);

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setAdditionalImagesPreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const populateFormWithDuplicateData = (productData) => {
    // Set basic fields
    setValue('name', productData.name);
    setValue('serialNo', productData.serialNo);
    setValue('note', productData.note);
    setValue('vatPercentage', productData.vatPercentage);
    setValue('discountPercentage', productData.discountPercentage);
    setValue('buyingPrice', productData.buyingPrice);
    setValue('sellingPrice', productData.sellingPrice);
    setValue('description', productData.description);
    setValue('longDescription', productData.longDescription);

    // Set color if available
    if (productData.color) {
      setSelectedColor(productData.color.id);
    }

    // Set tags if available
    if (productData.tags) {
      setSelectedTags(productData.tags.split(',').map((tag) => tag.trim()));
    }

    // Process categories and sizes
    if (productData.pscs && productData.pscs.length > 0) {
      const uniqueCategories = new Set();
      const categoriesInfo = [];
      const sizeApplicableCategories = [];

      productData.pscs.forEach((item) => {
        const categoryId = item.category.id;
        uniqueCategories.add(categoryId);

        // Check if this category is size applicable
        if (item.size) {
          if (!sizeApplicableCategories.includes(categoryId)) {
            sizeApplicableCategories.push(categoryId);
          }

          // Find or create category info
          let categoryInfo = categoriesInfo.find(
            (ci) => ci.category === categoryId,
          );
          if (!categoryInfo) {
            categoryInfo = { category: categoryId, sizes: [] };
            categoriesInfo.push(categoryInfo);
          }

          // Add size info
          categoryInfo.sizes.push({
            id: item.size.id,
            quantity: item.quantity,
          });
        } else {
          // For non-size categories
          let categoryInfo = categoriesInfo.find(
            (ci) => ci.category === categoryId,
          );
          if (!categoryInfo) {
            categoriesInfo.push({
              category: categoryId,
              sizes: [{ quantity: item.quantity }],
            });
          }
        }
      });

      setSelectedCats(Array.from(uniqueCategories));
      setSelectedCatsInfo(categoriesInfo);
      setIsSizeApplicable(sizeApplicableCategories);
    }
  };

  const validateFile = (value) => {
    if (value.length > 0) {
      const file = value[0];
      const allowedtypes = [
        'image/jpg',
        'image/png',
        'image/jpeg',
        'image/gif',
      ];
      if (!allowedtypes.includes(file.type)) {
        return false;
      }
    }
  };

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

  const handleSizeApplicableChange = (event, catID) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setIsSizeApplicable([...isSizeApplicable, catID]);
      return;
    }
    const res = isSizeApplicable.filter((category) => category !== catID);
    setIsSizeApplicable([...res]);
  };

  const onSubmit = async (data) => {
    // console.log('hereedd');
    setIsSubmitting(true);
    const formData = new FormData();

    let catsInfo = [];
    selectedCatsInfo.forEach((info) => {
      catsInfo.push(info.category);
      info.sizes.forEach((item) => {
        catsInfo.push([item.id, parseInt(item.quantity)]);
      });
    });

    formData.append('subCategories', selectedCats);
    formData.append('catsInfo', JSON.stringify(catsInfo));
    formData.append('name', data.name);
    formData.append('serialNo', data.serialNo);
    formData.append('note', data.note);
    formData.append('vatPercentage', data.vatPercentage);
    formData.append('discountPercentage', data.discountPercentage);
    formData.append('buyingPrice', data.buyingPrice);
    formData.append('sellingPrice', data.sellingPrice);
    formData.append('tags', selectedTags);
    formData.append('description', data.description);
    data.myfile && data.myfile[0] && formData.append('myfile', data.myfile[0]);
    formData.append('color', selectedColor);
    formData.append('longDescription', data.longDescription);

    try {
      const response = await axiosPublic.post('/admin/add-product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Product added successfully');
      data.myfiles?.length > 0 && (await onSubmitPictures(data));
      // reset();
    } catch (error) {
      console.error(error.response?.data?.message);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPictures = async (data) => {
    const formData = new FormData();
    Array.from(data.myfiles).forEach((file) => {
      formData.append('myfiles', file);
    });

    try {
      await axiosSecure.post('/admin/add-product-pictures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Product pictures uploaded successfully');
    } catch (error) {
      console.error(error.message);
      toast.error('Failed to upload product pictures');
    }
  };

  return (
    <>
      <Head>
        <title>Add Product - Admin</title>
      </Head>

      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Add New Product
            </h1>
            <p className="text-gray-600">
              Fill in the details below to add a new product to your inventory
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <form
              onSubmit={handleSubmit(onSubmit)}
              encType="multipart/form-data"
              className="p-6"
            >
              {/* Basic Information Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProductFormComp
                    type="text"
                    name="name"
                    label="Product Name"
                    register={register}
                    errors={errors}
                  />
                  <ProductFormComp
                    type="text"
                    name="serialNo"
                    label="Serial No"
                    register={register}
                    errors={errors}
                  />
                  <ProductFormComp
                    type="text"
                    name="note"
                    label="Note"
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Pricing Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ProductFormComp
                    type="number"
                    name="vatPercentage"
                    label="VAT %"
                    register={register}
                    errors={errors}
                  />
                  <ProductFormComp
                    type="number"
                    name="discountPercentage"
                    label="Discount %"
                    register={register}
                    errors={errors}
                  />
                  <ProductFormComp
                    type="number"
                    name="buyingPrice"
                    label="Buying Price"
                    register={register}
                    errors={errors}
                  />
                  <ProductFormComp
                    type="number"
                    name="sellingPrice"
                    label="Selling Price"
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Descriptions Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Product Descriptions
                </h2>
                <div className="space-y-6">
                  <ProductFormComp
                    isDesc={true}
                    name="description"
                    label="Short Description"
                    placeholder={'Brief description shown on product cards'}
                    register={register}
                    errors={errors}
                  />
                  <ProductFormComp
                    isDesc={true}
                    name="longDescription"
                    label="Full Description"
                    placeholder={'Detailed description shown on product page'}
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Attributes Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Product Attributes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectionFormComp
                    label={'Color'}
                    name={'color'}
                    selectedValue={selectedColor}
                    setFunction={setSelectedColor}
                    defaultShown={'Select color'}
                    values={colors}
                    errors={errors}
                    register={register}
                  />
                  <SelectionFormComp
                    label={'Fabric'}
                    name={'fabric'}
                    selectedValue={selectedFabric}
                    setFunction={setSelectedFabric}
                    defaultShown={'Select fabric'}
                    values={fabrics}
                    errors={errors}
                    register={register}
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Product Tags
                </h2>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tags (Press enter to add)
                  </label>
                  <TagsInput
                    value={selectedTags}
                    onChange={setSelectedTags}
                    name="tags"
                    placeHolder="Add tags..."
                    classNames={{
                      input: 'p-2 border rounded-lg w-full',
                      tag: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center',
                      remove: 'ml-2 text-blue-500 hover:text-blue-700',
                    }}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Tags help customers find your product
                  </p>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Featured Image
                </label>
                <div className="flex items-center justify-center ">
                  <label className="flex flex-col items-center justify-center  h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden">
                    {featuredImagePreview ? (
                      <img
                        src={featuredImagePreview}
                        alt="Featured preview"
                        className="w-auto h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF (MAX. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="myfile"
                      className="hidden"
                      {...register('myfile', {
                        required: true,
                        validate: validateFile,
                        onChange: handleFeaturedImageChange,
                      })}
                    />
                  </label>
                </div>
                {errors.myfile && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.myfile.type === 'required'
                      ? 'Featured image is required'
                      : 'Please upload a valid image file (PNG, JPG, GIF)'}
                  </p>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Additional Images
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden">
                    {additionalImagesPreview.length > 0 ? (
                      <div className="flex w-full h-full overflow-x-auto p-2">
                        {additionalImagesPreview.map((preview, index) => (
                          <div key={index} className="flex-shrink-0 mr-2">
                            <img
                              src={preview}
                              alt={`Additional preview ${index}`}
                              className="h-full w-auto object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF (MAX. 5MB each)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="file_input"
                      className="hidden"
                      multiple
                      {...register('myfiles', {
                        validate: validateFile,
                        onChange: handleAdditionalImagesChange,
                      })}
                    />
                  </label>
                </div>
                {errors.myfiles && (
                  <p className="mt-2 text-sm text-red-600">
                    Please upload valid image files (PNG, JPG, GIF)
                  </p>
                )}
              </div>

              {/* Categories & Inventory Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Categories & Inventory
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                      Select Categories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subSubCategories.map((category) => (
                        <div
                          key={category.id}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id={`cat-${category.id}`}
                              onChange={(e) =>
                                handleCategoryChange(e, category.id)
                              }
                              checked={selectedCats.includes(category.id)}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`cat-${category.id}`}
                              className="ml-3 block"
                            >
                              <span className="font-medium text-gray-700">
                                {category.name}
                              </span>
                              <p className="text-sm text-gray-500">
                                {category.category.name},{' '}
                                {category.category.category.name}
                                {category.category.category.isGenderVaried &&
                                  (category.category.category.isForMen
                                    ? ' (Men)'
                                    : ' (Women)')}
                              </p>
                            </label>
                          </div>

                          {selectedCats.includes(category.id) && (
                            <div className="mt-3 ml-7 pl-2 border-l-2 border-gray-200">
                              <div className="flex items-center mb-2">
                                <input
                                  type="checkbox"
                                  id={`size-applicable-${category.id}`}
                                  checked={isSizeApplicable.includes(
                                    category.id,
                                  )}
                                  onChange={(e) =>
                                    handleSizeApplicableChange(e, category.id)
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`size-applicable-${category.id}`}
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  This product has sizes
                                </label>
                              </div>

                              {isSizeApplicable.includes(category.id) ? (
                                <div className="space-y-2">
                                  {sizes.map((size) => (
                                    <div
                                      key={size.id}
                                      className="flex items-center"
                                    >
                                      <label className="w-20 text-sm text-gray-700">
                                        {size.name}
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        className="block w-24 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Qty"
                                        onInput={(e) =>
                                          handleSizeAndQuantityChange(
                                            e,
                                            category.id,
                                            size.id,
                                          )
                                        }
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <label className="w-20 text-sm text-gray-700">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    className="block w-24 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Qty"
                                    onInput={(e) =>
                                      handleSizeAndQuantityChange(
                                        e,
                                        category.id,
                                      )
                                    }
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
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Processing...
                    </span>
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="fixed bottom-5 right-5 flex flex-col space-y-3">
          {/* Scroll to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-lg"
          >
            ↑
          </button>

          {/* Scroll to Bottom Button */}
          <button
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'instant',
              })
            }
            className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-lg"
          >
            ↓
          </button>
        </div>
      </div>
      {/* <Toaster position="top-right" /> */}
    </>
  );
}
