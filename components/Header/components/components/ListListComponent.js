import axios from 'axios';
import useAxiosPublic from '../../../../Hooks/useAxiosPublic';

import React, { useEffect, useState } from 'react';

const ListListComponent = ({ sub, ListStyle }) => {
    const axiosPublic = useAxiosPublic();

    const [cats, setCats] = useState([])

    useEffect(() => {
        axiosPublic.get(`/admin/view-product-sub-sub-category/${sub.id}`)
            .then(res => setCats(res.data))
    }, [])

    return (
        <div className='space-y-3'>
            {
                cats.map((cat, index) => (
                    <ListStyle key={index} goto={`/products/${cat.id}`} pageName={cat.name} extraClass='opacity-80 text-sm' />
                ))
            }
        </div>
    );
};

export default ListListComponent;