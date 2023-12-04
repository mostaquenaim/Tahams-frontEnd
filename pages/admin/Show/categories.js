import Drawer from '../../components/Drawers/drawer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import SessionCheck from '../../components/Auth/sessionCheck';
import Image from 'next/image';
import ShowCategories from '../../components/Show/showCategories';
import SpinnerComp from '../../components/spinner';

export default function Categories() {

    const [loading, setLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [categoriesTemp, setCategoriesTemp] = useState([]);
    useEffect(() => {
        setLoading(true)
        loadCategories();
    }, []);
    const loadCategories = async () => {
        const result = await axios.get(`https://tahams-test-production.up.railway.app/admin/view-product-categories`);
        setCategories(result.data);
        setCategoriesTemp(result.data)
        setLoading(false)
    };
    const handleModelClick = (itemId) => {
        router.push(`/admin/update-category/${itemId}`);
    };
    const handleInputChange = (e) => {
        const searchText = e.target.value;
        const selectedCategories = categoriesTemp.filter((category) => category.categoryName.includes(searchText))
        console.log(selectedCategories)
        setCategories(selectedCategories)
    };

    return (
        <>
            <SessionCheck />
            {
                loading ? <div className='bg-white h-screen items-center flex text-center'>
                    <SpinnerComp />
                </div>
                    :
                    <>
                        <Drawer title="Update Vehicle" />
                        <section className="bg-gradient-to-b from-zinc-50 to-blue-100 min-h-screen flex justify-center items-center">
                            <div className="container mx-auto bg-white shadow-md hover:shadow-lg hover:shadow-black p-6 rounded-lg">
                                <div className="text-center mb-4">
                                    <h1 className="font-bold text-xl">categories</h1>
                                </div>
                                <div className='flex text-center justify-center items-center '>
                                    <div className='relative flex items-center'>
                                        <input
                                            className=' bg-transparent border-2 hover:border-3 hover:border-blue-200 rounded-xl p-2 m-2 pr-8'
                                            type='text'
                                            name="selectedProduct"
                                            onChange={handleInputChange}
                                        />
                                        <svg
                                            className='absolute right-4'
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C9.01 14 7 11.99 7 9.5S9.01 5 11.5 5 16 7.01 16 9.5 13.99 14 11.5 14z"
                                            />
                                            <path fill="none" d="M0 0h24v24H0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2'>
                                    {categories.map((item) => (
                                        <ShowCategories key={item.id} item={item} handleModelClick={handleModelClick} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
            }


        </>
    );
}
