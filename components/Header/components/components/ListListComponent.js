import useAxiosPublic from '../../../../Hooks/useAxiosPublic';

import React, { useEffect, useState } from 'react';

const ListListComponent = ({ sub, ListStyle }) => {
    // console.log(sub,99);
    const axiosPublic = useAxiosPublic();

    const [cats, setCats] = useState([])

    useEffect(() => {
        axiosPublic.get(`/admin/view-product-sub-sub-category/${sub.id}`)
            .then(res => {
                console.log(res.data, 99);
                setCats(res.data)
            })
    }, [])

    return (
        <div className='space-y-3'>
            {
                sub.isEnablePremium ?
                    <>
                        <p
                            className='text-sm underline'
                        // 'bg-white text-black'
                        >Elite</p>
                        {
                            cats.map((cat, index) => (
                                cat.isPremium &&
                                <ListStyle key={index} goto={`/products/${cat.id}`} pageName={cat.name} extraClass='opacity-80 text-sm' />
                            ))
                        }

                        <p
                            className='text-sm underline'
                        // 'bg-white text-black'
                        >Regular</p>
                        {
                            cats.map((cat, index) => (
                                !cat.isPremium &&
                                <ListStyle key={index} goto={`/products/${cat.id}`} pageName={cat.name} extraClass='opacity-80 text-sm' />
                            ))
                        }
                    </>
                    :
                    cats.map((cat, index) => (
                        <ListStyle key={index} goto={`/products/${cat.id}`} pageName={cat.name} extraClass='opacity-80 text-sm' />
                    ))

            }
        </div>
    );
};

export default ListListComponent;