import { useEffect, useState } from "react";
import ShowCat from "./ShowCat";
import Heading from "../Header/Heading";
import axios from "axios";

const ShopByCategory = () => {

    const [cats, setCats] = useState([])

    useEffect(() => {
        axios.get('http://localhost:3000/admin/view-product-categories')
            .then(res => 
                {
                    console.log(res.data);
                    setCats(res.data)
                }
                )
    }, [])

    return (
        <>
            <div className="pt-20 md:pt-16 lg:pt-10 pb-10 shadow-md px-10">
                <Heading first="Shop by" second="CATEGORY"></Heading>
                <div className="pt-4 md:pt-8 lg:pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {
                        cats.map((cat, index) => (
                            <ShowCat key={index} prop={cat}></ShowCat>
                        ))
                    }
                </div>
            </div>
        </>
    );
};

export default ShopByCategory;