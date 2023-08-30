import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import axios from 'axios';
import { useForm } from 'react-hook-form';

import SessionCheck from '@/pages/components/sessionCheck';

export default function ChangeCategoryImage({item}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const router = useRouter();

    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null); // State to hold the selected file

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('filename', file); // Append the selected file to the FormData

            await axios.post(`http://localhost:3000/admin/changeCategoryImage/${item.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }, // Set proper headers for file upload
            });

            setSuccess('Successfully uploaded file.');
            router.push(`../../categories`)

        } catch (error) {
            setSuccess('Error uploading file: ' + error);
        }
    };

    useEffect(() => {
        const UserEmail = sessionStorage.getItem('email');
        setEmail(UserEmail);
    }, []);

    return (
        <>
            <SessionCheck />

            <section className="bg-gradient-to-b from-zinc-50 to-blue-100 min-h-full flex justify-center items-center text-black hover:text-white transition duration-300">
                <div className="container mx-auto p-6 bg-white shadow-md hover:shadow-lg rounded-lg text-center">
                    <p>{success}</p>
                    <div className="my-4">
                        <input
                            type="file"
                            name="filename"
                            onChange={handleFileChange}
                            className="border p-2 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleUpdate}
                        className="btn bg-blue-400 text-black hover:text-white hover:bg-blue-600 transition duration-300"
                    >
                        Update
                    </button>
                </div>
            </section>
        </>
    );
}

export async function getServerSideProps(context) {

    const id = context.params.id;

    console.log(id);

    const response = await axios.get(`http://localhost:3000/admin/getCategoryById/${id}`);
    const item = await response.data;

    return { props: { item } }
}