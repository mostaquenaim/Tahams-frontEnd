import { useContext, useEffect, useState } from 'react';
import useWish from '../../Hooks/useWish';
import Link from 'next/link';
import Head from 'next/head';
import { generateTempItems, pushToDataLayer } from '../../utils/ga4';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';
import { DeleteFromWish } from '../../utils/WishFunctions';

const WishList = () => {
  const [isPending, wish, refetch] = useWish();
  // console.log(wish,'wish');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, loading } = useContext(AuthContext);
  const [customEmail, setCustomEmail] = useState('');

  // set custom email
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // console.log('ekhane dhukse');
        const guestCustomerInfo = getGuestCustomerInfo();
        setCustomEmail(guestCustomerInfo.email);
      } else {
        // console.log('acheee');
        setCustomEmail(user?.email);
      }
    }
  }, [loading, user]);

  const handleDelete = async (item) => {
    DeleteFromWish(item.product, customEmail, item.id, refetch);
  };

  return (
    <>
      <Head>
        <title>Wishlist - Tahams </title>
      </Head>
      <div className="container mx-auto p-4 min-h-screen md:p-6 lg:p-8 xl:p-10">
        <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-4 lg:pt-40 pt-16 flex text-center items-center justify-center">
          Your Wishlist
        </h1>
        {isPending ? (
          <span className="loading loading-spinner loading-md"></span>
        ) : wish && wish.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wish.map((item) => (
              <div key={item.id} className="bg-white rounded shadow-md p-4">
                <Link
                  href={`products/details/${item.product.productId}`}
                  className="transition duration-300 hover:scale-105"
                >
                  <img
                    className="w-full h-40 object-cover rounded-t-md"
                    src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.product.filename}`}
                    alt={item.product.ProductName}
                  />
                </Link>
                <div className="p-4">
                  <Link
                    href={`products/details/${item.product.productId}`}
                    className="transition duration-300 hover:scale-105"
                  >
                    <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold">
                      {item.product.name}
                    </h2>
                    <p className="text-xs md:text-sm lg:text-base xl:text-lg">
                      {item.product.sellingPrice -
                        parseInt(
                          (item.product.sellingPrice *
                            item.product.discountPercentage) /
                            100,
                        ) +
                        parseInt(
                          item.product.sellingPrice *
                            item.product.vatPercentage,
                        )}{' '}
                      BDT
                    </p>
                  </Link>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No items in your wishlist.</p>
        )}
      </div>
    </>
  );
};

export default WishList;
