import axios from "axios";
import NavbarCompTwo from "../../components/Header/NavbarComp";
import Footer from "../../components/Footer/Footer";
import FetchProducts from "../../components/Product/FetchProducts";

const ShowProductsByCategory = ({ products }) => {
  return (
    <div>
      <FetchProducts categories={products} />
    </div>
  );
};

export async function getServerSideProps(context) {
  const { catName } = context.query;

  try {
    // Fetch products based on the category name from your backend
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/admin/get-product-by-cat/${catName}`);
    let products = await response.data;

    // Sort the products by their names
    products = products.sort((a, b) => a.name.localeCompare(b.name));

    return {
      props: {
        products,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);

    return {
      props: {
        products: [],
      },
    };
  }
}

export default ShowProductsByCategory;
