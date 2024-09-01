import axios from "axios";
import NavbarCompTwo from "../../components/Header/NavbarComp";
import Footer from "../../components/Footer/Footer";
import FetchProducts from "../../components/Product/FetchProducts";

const ShowProductsByCategory = ({ products }) => {
  // console.log(products);
  return (
    <div>
      <FetchProducts categories={products}/>
    </div>
  );
};

export async function getServerSideProps(context) {
  // Get the category name from the query parameters
  const { catName } = context.query;
  // console.log(catName,"16");

  try {
    // Fetch products based on the category name from your backend
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/admin/get-product-by-cat/${catName}`);
    const products = await response.data;
    // console.log(products,"23");

    // Pass the fetched products as props to the component
    return {
      props: {
        products,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);

    // If an error occurs during fetching, you can handle it here
    return {
      props: {
        products: [],
      },
    };
  }
}

export default ShowProductsByCategory;
