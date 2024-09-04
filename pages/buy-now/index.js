import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BuyingAddress from "/components/Cart/BuyingAddress";
import NavbarCompTwo from "/components/Header/NavbarComp";
import Footer from "/components/Footer/Footer";
import FinalCart from "/components/Cart/FinalCart";
import DeliveryFeeProvider from "../../Contexts/DeliveryFee";

const BuyNow = ({ data }) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    // Get the cart products from localStorage
    const cartProducts = JSON.parse(localStorage.getItem("selectedItems"));

    // console.log(cartProducts);
    setCartItems(cartProducts)
  }, []);

  const total = router.query.total;

  return (
    <div>
      {/* <NavbarCompTwo /> */}
      <div className="pt-48 flex justify-around items-start container mx-auto">
        <DeliveryFeeProvider>
          <BuyingAddress data={data} />
          {/* {
          cartItems.length > 0 &&
        } */}
          <FinalCart cartItems={cartItems} />
        </DeliveryFeeProvider>
      </div>
      <Footer />
    </div>
  );
};

export default BuyNow;

export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_LOCATION}?countryCode=BD`);
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}
