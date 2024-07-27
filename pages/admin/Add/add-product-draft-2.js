import axios from "axios"
import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import AdminDrawer from "/components/Drawers/AdminDrawer";
import toast, { Toaster } from 'react-hot-toast';
import ProductFormComp from "../../../components/Product/ProductFormComp";
import useAxiosPublic from '../../../Hooks/useAxiosPublic'

export default function AddProduct() {
    const [subSubCategories, setSubSubCategories] = useState([])
    const [colors, setColors] = useState([])
    const [selectedCats, setSelectedCats] = useState([])
    const [selectedColor, setSelectedColor] = useState('');
    const [longDescription, setLongDescription] = useState('');

    const router = useRouter();
    const axiosPublic = useAxiosPublic();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const validateFile = (value) => { 
        const file = value[0];
        // console.log(value[0]);
        const allowedtypes = ["image/jpg", "image/png", "image/jpeg", "image/gif"];

        if (!allowedtypes.includes(file.type)) {
            return false;
        }
    }

    // loads 
    const loadSubSubCategories = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-product-sub-sub-categories');

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

    const loadColors = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-colors');
            // Sort the subSubCategories array based on categoryName
            setColors(result.data);
        } catch (error) {
            console.error('Error loading sub-sub-categories:', error);
        }
    };

    const handleCategoryChange = (event, catID) => {
        // console.log(event.target.checked);
        const isChecked = event.target.checked

        if (isChecked) {
            setSelectedCats([...selectedCats, catID])
            return
        }

        const res = selectedCats.filter(category => category !== catID)
        setSelectedCats([...res])
    }

    // use effect 
    useEffect(() => {
        loadSubSubCategories();
        loadColors()
    }, []);

    const [success, setSuccess] = useState('')

    const onSubmit = async (data) => {
        // console.log(data);
        // console.log("cats", selectedCats);
        // console.log(data.myfile[0]);
        // console.log(data.myfiles, "97");
        // console.log(data.myfiles[0], "98");


        const formData = new FormData();

        const newCategories = subSubCategories.filter((subCat) => selectedCats.includes(subCat.id))

        // data.myfiles.forEach((file) => {
        //     formData.append('myfiles', file);
        // });

        // console.log(newCategories);
        formData.append('subCategories', selectedCats)
        formData.append('name', data.name);
        formData.append('serialNo', data.serialNo);
        formData.append('note', data.note);
        formData.append('vatPercentage', data.vatPercentage);
        formData.append('discountPercentage', data.discountPercentage);
        formData.append('buyingPrice', data.buyingPrice);
        formData.append('sellingPrice', data.sellingPrice);
        formData.append('tags', data.tags);
        formData.append('description', data.description);
        formData.append('myfile', data.myfile[0]);
        formData.append('color', data.color);
        formData.append('longDescription', longDescription);

        // formData.append('categories', JSON.stringify(data.categories));
        // console.log(formData);

        try {
            const response = await axiosPublic.post("/admin/add-product",
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setSuccess('Product add successfully');
            toast.success('Product add successfully');
            onSubmitPictures(data);
            reset();


        }
        catch (error) {
            console.log(error.response.data.message);
            setSuccess('product add unsuccessful ' + error.response.data.message);
            toast.success('product add unsuccessful ' + error.response.data.message);
        }
    };

    const onSubmitPictures = async (data) => {
        // console.log(data); // Check if files contains the expected File objects
        // console.log(data); // Check if files contains the expected File objects

        const formData = new FormData();

        // Append each file to FormData
        Array.from(data.myfiles).forEach((file) => {
            formData.append('myfiles', file);
        });

        // console.log(formData);

        try {
            const response = await axiosPublic.post("/admin/add-product-pictures",
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setSuccess('Product pictures uploaded successfully');
            reset();

        } catch (error) {
            console.log(error.response.data.message);
            setSuccess('Product pictures upload unsuccessful: ' + error.response.data.message);
        }
    };

    return (
        <>
            <AdminDrawer></AdminDrawer>
            <div className="container mx-auto p-4 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                        <span className="font-medium">{success}</span>
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                        {/* Product Name */}
                        <ProductFormComp type='text' name='name' label='Product Name' register={register} errors={errors} />

                        {/* Serial No */}
                        <ProductFormComp type='text' name='serialNo' label='Serial No' register={register} errors={errors} />

                        {/* Note */}
                        <ProductFormComp type='text' name='note' label='Note' register={register} errors={errors} />

                        {/* Vat Percentage */}
                        <ProductFormComp type='number' name='vatPercentage' label='Vat Percentage' register={register} errors={errors} />

                        {/* Discount Percentage */}
                        <ProductFormComp type='number' name='discountPercentage' label='Discount Percentage' register={register} errors={errors} />

                        {/* Buying Price */}
                        <ProductFormComp type='number' name='buyingPrice' label='Buying Price' register={register} errors={errors} />

                        {/* Selling Price */}
                        <ProductFormComp type='number' name='sellingPrice' label='Selling Price' register={register} errors={errors} />

                        {/* Tags */}
                        {/* <div>
                            <label htmlFor="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Tags
                            </label>
                            <input
                                type="text"
                                id="tags"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Tags"
                                required=""
                                {...register('tags', { required: true })}
                            />
                            {errors.tags && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.tags.type === 'required'
                                            ? 'Tags is required'
                                            : 'Invalid Tags'}
                                    </span>
                                </p>
                            )}
                        </div> */}

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows="4"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Short description here [shown in right side]"
                                {...register('description', { required: true })}
                            />
                            {errors.description && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.description.type === 'required'
                                            ? 'Description is required'
                                            : 'Invalid Description'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Long Description */}
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows="4"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Full description here [shown below the product]"
                                value={longDescription}
                                onChange={(e) => setLongDescription(e.target.value)}
                            />
                        </div>

                        {/* categories */}
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
                                            <span className='font-semibold text-xl'> {category.categoryName} </span>
                                            ({category.category.categoryName}, <span className=''>{category.category.category.categoryName}</span>)
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* file upload  */}
                        <div>
                            <label htmlFor="file_input" className="block mb-2 text-sm font-medium text-gray-900">
                                Upload featured photo
                            </label>
                            <input
                                type="file"
                                id="myfile"
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer"
                                {...register('myfile', { required: true, validate: validateFile })}
                            />
                            {errors.myfile && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.myfile.type === 'required'
                                            ? 'File is required'
                                            : 'Invalid file'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* product pictures */}
                        <div>
                            <label htmlFor="file_input" className="block mb-2 text-sm font-medium text-gray-900">
                                Upload product photos
                            </label>
                            <input
                                type="file"
                                id="file_input"
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer"
                                {...register('myfiles', { required: true, validate: validateFile })}
                                multiple // Allow multiple file selection
                            />
                            {errors.myfiles && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.myfiles.type === 'required'
                                            ? 'Files are required'
                                            : 'Invalid file'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Color Selection */}
                        <div className="mt-4">
                            <label htmlFor="color" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Select Color
                            </label>
                            <select
                                id="color"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                {...register('color', { required: true })}
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                            >
                                <option value="" disabled>
                                    Choose a color
                                </option>
                                {colors.map((color) => (
                                    <option key={color.id} value={color.name} className="text-center" style={{ backgroundColor: color.colorCode }}>
                                        {color.name}
                                    </option>
                                ))}
                            </select>
                            {errors.color && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.color.type === 'required' ? 'Color is required' : 'Invalid Color'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
            {/* <Toaster /> */}
        </>
    );
}