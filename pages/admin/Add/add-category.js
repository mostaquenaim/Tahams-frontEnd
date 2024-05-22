import { useState } from 'react';

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('https://api.tahamsbd.com/admin/addCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: categoryName }),
            })

            if (!response.ok) {
                throw new Error('Failed to add category');
            }

            // Reset the form after successful submission
            setCategoryName('');
        } catch (error) {
            console.error('Error adding category:', error.message);
        }
    };

    const handleChange = (event) => {
        setCategoryName(event.target.value);
    };

    return (
        <div>
            <h2>Add Category</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="categoryName">Category Name:</label>
                <input 
                    type="text" 
                    id="categoryName" 
                    name="categoryName" 
                    value={categoryName} 
                    onChange={handleChange} 
                />
                <button type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddCategory;
