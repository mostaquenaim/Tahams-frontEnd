import BuyingAddress from "/components/Cart/BuyingAddress";
import FinalCart from "/components/Cart/FinalCart";
import Footer from "/components/Footer/Footer";
import NavbarCompTwo from "/components/Header/NavbarComp";

const BuyNow = ({ product }) => {
    console.log(product, "4");

    return (
        <>
            <NavbarCompTwo />
            <div className="min-h-screen pt-48">
                <BuyingAddress />
                <FinalCart />
            </div>
            <Footer />
        </>
    );
};

export async function getServerSideProps(context) {
    const { params } = context;
    const { productId } = params;
    console.log(productId, "16");

    try {
        const response = await fetch(`http://api.tahamsbd.com/admin/getProductById/${productId}`);
        const product = await response.json();

        return {
            props: {
                product,
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

export default BuyNow;
