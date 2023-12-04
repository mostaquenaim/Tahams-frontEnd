import React, { useEffect } from 'react';
import axios from 'axios';
import { useForm, useFieldArray } from 'react-hook-form';
import SessionCheck from '../../components/Auth/sessionCheck';
import DateTimePicker from 'react-datetime-picker';
import { HexColorPicker } from 'react-colorful';
import AdminDrawer from '../../Drafts/AdminDrawer';

const FileUpload = ({ handleFileChange }) => (
    <div className='flex flex-col gap-3 my-3 '>
        <div className='flex gap-2 items-center'>
            <input
                type="file"
                name="myfile"
                id="myfile"
                className="file-input file-input-bordered file-input-primary"
                onChange={handleFileChange}
            />
        </div>
    </div>
);

const ColorUpload = ({
    color,
    colorIndex,
    handleColorChange,
    removeColorField,
}) => (
    <div>
        <div className='flex justify-around' >
            <input
                type="text"
                name="colorCode"
                value={color.colorCode}
                onChange={(e) => handleColorChange(e, colorIndex)}
                placeholder="Color Code"
            />

            <input
                type="text"
                name="name"
                value={color.name}
                onChange={(e) => handleColorChange(e, colorIndex)}
                placeholder="Color Name"
            />

            <input
                type="number"
                name="quantity"
                placeholder="quantity"
                value={color.quantity}
                onChange={(e) => handleColorChange(e, colorIndex)}
            />
        </div>

        <div>
            <button type="button" className='btn' onClick={() => removeColorField(colorIndex)}>
                Remove Color
            </button>
        </div>

    </div>
);

const AddProduct = () => {
    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            serialNo: '',
            note: '',
            purchaseDate: '',
            vatPercentage: 0,
            discountPercentage: 0,
            buyingPrice: 0,
            sellingPrice: 0,
            tags: '',
            description: '',
            ifStock: true,
            colors: [{ colorCode: '', name: '', quantity: '' }],
            filename: '',
            subCategories: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'colors',
    });

    const onSubmit = async (data) => {
        console.log(data);

        const formData = new FormData();

        for (const key in data) {
            if (key === 'filename') {
                formData.append(key, data[key][0]);
            } else if (key === 'colors') {
                data.colors.forEach((color, index) => {
                    formData.append(`colors[${index}].colorCode`, color.colorCode);
                    formData.append(`colors[${index}].name`, color.name);
                    formData.append(`colors[${index}].quantity`, color.quantity);
                    // Add additional fields if needed
                });
            } else {
                formData.append(key, data[key]);
            }
        }

        try {
            const response = await axios.post('https://tahams-test-production.up.railway.app/admin/add-product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response.data);

            // Handle success, e.g., redirect or show a success message
        } catch (error) {
            console.error('Error adding product:', error);
            // Handle error, e.g., display an error message
        }
    };

    const handleFileChange = (e) => {
        setValue('filename', e.target.files);
    };

    useEffect(() => {
        // Additional initialization logic if needed
    }, []);

    return (
        <>
            <AdminDrawer />
            <SessionCheck />
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-zinc-50 to-blue-100">
                <div className="bg-white shadow-md hover:shadow-lg p-6 rounded-lg">
                    <h2 className="font-bold text-xl text-center mb-4">Add Product</h2>
                    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-4">
                        <div className="flex flex-col gap-3 my-3">

                            <div className="flex gap-2 items-center">
                                <label htmlFor="name">Name:</label>
                                <input type="text" id="name" {...register('name')} />
                            </div>

                            <div className="flex gap-2 items-center">
                                <label htmlFor="serialNo">Serial No:</label>
                                <input type="text" id="serialNo" {...register('serialNo')} />
                            </div>

                            <div className="flex gap-2 items-center">
                                <label htmlFor="note">Note</label>
                                <input type="text" id="note" {...register('note')} />
                            </div>

                            <div className="flex gap-2 items-center">
                                <label htmlFor="vatPercentage"> Vat Percentage:</label>
                                <input type="number" id="vatPercentage" {...register('vatPercentage')} />
                            </div>

                            <div className="flex gap-2 items-center">
                                <label htmlFor="discountPercentage">discountPercentage</label>
                                <input type="number" id="discountPercentage" {...register('discountPercentage')} />
                            </div>

                            <div className="flex gap-2 items-center">
                                <label htmlFor="buyingPrice">buyingPrice:</label>
                                <input type="number" id="buyingPrice" {...register('buyingPrice')} />
                            </div>

                            <div className="flex gap-2 items-center">
                                <label htmlFor="sellingPrice">sellingPrice:</label>
                                <input type="number" id="sellingPrice" {...register('sellingPrice')} />
                            </div>

                            {/* Add similar input elements for other fields */}
                        </div>

                        <FileUpload handleFileChange={handleFileChange} />
{/* 
                        <ColorUpload

                        ></ColorUpload> */}
                        {/* <button type="button" className='btn btn-primary' onClick={() => append({ colorCode: '', name: '', quantity: '' })}>
                            Add Color
                        </button> */}

                        <div className='flex justify-around'>
                            <div></div>
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                                >
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddProduct;
