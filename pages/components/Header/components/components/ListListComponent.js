import axios from 'axios';
import React, { useEffect, useState } from 'react';

const ListListComponent = ({ sub, ListStyle }) => {

    const [cats, setCats] = useState([])

    useEffect(() => {
        axios.get(`http://localhost:3000/admin/view-product-sub-sub-category/${sub.id}`)
            .then(res => setCats(res.data))
    }, [])

    return (
        <div className='lg:space-y-3'>
            {
                cats.map((cat, index) => (
                    <ListStyle key={index} goto={`/products/${cat.id}`} pageName={cat.categoryName} extraClass='opacity-80 text-sm' />
                ))
            }
        </div>
    );
};

export default ListListComponent;