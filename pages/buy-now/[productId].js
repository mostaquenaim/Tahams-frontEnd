import BuyingAddress from "/components/Cart/BuyingAddress";
import FinalCart from "/components/Cart/FinalCart";

const BuyNow = () => {
    // console.log(product, "4");

    return (
        <>
            {/* <NavbarCompTwo /> */}
            <div className="min-h-screen pt-48">
                <BuyingAddress />
                <FinalCart />
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default BuyNow;
