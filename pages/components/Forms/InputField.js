import React from 'react';

const InputField = ({ label, type, name, value, handleChange, placeholder = '...' }) => {
    return (
        <>
            <div className='flex justify-around'>
                <label className="text-sm font-semibold mb-1">{label}</label>
                 < input
                    type={type}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChange}
                    className="border p-2 rounded focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                />
            </div>
        </>
    );
};

export default InputField;