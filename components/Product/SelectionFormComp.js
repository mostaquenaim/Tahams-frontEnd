
const SelectionFormComp = ({label, name, selectedValue, setFunction, defaultShown, values, errors, register, extraItem=false, valueIsId=false  }) => {
    // console.log('values',values);
    return (
        <div className="mt-4">
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900">
                {label}
            </label>
            <select
                id={name}
                className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full"
                {...register(name, { required: true })}
                value={selectedValue}
                onChange={(e) => setFunction(e.target.value)}
            >
                <option value="" disabled>
                    {defaultShown}
                </option>
                {values.map((item) => (
                    <option key={item.id} value={valueIsId ? item.id : item.name} className="text-center" >
                       {item.name} {extraItem && `, ${item.category.name}`}
                    </option>
                ))}
            </select>
            {errors.name && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    <span className="font-medium">
                        {errors.name.type === 'required' ? `${name} is required` : 'Invalid Color'}
                    </span>
                </p>
            )}
        </div>
    );
};

export default SelectionFormComp;