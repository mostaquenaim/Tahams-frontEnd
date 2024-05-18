import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BuyingAddress from "/components/Cart/BuyingAddress";
import NavbarCompTwo from "/components/Header/NavbarComp";
import Footer from "/components/Footer/Footer";
import FinalCart from "/components/Cart/FinalCart";
import PaymentInfo from "/components/Cart/PaymentInfo";

const BuyNow = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    // Get the cart products from localStorage
    const cartProducts = JSON.parse(localStorage.getItem("selectedItems"));

    // Do something with the cart products
    console.log(cartProducts);
    setCartItems(cartProducts)

    // If you need to perform additional actions based on the cart products, you can do it here

    // Clear the selectedItems from localStorage if needed
    // localStorage.removeItem("selectedItems");
  }, []); // Empty dependency array ensures that this effect runs only once on component mount

  const total = router.query.total;

  return (
    <div>
      <NavbarCompTwo />
      <div className="pt-48 flex justify-around items-start container mx-auto">
        {/* <div > */}
        {/* <div> */}
        <BuyingAddress />
        {/* </div> */}
        {/* <div>
            <PaymentInfo />
          </div> */}
        {/* </div> */}
        <FinalCart cartItems={cartItems} />
      </div>
      <Footer />
    </div>
  );
};

export default BuyNow;
