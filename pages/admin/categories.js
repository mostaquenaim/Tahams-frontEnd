import Drawer from '../components/drawer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import SessionCheck from '../components/sessionCheck';
import Image from 'next/image';
import ShowCategories from '../components/showCategories';

export default function AddCategory() {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const router = useRouter();

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const result = await axios.get(`http://localhost:3000/admin/view-product-categories`);
        setCategories(result.data);
    };

    const handleModelClick = (itemId) => {
        router.push(`/admin/update-category/${itemId}`);
    };
    
    return (
        <>
            <Drawer title="Update Vehicle" />
            <SessionCheck />
            <section className="bg-gradient-to-b from-zinc-50 to-blue-100 min-h-screen flex justify-center items-center">
                <div className="container mx-auto bg-white shadow-md hover:shadow-lg hover:shadow-black p-6 rounded-lg">
                    <div className="text-center mb-4">
                        <h1 className="font-bold text-xl">categories</h1>
                    </div>
                    <div className='grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2'>
                        {categories.map((item) => (
                            <ShowCategories key={item.id} item={item} handleModelClick={handleModelClick}/> 
                        ))}
                    </div>
                </div>
            </section>


        </>
    );
}
