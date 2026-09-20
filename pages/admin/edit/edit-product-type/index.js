import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Product types are edited from the list page.
const EditProductType = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/show/product-type');
  }, [router]);

  return null;
};

export default EditProductType;
