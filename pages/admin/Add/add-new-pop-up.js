import React, { useState } from 'react';
import axios from 'axios';
import useAxiosPublic from '/./Hooks/useAxiosPublic';

const AddNewPopUp = () => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    startDate: '',
    endDate: '',
    isActive: true,
    file: null,
  });

  const axiosPublic = useAxiosPublic()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate title (no spaces allowed)
    if (/\s/.test(formData.title)) {
      alert('Title cannot contain spaces!');
      return;
    }

    const data = new FormData();
    data.append('filename', formData.file);
    data.append('title', formData.title || '');
    data.append('url', formData.url || '');
    data.append('startDate', formData.startDate || '');
    data.append('endDate', formData.endDate || '');
    data.append('isActive', formData.isActive);

    try {
      const res = await axiosPublic.post('/admin/add-new-pop-up', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Pop-up created successfully!');
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert('Error creating pop-up');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4">Add New Pop-Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => {
              if (/\s/.test(e.target.value)) {
                alert('Spaces are not allowed in the title!');
                return;
              }
              handleChange(e);
            }}
            className="w-full border p-2 rounded"
            placeholder="NO SPACE"
            pattern="^\S+$" // HTML5 pattern to prevent spaces
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">URL</label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Start Date *</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">End Date *</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Image File *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <label className="text-sm font-medium">Is Active</label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Pop-Up
        </button>
      </form>
    </div>
  );
};

export default AddNewPopUp;
