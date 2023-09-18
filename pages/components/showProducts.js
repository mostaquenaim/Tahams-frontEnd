import React from 'react';

const ShowProducts = (props) => {
    const { item, handleModelClick } = props
    return (
        <div>
            <div key={item.id} className="mb-4" onClick={() => handleModelClick(item.id)}>
                <div className="border p-4 rounded hover:bg-gray-200 cursor-pointer">
                    <div className="mb-2">
                        {
                            item.filename ?
                            <img className='h-72' src={`http://localhost:3000/admin/getimage/${item.filename}`}></img>
                            : "No image uploaded"
                        }

                        <h2
                            className="text-blue-900 text-extrabold hover:underline cursor-pointer text-center text-3xl"

                        >
                            {item.name}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowProducts;