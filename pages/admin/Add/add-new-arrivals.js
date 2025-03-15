import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';

const AddNewArrivals = ({ previousArrivals }) => {
    const axiosPublic = useAxiosPublic();
    const [formData, setFormData] = useState(
        [...previousArrivals, ...Array(Math.max(0, 4 - previousArrivals.length)).fill({ name: '', description: '', category: '', filename: null })]
    );

    const handleChange = (index, e) => {
        const updatedFormData = [...formData];
        if (e.target.name === 'filename') {
            updatedFormData[index][e.target.name] = e.target.files[0];
        } else {
            updatedFormData[index][e.target.name] = e.target.value;
        }
        setFormData(updatedFormData);
    };

    const handleUpload = async (index) => {
        const item = formData[index];
        const formDataToSend = new FormData();
        formDataToSend.append('name', item.name);
        formDataToSend.append('serial', index + 1);
        formDataToSend.append('description', item.description);
        formDataToSend.append('category', item.category);
        if (item.filename) {
            formDataToSend.append('filename', item.filename);
        }

        try {
            const response = await axiosPublic.post(`admin/add-new-arrivals`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Upload successful:', response.data);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Add New Arrivals</h2>

                {formData.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row space-x-4 mb-4 items-center border p-4 rounded-lg">
                        <p className="font-semibold">Serial: {index + 1}</p>
                        <input
                            type="text"
                            name="name"
                            value={item.name}
                            onChange={(e) => handleChange(index, e)}
                            className="w-full md:w-1/4 p-2 border rounded"
                            placeholder="Name"
                            required
                        />

                        <textarea
                            name="description"
                            value={item.description}
                            onChange={(e) => handleChange(index, e)}
                            className="w-full md:w-1/4 p-2 border rounded"
                            placeholder="Description"
                            required
                        ></textarea>

                        <input
                            type="text"
                            name="category"
                            value={item.category}
                            onChange={(e) => handleChange(index, e)}
                            className="w-full md:w-1/4 p-2 border rounded"
                            placeholder="Category"
                            required
                        />

                        <input
                            type="file"
                            name="filename"
                            onChange={(e) => handleChange(index, e)}
                            className="w-full md:w-1/4 p-2 border rounded"
                        />

                        {item.filename && (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.filename}`}
                                alt="Preview"
                                className="w-20 h-20 object-cover mt-2"
                            />
                        )}

                        <button
                            onClick={() => handleUpload(index)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2 md:mt-0">
                            Upload
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const getServerSideProps = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/admin/view-new-arrivals`);
        return {
            props: { previousArrivals: response.data },
        };
    } catch (error) {
        console.error('Error fetching previous arrivals:', error);
        return {
            props: { previousArrivals: [] },
        };
    }
};

export default AddNewArrivals;