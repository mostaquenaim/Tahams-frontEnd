import { useState } from 'react';

const SelectionFormComp = ({
    label,
    name,
    selectedValue,
    setFunction,
    defaultShown,
    values,
    errors,
    register,
    extraItem = false,
    valueIsId = false,
}) => {
    console.log(values, 'item');
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (item) => {
        setFunction(valueIsId ? item.id : item.name);
        setIsOpen(false);
    };

    return (
        <div className="mt-4">
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full text-left"
                >
                    {selectedValue || defaultShown}
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                        {values.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                            >
                                <span>
                                    {item.name}
                                    {
                                        !item?.isGenderVaried ? ''
                                            :
                                            item?.isForMen ? ', Men'
                                                :
                                                item?.isForWomen && ', Women'
                                    }
                                    {extraItem && `, ${item.category.name}
                                    ${!item.category?.isGenderVaried ? ''
                                            :
                                            item.category?.isForMen ? ', Men'
                                                :
                                                item.category?.isForWomen && ', Women'
                                        }
                                    `}
                                </span>
                                {item.colorCode && (
                                    <span
                                        className="w-5 h-5 rounded-full ml-2"
                                        style={{ backgroundColor: item.colorCode }}
                                    ></span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {errors[name] && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    <span className="font-medium">
                        {errors[name].type === 'required' ? `${name} is required` : 'Invalid selection'}
                    </span>
                </p>
            )}
        </div>
    );
};

export default SelectionFormComp;
