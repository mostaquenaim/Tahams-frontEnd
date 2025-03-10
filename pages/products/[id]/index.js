import FetchProducts from '../../../components/Product/FetchProducts';

const Product = ({ categories }) => {
    console.log('categories',categories);
    return <FetchProducts categories={categories}/>
};

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/admin/get-product-by-sub-sub-cat/${id}`);
        const categories = await response.json();

        return {
            props: {
                categories,
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

export default Product;
