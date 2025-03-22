import Head from 'next/head';
import FetchProducts from '../../../components/Product/FetchProducts';
import { useEffect } from 'react';
import useLoadProductsByCat from '/Hooks/useLoadProductsByCat';
import useLoadProductName from '/Hooks/useLoadProductName';
import { useRouter } from 'next/router';
import Loading from '/components/Loading';

const Product = () => {
    const router = useRouter();
    const getidfromurl = router.query.id; // Extract ID from the URL

    const [productsByCat, isPending] = useLoadProductsByCat(getidfromurl);
    const [productNameByCat] = useLoadProductName(getidfromurl);

    return (
        <>
            <Head>
                <title>{productNameByCat.name}</title>
            </Head>
            <FetchProducts categories={productsByCat} isLoading={isPending} />
        </>
    );
};

export default Product;