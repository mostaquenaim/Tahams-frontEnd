import axios from "axios";
import { useEffect, useState } from "react";
import CartButton from "../Buttons/CartButton";
import { FaCartShopping } from "react-icons/fa6";

const ShowProduct = ({ item }) => {
    const [ftImage, setFtImage] = useState('https://static-01.daraz.com.bd/p/13e6157acd98dfb45b8f2c9de90fe6bd.jpg')

    const { sellingPrice, discountPercentage, id, filename, ifStock } = item
    const discountedPrice = sellingPrice * (100 - discountPercentage) / 100

    const image = `http://localhost:3000/admin/get-ft-photo-by-product-id/${id}`

    useEffect(() => {
        axios.get(image)
            .then(res => {
                setFtImage(res.data.filename)
            })
    }, [])

    return (
        <>
            <div className="flex flex-col items-center py-7 border-r-2 border-b-2 rounded-lg bg-base-100 shadow-md">
                <figure className="relative">
                    <img src={`http://localhost:3000/admin/getImage/${filename}`} alt={item.name} />
                    {
                        !ifStock &&
                        <img src="/out-of-stock.png" className="absolute top-0 left-0 w-48"></img>
                    }
                </figure>
                <div className="flex flex-col items-center text-center justify-center gap-3">
                    <h2 className="card-title">{item.name}</h2>
                    <div className="flex gap-3">
                        {
                            discountPercentage > 0 &&
                            <p className="line-through text-red-500">{sellingPrice} BDT</p>
                        }
                        <p className="text-neutral">{discountedPrice} BDT</p>
                    </div>
                    <div className="card-actions justify-end">
                        {/* <button className="btn btn-primary">Buy Now</button> */}
                        <button className="btn btn-sm btn-primary hover:opacity-70">
                            <FaCartShopping></FaCartShopping> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShowProduct;