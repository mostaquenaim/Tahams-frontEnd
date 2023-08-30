import Drawer from '../components/drawer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import SessionCheck from '../components/sessionCheck';
import Image from 'next/image';

export default function AddCategory() {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [categories, setCategories] = useState([]);
    const [email, setEmail] = useState("")

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const UserEmail = sessionStorage.getItem('email')
        setEmail(UserEmail)

        const result = await axios.get(`http://localhost:3000/admin/view-product-categories`);
        
        console.log(result.data);
        setCategories(result.data);
        console.log("usersss", categories)

    };

    const [inputValue, setInputValue] = useState();
    const router = useRouter();

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // redirect to the same page with query params containing the input value


        router.push({
            pathname: 'findusers',
            query: { inputValue: inputValue }
        });
    }

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
                        <h1 className="font-bold text-xl">Vehicles</h1>
                    </div>
                    <div className='grid grid-cols-3'>
                        {categories.map((item) => (
                            <div key={item.id} className="mb-4" onClick={() => handleModelClick(item.id)}>
                                <div className="border p-4 rounded hover:bg-gray-200 cursor-pointer">
                                    <div className="mb-2">
                                        <img src={`http://localhost:3000/admin/getimage/${item.filename}`}></img>

                                        <h2
                                            className="text-blue-900 text-extrabold hover:underline cursor-pointer text-center text-3xl"
                                            
                                        >
                                            {item.categoryName}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


        </>
    );
}
