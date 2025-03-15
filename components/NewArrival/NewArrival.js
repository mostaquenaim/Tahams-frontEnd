import React, { useEffect, useState } from 'react';
import ShowNewArrival from './ShowNewArrival';
import Heading from '../Header/Heading';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

const NewArrival = () => {
    const [products, setProducts] = useState([])
    const axiosPublic = useAxiosPublic()

    useEffect(() => {
        fetchNewArrivals()
    }, [])

    const fetchNewArrivals = async () => {
        const res = await axiosPublic.get(`/admin/view-new-arrivals`)
        // console.log(res);
        setProducts(res.data)
    }

    return (
        <>
            <div className="pt-20 md:pt-16 lg:pt-10 shadow-md px-10">
                <Heading first='NEW' second='ARRIVALS'></Heading>
                <div className="pt-10 pb-20 grid grid-cols-2 md:grid-cols-4 gap-5">
                    {
                        products.map((product, index) => (
                            <ShowNewArrival key={index} prop={product}></ShowNewArrival>
                        ))
                    }
                </div>
            </div>
        </>
    );
};

export default NewArrival;