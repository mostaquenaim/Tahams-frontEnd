import { useEffect, useState } from 'react';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import ShowProduct from './ShowProduct';
import Loading from '../Loading';

const PeopleAlsoLike = ({ category, currentProductId }) => {
    const axiosPublic = useAxiosPublic();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // console.log(category,"cat pro",currentProductId);
        const fetchRelatedProducts = async () => {
            try {
                const res = await axiosPublic.get(`admin/related-products?category=${category}&exclude=${currentProductId}`);
                setProducts(res.data || []);
                console.log('res', res.data);
            } catch (error) {
                console.error('Error fetching related products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (category) fetchRelatedProducts();
    }, [category, currentProductId]);

    return (
        <div className="my-10 px-4">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">You May Also Like</h2>

            {loading ? (
                <Loading/>
            ) : products.length === 0 ? (
                <p>No suggestions found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {products.length > 0 &&
                        products.map((product) => (
                            <ShowProduct item={product} />
                        ))}
                </div>
            )}
        </div>
    );
};

export default PeopleAlsoLike;
