import axios from "axios"
import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

export default function AddTest() {
    const [subSubCategories, setSubSubCategories] = useState([])
    const [selectedCats, setSelectedCats] = useState([])

    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm();

    const validateFile = (value) => {
        const file = value[0];
        const allowedtypes = ["image/jpg", "image/png"];

        if (!allowedtypes.includes(file.type)) {
            return false;
        }
    }

    // loads 
    const loadSubSubCategories = async () => {
        try {
            const result = await axios.get('https://tahams-test-production.up.railway.app/admin/view-product-sub-sub-categories');

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

    const handleCategoryChange = (event, catID) => {
        console.log(event.target.checked);
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
    }, []);

    const [success, setSuccess] = useState('')

    const onSubmit = async (data) => {
        console.log(data);
        console.log("cats", selectedCats);

        const formData = new FormData();

        const newCategories = subSubCategories.filter((subCat) => selectedCats.includes(subCat.id))

        console.log(newCategories);
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
        // formData.append('categories', JSON.stringify(data.categories));

        console.log(formData);
        try {
            const response = await axios.post("https://tahams-test-production.up.railway.app/admin/add-product",
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setSuccess('Product add successfully');
            reset();

        }
        catch (error) {
            console.log(error.response.data.message);

            setSuccess('product add unsuccessful ' + error.response.data.message);
        }
    };

    return (
        <>
            <div className="container mx-auto p-4 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                        <span className="font-medium">{success}</span>
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                        {/* Product Name */}
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Product name
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Product Name"
                                required=""
                                {...register('name', { required: true })}
                            />
                            {errors.name && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.name.type === 'required'
                                            ? 'Product name is required'
                                            : 'Invalid product name'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Serial No */}
                        <div>
                            <label htmlFor="serialNo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Serial No
                            </label>
                            <input
                                type="text"
                                id="serialNo"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Serial No"
                                required=""
                                {...register('serialNo', { required: true })}
                            />
                            {errors.serialNo && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.serialNo.type === 'required'
                                            ? 'Serial No is required'
                                            : 'Invalid Serial No'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Note */}
                        <div>
                            <label htmlFor="note" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Note
                            </label>
                            <input
                                type="text"
                                id="note"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Note"
                                required=""
                                {...register('note', { required: true })}
                            />
                            {errors.note && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.note.type === 'required'
                                            ? 'Note is required'
                                            : 'Invalid note'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Vat Percentage */}
                        <div>
                            <label htmlFor="vatPercentage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Vat Percentage
                            </label>
                            <input
                                type="number"
                                id="vatPercentage"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Vat Percentage"
                                required=""
                                {...register('vatPercentage', { required: true })}
                            />
                            {errors.vatPercentage && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.vatPercentage.type === 'required'
                                            ? 'Vat Percentage is required'
                                            : 'Invalid Vat Percentage'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Discount Percentage */}
                        <div>
                            <label htmlFor="discountPercentage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Discount Percentage
                            </label>
                            <input
                                type="number"
                                id="discountPercentage"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Discount Percentage"
                                required=""
                                {...register('discountPercentage', { required: true })}
                            />
                            {errors.discountPercentage && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.discountPercentage.type === 'required'
                                            ? 'Discount Percentage is required'
                                            : 'Invalid Discount Percentage'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Buying Price */}
                        <div>
                            <label htmlFor="buyingPrice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Buying Price
                            </label>
                            <input
                                type="number"
                                id="buyingPrice"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Buying Price"
                                required=""
                                {...register('buyingPrice', { required: true })}
                            />
                            {errors.buyingPrice && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.buyingPrice.type === 'required'
                                            ? 'Buying Price is required'
                                            : 'Invalid Buying Price'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Selling Price */}
                        <div>
                            <label htmlFor="sellingPrice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Selling Price
                            </label>
                            <input
                                type="number"
                                id="sellingPrice"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Selling Price"
                                required=""
                                {...register('sellingPrice', { required: true })}
                            />
                            {errors.sellingPrice && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {errors.sellingPrice.type === 'required'
                                            ? 'Selling Price is required'
                                            : 'Invalid Selling Price'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        <div>
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
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows="4"
                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                                placeholder="Full description here...."
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
                            <label htmlFor="file_input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Upload file
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
        </>
    );
}