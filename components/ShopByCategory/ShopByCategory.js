import ShowCat from "./ShowCat";
import Heading from "../Header/Heading";
import cats from "/public/categories.json";

const ShopByCategory = () => {
    return (
        <>
            <div className="pt-20 md:pt-16 lg:pt-10 pb-10 shadow-md px-2 space-y-8 py-12 sm:px-4 lg:px-8 max-w-7xl mx-auto">
                <Heading first="Shop by" second="CATEGORY"></Heading>
                <div className="pt-4 md:pt-8 lg:pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-center">
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