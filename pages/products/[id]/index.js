import React, { useContext, useEffect, useState } from 'react';
import NavbarCompTwo from '/components/Header/NavbarComp';
import ShowProduct from '/components/Product/ShowProduct';
import FilterComp from '/components/Filter/Filter';
import { FaFilter } from "react-icons/fa";
import Footer from '/components/Footer/Footer';
import axios from 'axios';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';

import Link from 'next/link';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import FetchProducts from '../../../components/Product/FetchProducts';

const Product = ({ categories }) => {
    return <FetchProducts categories={categories}/>
};

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/admin/get-product-by-sub-sub-cat/${id}`);
        const categories = await response.json();

        return {
            props: {
                categories,
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        // Return an empty object if there's an error
        return {
            props: {},
        };
    }
}

export default Product;
