import Head from 'next/head';
import FetchProducts from '../../../components/Product/FetchProducts';

const Product = ({ cat, categories }) => {
    return (
        <>
            <Head>
                <title>{cat}</title>
            </Head>
            <FetchProducts categories={categories} />
        </>
    )
};

export async function getServerSideProps(context) {
    const { params } = context;
    const { id } = params;

    try {
        const response1 = await fetch(`${process.env.NEXT_PUBLIC_API}/admin/get-sub-sub-cat-by-id/${id}`);
        const cat = await response1.json();

        const response2 = await fetch(`${process.env.NEXT_PUBLIC_API}/admin/get-product-by-sub-sub-cat/${id}`);
        const categories = await response2.json();

        return {
            props: {
                cat: cat.name,
                categories
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