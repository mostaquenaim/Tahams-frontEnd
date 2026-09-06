import useAxiosSecure from '/Hooks/useAxiosSecure';
import Loading from '/components/Loading';
import useLoadCats from '/Hooks/useLoadCats';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

const RearrangeNavbar = () => {
    const [categories, , isPending] = useLoadCats();
    const [localCategories, setLocalCategories] = useState([]);
    const axiosSecure = useAxiosSecure()

    // Initialize local state when categories are loaded
    useEffect(() => {
        if (categories && categories.length > 0) {
            const minimalData = categories.map(cat => ({
                id: cat.id,
                serial: cat.serial,
            }));
            setLocalCategories(minimalData);
        }
    }, [categories]);


    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(localCategories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLocalCategories(items);
    };

    const saveChanges = async () => {
        const updated = localCategories.map((item, index) => ({
            id: item.id,
            serial: index + 1,
        }));

        try {
            const res = await axiosSecure.post('/admin/shuffle-category', updated);
          // console.log('Server response:', res.data);
            toast.success('Category order saved successfully!');
        } catch (err) {
            console.error('Failed to save category order:', err);
            toast.error('Error saving category order. Please try again.');
        }
    };

    if (isPending) return <Loading />
    if (!localCategories.length) return <div>No categories found</div>;

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Rearrange Navigation Categories</h1>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="categories">
                    {(provided) => (
                        <ul
                            className="bg-gray-100 rounded-lg p-4"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {localCategories.map((category, index) => {
                                const fullCategory = categories.find(cat => cat.id === category.id);
                                return (
                                    <Draggable
                                        key={`category-${category.id}`}
                                        draggableId={`category-${category.id}`}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="bg-white p-3 mb-2 rounded shadow hover:shadow-md transition-shadow flex items-center"
                                            >
                                                <span className="mr-2 text-gray-500">≡</span>
                                                {
                                                    fullCategory?.name || 'Unnamed'} {
                                                    fullCategory.isGenderVaried
                                                    &&
                                                    (
                                                        fullCategory.isForWomen ? '(Women)'
                                                            :
                                                            fullCategory.isForMen && '(Men)'
                                                    )
                                                }
                                            </li>
                                        )}
                                    </Draggable>
                                );
                            })}

                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>

            <button
                onClick={saveChanges}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Save Changes
            </button>
        </div>
    );
};

export default RearrangeNavbar;