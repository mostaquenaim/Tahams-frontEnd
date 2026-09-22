import { useEffect, useState } from 'react';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import ShowProduct from './ShowProduct';
import { SkeletonGrid } from '../Storefront/StorefrontUI';

const PeopleAlsoLike = ({ category, currentProductId }) => {
  const axiosPublic = useAxiosPublic();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await axiosPublic.get(
          `admin/related-products?category=${category}&exclude=${currentProductId}`,
        );
        setProducts(res.data || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) fetchRelatedProducts();
  }, [category, currentProductId]);

  // Nothing to suggest is better than an apologetic empty section.
  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-gray-900">
        You may also like
      </h2>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ShowProduct key={product.id} item={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default PeopleAlsoLike;
