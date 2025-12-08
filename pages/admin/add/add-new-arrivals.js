import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useLoadSubSubCategories from '../../../Hooks/useLoadSubSubCategories';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { compressImage } from '../edit/product/[id]';

const AddNewArrivals = ({ previousArrivals }) => {
  const [subSubCategories] = useLoadSubSubCategories();
  const axiosPublic = useAxiosPublic();

  const [formData, setFormData] = useState([
    ...previousArrivals,
    ...Array(Math.max(0, 4 - previousArrivals.length)).fill({
      name: '',
      description: '',
      category: '',
      subSubCategory: '',
      filename: null,
      preview: null,
    }),
  ]);

  const handleAddNewArrival = () => {
    setFormData((prev) => [
      ...prev,
      {
        name: '',
        description: '',
        category: '',
        subSubCategory: '',
        filename: null,
        preview: null,
      },
    ]);

    setIsEditing((prev) => [...prev, false]);
  };

  // State to track edit mode for subSubCategory selection
  const [isEditing, setIsEditing] = useState(
    Array(formData.length).fill(false),
  );

  const [token, setToken] = useState('');

  useEffect(() => {
    const at = localStorage.getItem('access_token');
    setToken(at);
  }, []);

  const handleChange = (index, e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => {
      const updatedFormData = [...prevState];
      updatedFormData[index] = {
        ...updatedFormData[index],
        [name]: name === 'filename' ? files[0] : value,
        preview:
          name === 'filename'
            ? URL.createObjectURL(files[0])
            : updatedFormData[index].preview,
      };
      return updatedFormData;
    });
  };

  const handleUpload = async (index) => {
    const item = formData[index];
    const formDataToSend = new FormData();
    formDataToSend.append('name', item.name);
    formDataToSend.append('serial', index + 1);
    formDataToSend.append('description', item.description);
    formDataToSend.append('category', item.subSubCategory || item.subsub.id);
    if (item.filename) {
      const compressed = await compressImage(item.filename);
      // console.log(compressed);
      formDataToSend.append('filename', compressed);
    }

    try {
      const response = await axiosPublic.post(
        `admin/add-new-arrivals`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status >= 200 && response.status <= 205) {
        toast.success('New Arrival Uploaded');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
      <Head>
        <title>Add New Arrival - Admin</title>
      </Head>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl w-full">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Add New Arrivals
        </h2>
        {formData.map((item, index) => (
          <>
            {item.serial != 'discontinued' && (
              <div
                key={index}
                className="flex flex-col md:flex-row space-x-4 mb-4 items-center border p-4 rounded-lg"
              >
                <p className="font-semibold">Serial: {item.serial}</p>
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

                {/* Sub-Subcategory Selection with Edit Mode */}
                <div className="w-full md:w-1/4 relative">
                  {!isEditing[index] ? (
                    <div className="flex items-center justify-between border p-2 rounded">
                      <span>{item?.subsub?.name || 'Select category'}</span>
                      <button
                        onClick={() => {
                          const editState = [...isEditing];
                          editState[index] = true;
                          setIsEditing(editState);
                        }}
                        className="text-blue-500 underline ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <select
                        name="subSubCategory"
                        value={item.subSubCategory}
                        onChange={(e) => handleChange(index, e)}
                        className="p-2 border rounded"
                        required
                      >
                        <option value="" disabled>
                          Select Sub-Subcategory
                        </option>
                        {subSubCategories.map((subSubCategory) => (
                          <option
                            key={subSubCategory.id}
                            value={subSubCategory.id}
                          >
                            {subSubCategory.name},{' '}
                            {subSubCategory.category.name},{' '}
                            {subSubCategory.category.category.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const editState = [...isEditing];
                          editState[index] = false;
                          setIsEditing(editState);
                        }}
                        className="text-red-500 underline mt-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  name="filename"
                  onChange={(e) => handleChange(index, e)}
                  className="w-full md:w-1/4 p-2 border rounded"
                />

                {/* Image Preview */}
                {item.preview ? (
                  <img
                    src={item.preview}
                    alt="New Preview"
                    className="w-20 h-20 object-cover mt-2"
                  />
                ) : (
                  item.filename && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.filename}`}
                      alt="Existing Preview"
                      className="w-20 h-20 object-cover mt-2"
                    />
                  )
                )}

                <button
                  onClick={() => handleUpload(index)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2 md:mt-0"
                >
                  Upload
                </button>
              </div>
            )}
          </>
        ))}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleAddNewArrival}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Add More
          </button>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/admin/view-new-arrivals`,
    );
    const sortedArrivals = response.data.sort((a, b) => a.serial - b.serial);

    return {
      props: { previousArrivals: sortedArrivals },
    };
  } catch (error) {
    console.error('Error fetching previous arrivals:', error);
    return {
      props: { previousArrivals: [] },
    };
  }
};

export default AddNewArrivals;
