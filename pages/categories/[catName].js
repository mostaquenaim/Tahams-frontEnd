import axios from "axios";

const ShowProductsByCategory = ({ products }) => {
  // Render your component using the fetched products
  return (
    <div>
      {products && products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};

export async function getServerSideProps(context) {
  // Get the category name from the query parameters
  const { catName } = context.query;
  console.log(catName,"16");

  try {
    // Fetch products based on the category name from your backend
    const response = await axios.get(`http://api.tahamsbd.com/admin/get-product-by-cat/${catName}`);
    const products = await response.data;
    console.log(products,"23");

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
