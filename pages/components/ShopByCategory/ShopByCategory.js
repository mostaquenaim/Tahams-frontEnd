import { useEffect, useState } from "react";
import ShowCat from "./ShowCat";

const ShopByCategory = () => {

    const [cats, setCats] = useState([])

    useEffect(() => {
        fetch('/sub-categories.json')
            .then(res => res.json())
            .then(data => setCats(data))
    }, [])

    return (
        <>
            <div className="pt-20 pb-10 shadow-md px-10">
                <h1 className="text-4xl text-center font-semibold py-10 bg-black text-white text-opacity-80">
                    SHOP BY
                    <br></br>
                    <span className="text-6xl border-b-2 border-white font-extrabold">CATEGORY</span>
                </h1>
                <div className="pt-10 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 gap-y-16">
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