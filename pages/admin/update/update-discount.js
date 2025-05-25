import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import ProductFormComp from "../../../components/Product/ProductFormComp";
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useLoadSubSubCategories from "../../../Hooks/useLoadSubSubCategories";
import Head from "next/head";

export default function UpdateDiscount() {
    const axiosPublic = useAxiosPublic();
    const [selectedCats, setSelectedCats] = useState([]);
    const [subSubCategories] = useLoadSubSubCategories();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const handleCategoryChange = (event, catID) => {
        const isChecked = event.target.checked;

        if (isChecked) {
            setSelectedCats(prev => [...prev, catID]);
        } else {
            setSelectedCats(prev => prev.filter(id => id !== catID));
        }
    };

    const onSubmit = async (data) => {
        if (selectedCats.length === 0) {
            toast.error("Select at least one category");
            return;
        }

        const payload = {
            categoryIds: selectedCats,
            discountPercentage: parseFloat(data.discountPercentage),
        };

        try {
            await axiosPublic.put("/admin/update-discount", payload);
            toast.success("Discount updated successfully!");
            reset();
            setSelectedCats([]);
        } catch (error) {
            console.error(error.response?.data?.message || error.message);
            toast.error("Failed to update discount");
        }
    };

    return (
        <>
            <Head>
                <title>Update Discount - Admin</title>
            </Head>

            <div className="container mx-auto p-4 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Discount Percentage */}
                        <ProductFormComp
                            type="number"
                            name="discountPercentage"
                            label="Discount Percentage"
                            register={register}
                            errors={errors}
                        />

                        {/* Categories */}
                        <div className="mt-4">
                            <label className="text-sm font-semibold mb-2 block">Select Categories:</label>
                            <div className="space-y-1 max-h-60 overflow-y-auto border rounded p-2">
                                {subSubCategories.map((category) => (
                                    <div key={category.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`cat_${category.id}`}
                                            onChange={(e) => handleCategoryChange(e, category.id)}
                                            checked={selectedCats.includes(category.id)}
                                            className="h-4 w-4 text-blue-500"
                                        />
                                        <label htmlFor={`cat_${category.id}`} className="ml-2 text-sm">
                                            {category.name} ({category.category.name}, {category.category.category.name})
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
            <Toaster />
        </>
    );
}
