import { apiGet } from "/utils/staticFetch";
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

// Category listings are the same for every visitor: cache each one and
// rebuild it in the background at most every 60s. Prices shown here can be
// up to ~60s old.
const CATEGORY_REVALIDATE_SECONDS = 60;

// Don't prebuild anything at build time: each category page is generated on
// its first visit, then served from cache.
export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { catName } = params;

  try {
    const data = await apiGet(
      `/admin/get-product-by-cat/${encodeURIComponent(catName)}`,
    );
    // Sort the products by their names
    const products = (Array.isArray(data) ? data : []).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      props: { products },
      revalidate: CATEGORY_REVALIDATE_SECONDS,
    };
  } catch (error) {
    console.error('Error fetching products:', error.message);
    // Throwing keeps the last good copy of this category page online.
    throw error;
  }
}

export default ShowProductsByCategory;
