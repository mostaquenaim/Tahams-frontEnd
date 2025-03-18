import axios from "axios";
import FetchProducts from "../../components/Product/FetchProducts";
import { useRouter } from "next/router";
import Head from "next/head";

const ShowProductsByCategory = ({ products }) => {
  const router = useRouter()
  const catname = router.query.catName

  return (
    <div>
      <Head>
        <title>{catname} - Tahams</title>
      </Head>
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
