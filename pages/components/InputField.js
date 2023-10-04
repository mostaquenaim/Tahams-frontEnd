import React from 'react';

const InputField = ({ label, type, name, value, handleChange, placeholder='...' }) => {
    return (
        <>
            <tr>
                <td>
                    <label className="text-sm font-semibold mb-1">{label}</label>
                </td>
                <td>
                    <input
                        type={type}
                        name={name}
                        value={value}
                        placeholder={placeholder}
                        onChange={handleChange}
                        className="border p-2 rounded focus:ring focus:ring-blue-300 transition duration-300 ease-in-out"
                    />
                </td>
            </tr>
        </>
    );
};

export default InputField;