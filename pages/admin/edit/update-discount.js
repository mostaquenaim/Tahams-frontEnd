import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import ProductFormComp from "../../../components/Product/ProductFormComp";
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useLoadSubSubCategories from "../../../Hooks/useLoadSubSubCategories";
import Head from "next/head";

export default function UpdateDiscount() {
    const axiosSecure = useAxiosSecure();
    const [selectedCats, setSelectedCats] = useState([]);
    const [subSubCategories] = useLoadSubSubCategories();
    const [searchTerm, setSearchTerm] = useState("");

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

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        const filteredIds = filteredCategories.map(cat => cat.id);
        if (isChecked) {
            const newSelection = [...new Set([...selectedCats, ...filteredIds])];
            setSelectedCats(newSelection);
        } else {
            const remaining = selectedCats.filter(id => !filteredIds.includes(id));
            setSelectedCats(remaining);
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
            await axiosSecure.put("/admin/update-discount", payload);
            toast.success("Discount updated successfully!");
            reset();
            setSelectedCats([]);
        } catch (error) {
            console.error(error.response?.data?.message || error.message);
            toast.error("Failed to update discount");
        }
    };

    const filteredCategories = subSubCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        || cat.category.name.toLowerCase().includes(searchTerm.toLowerCase())
        || cat.category.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allFilteredSelected = filteredCategories.every(cat => selectedCats.includes(cat.id));

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
                            <label className="text-sm font-semibold mb-2 block">Search Categories:</label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 mb-2 border rounded"
                            />

                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="select_all"
                                    onChange={handleSelectAll}
                                    checked={filteredCategories.length > 0 && allFilteredSelected}
                                    className="h-4 w-4 text-blue-500"
                                />
                                <label htmlFor="select_all" className="ml-2 text-sm font-medium">Select All</label>
                            </div>

                            <div className="space-y-1 max-h-60 overflow-y-auto border rounded p-2">
                                {filteredCategories.map((category) => (
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
                                {filteredCategories.length === 0 && (
                                    <div className="text-gray-500 text-sm italic">No categories found</div>
                                )}
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
