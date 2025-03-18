import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BuyingAddress from "/components/Cart/BuyingAddress";
import FinalCart from "/components/Cart/FinalCart";
import DeliveryFeeProvider from "../../Contexts/DeliveryFee";
import Head from "next/head";

const BuyNow = ({ data }) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    // Get the cart products from localStorage
    const cartProducts = JSON.parse(localStorage.getItem("selectedItems"));
    setCartItems(cartProducts)
  }, []);

  // const total = router.query.total;

  return (
    <div>
      <Head>
        <title>Purchase Product</title>
      </Head>
      <div className="pt-20 lg:pt-48 flex flex-col md:flex-row justify-around items-start container mx-auto">
        <DeliveryFeeProvider>
            <BuyingAddress data={data} />
            <FinalCart cartItems={cartItems} />
        </DeliveryFeeProvider>
      </div>
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
