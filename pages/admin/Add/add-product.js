import axios from "axios"
import { useEffect, useState } from "react"
import { TagsInput } from "react-tag-input-component";
import 'react-datetime-picker/dist/DateTimePicker.css';
import { useForm } from 'react-hook-form';
import AdminDrawer from "/components/Drawers/AdminDrawer";
import toast, { Toaster } from 'react-hot-toast';
import ProductFormComp from "../../../components/Product/ProductFormComp";
import useAxiosPublic from '../../../Hooks/useAxiosPublic'
import SelectionFormComp from "../../../components/Product/SelectionFormComp";
import useLoadSubSubCategories from "../../../Hooks/useLoadSubSubCategories";
import useLoadColors from "../../../Hooks/useLoadColors";
import useLoadFabrics from "../../../Hooks/useLoadFabrics";
import useLoadSizes from "../../../Hooks/useLoadSizes";
import Head from "next/head";

export default function AddProduct() {
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedFabric, setSelectedFabric] = useState('');
    const [selectedCats, setSelectedCats] = useState([])
    const [selectedCatsInfo, setSelectedCatsInfo] = useState([])
    const [selectedTags, setSelectedTags] = useState(["cloth"]);
    const [success, setSuccess] = useState('')
    const [isSizeApplicable, setIsSizeApplicable] = useState([]);

    const axiosPublic = useAxiosPublic();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm();

    // load hooks
    const [subSubCategories] = useLoadSubSubCategories();
    const colors = useLoadColors();
    const fabrics = useLoadFabrics();
    const sizes = useLoadSizes();

    const [token, setToken] = useState('')

    useEffect(() => {
        const at = localStorage.getItem('access_token');
        setToken(at)
    }, [])

    const validateFile = (value) => {
        // console.log('value', value);
        if (value.length > 0) {
            const file = value[0];
            // console.log(value[0]);
            const allowedtypes = ["image/jpg", "image/png", "image/jpeg", "image/gif"];

            if (!allowedtypes.includes(file.type)) {
                return false;
            }
        }
    }

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

    const handleSizeAndQuantityChange = (event, catID, sizeId) => {
        // console.log("selectedCatsInfo", selectedCatsInfo, 'event',event.target.value, 'catID',catID, 'sizeId',sizeId);

        const categoryWiseItem = selectedCatsInfo.find(cat => cat.category == catID)

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

        // console.log("categoryWiseItem", categoryWiseItem);

        const result = selectedCatsInfo.filter(item => item.category != catID)

        setSelectedCatsInfo([...result, categoryWiseItem])
    }

    const handleSizeApplicableChange = (event, catID) => {
        const isChecked = event.target.checked

        if (isChecked) {
            setIsSizeApplicable([...isSizeApplicable, catID])
            return
        }

        const res = isSizeApplicable.filter(category => category !== catID)
        setIsSizeApplicable([...res])
    }

    const onSubmit = async (data) => {
        // console.log(selectedCatsInfo);
        const formData = new FormData();

        let catsInfo = []
        selectedCatsInfo.forEach((info) => {
            catsInfo.push(info.category)
            info.sizes.forEach((item) => {
                catsInfo.push([item.id, parseInt(item.quantity)])
            })
        })

        // console.log('selectedCats',selectedCats)
        // console.log('selectedColor', selectedColor)
        // console.log('catsInfo', JSON.stringify(catsInfo))
        // console.log('selectedCatsInfo', JSON.stringify(selectedCatsInfo) );

        formData.append('subCategories', selectedCats)
        formData.append('catsInfo', JSON.stringify(catsInfo))
        // formData.append('selectedCatsInfo', JSON.stringify(selectedCatsInfo))
        formData.append('name', data.name);
        formData.append('serialNo', data.serialNo);
        formData.append('note', data.note);
        formData.append('vatPercentage', data.vatPercentage);
        formData.append('discountPercentage', data.discountPercentage);
        formData.append('buyingPrice', data.buyingPrice);
        formData.append('sellingPrice', data.sellingPrice);
        formData.append('tags', selectedTags);
        formData.append('description', data.description);
        formData.append('myfile', data.myfile[0]);
        formData.append('color', selectedColor);
        formData.append('longDescription', data.longDescription);

        // formData.append('categories', JSON.stringify(data.categories));
        // console.log(formData);

        try {
            const response = await axiosPublic.post("/admin/add-product",
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                }
            });

            setSuccess('Product add successfully');
            toast.success('Product add successfully');

            data.myfiles.length > 0 &&
                onSubmitPictures(data);
            // reset();


        }
        catch (error) {
            console.error(error.response.data.message);
            setSuccess('product add unsuccessful ' + error.response.data.message);
            toast.success('product add unsuccessful ' + error.response.data.message);
        }
    };

    const onSubmitPictures = async (data) => {
        // console.log(data); // Check if files contains the expected File objects
        // console.log(data); // Check if files contains the expected File objects

        const formData = new FormData();

        // console.log(data.myfiles, 'all files');

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
            // reset();

        } catch (error) {
            console.error(error.message);
            setSuccess('Product pictures upload unsuccessful: ' + error.message);
        }
    };

    return (
        <>
            <Head>
                <title>Add Product - Admin</title>
            </Head>
            {/* <AdminDrawer></AdminDrawer> */}
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

                        {/* Description */}
                        <ProductFormComp isDesc={true} name='description' label='Short Description' placeholder={'Short description here [shown in right side]'} register={register} errors={errors} />

                        {/* Long Description */}
                        <ProductFormComp isDesc={true} name='longDescription' label='Full Description' placeholder={'Full description here [shown below the product]'} register={register} errors={errors} />

                        {/* color selection  */}
                        <SelectionFormComp label={'Select a color'} name={'color'} selectedValue={selectedColor} setFunction={setSelectedColor} defaultShown={'Choose a color'} values={colors} errors={errors} register={register} />

                        {/* FABRIC SELECTION  */}
                        <SelectionFormComp label={'Select a fabric'} name={'fabric'} selectedValue={selectedFabric} setFunction={setSelectedFabric} defaultShown={'Choose a fabric'} values={fabrics} errors={errors} register={register} />

                        {/* tags  */}
                        <div>
                            <h1>Add Tags</h1>
                            <pre>{JSON.stringify(selectedTags)}</pre>
                            <TagsInput
                                value={selectedTags}
                                onChange={setSelectedTags}
                                name="tags"
                                placeHolder="enter tags"
                            />
                            <em>press enter add new tag</em>
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
                                {...register('myfiles', { validate: validateFile })}
                                multiple // Allow multiple file selection
                            />
                            {errors.myfiles && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="font-medium">
                                        {/* {errors.myfiles.type === 'required'
                                            ? 'Files are required'
                                            :  */}
                                        Invalid file
                                        {/* } */}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Categories and Sizes */}
                        <div className='flex justify-around'>
                            <label className="text-sm font-semibold mb-1">Categories:</label>
                            <div className="space-y-1">
                                {/* categories fetch  */}
                                {subSubCategories.map((category, index) => (
                                    <div key={category.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name={`selectedCategories[${category.id}]`}
                                            id={`selectedCategories_${category.id}`}
                                            onChange={(e) => handleCategoryChange(e, category.id)}
                                            checked={selectedCats.includes(
                                                category.id
                                            )}
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
                                        {/* is size applicable  */}
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
                                                {/* size selection  */}
                                                {isSizeApplicable.includes(category.id) ? (
                                                    sizes.map((size) => (
                                                        <div key={size.id} className="flex items-center mb-2">
                                                            <label className="text-sm font-medium text-gray-900 mr-2">{size.name}</label>
                                                            <input
                                                                type="number"
                                                                // defaultValue={0}
                                                                min={0}
                                                                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                                                                placeholder={`Quantity for ${size.name}`}
                                                                onInput={(e) => handleSizeAndQuantityChange(e, category.id, size.id)}
                                                            // {...register(`categories[${index}].sizes.${size.name}`, { required: false })}
                                                            />
                                                        </div>
                                                    ))
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
                                                        // disabled={isSizeApplicable.includes(category.id)} 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
            <div className="fixed bottom-5 right-5 flex flex-col space-y-3">
                {/* Scroll to Top Button */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-lg"
                >
                    ↑
                </button>

                {/* Scroll to Bottom Button */}
                <button
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-800 shadow-lg"
                >
                    ↓
                </button>
            </div>
            <Toaster />
        </>
    );
}