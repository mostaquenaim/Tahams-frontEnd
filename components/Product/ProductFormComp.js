import React from 'react';

const ProductFormComp = ({ type, name, label, register, errors, placeholder, isDesc }) => {
    return (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900">
                {label}
            </label>
            {
                isDesc ?
                    <textarea
                        id={name}
                        rows="4"
                        className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                        placeholder={placeholder}
                        required=""
                        {...register(name, { required: true })}
                    />
                    :
                    <input
                        type={type}
                        min={0}
                        id={name}
                        className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                        placeholder={label}
                        required=""
                        {...register(name, { required: true })}
                    />
            }
            {errors.name && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    <span className="font-medium">
                        {errors.name.type === 'required'
                            ? `${label} is required`
                            : `Invalid ${label}`}
                    </span>
                </p>
            )}
        </div>
    );
};

export default ProductFormComp;