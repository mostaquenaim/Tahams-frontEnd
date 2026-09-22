import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import useWish from '../../Hooks/useWish';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { getGuestCustomerInfo } from '../../utils/guestCustomer';
import { DeleteFromWish } from '../../utils/WishFunctions';
import { formatBDT, unitPrice } from '../../utils/pricing';
import {
  PageShell,
  PageHeader,
  EmptyState,
  SkeletonGrid,
  imageUrl,
} from '../../components/Storefront/StorefrontUI';

const WishList = () => {
  const [isPending, wish, refetch] = useWish();
  const [removingId, setRemovingId] = useState(null);
  const { user, loading } = useContext(AuthContext);
  const [customEmail, setCustomEmail] = useState('');

  useEffect(() => {
    if (!loading) {
      setCustomEmail(user ? user.email : getGuestCustomerInfo().email);
    }
  }, [loading, user]);

  const handleDelete = async (item) => {
    setRemovingId(item.id);
    try {
      await DeleteFromWish(item.product, customEmail, item.id, refetch);
    } finally {
      setRemovingId(null);
    }
  };

  const count = wish?.length || 0;

  return (
    <>
      <Head>
        <title>Wishlist - Tahams</title>
      </Head>
      <PageShell tone="muted">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            eyebrow="Saved for later"
            title="Your wishlist"
            subtitle={
              !isPending && count > 0
                ? `${count} item${count === 1 ? '' : 's'} you've saved.`
                : undefined
            }
          />

          <div className="mt-8">
            {isPending ? (
              <SkeletonGrid count={4} />
            ) : count > 0 ? (
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
                {wish.map((item) => {
                  const href = `/products/details/${item.product.productId}`;
                  const price = Math.ceil(unitPrice(item.product));
                  const hasDiscount = Number(item.product.discountPercentage) > 0;
                  const isRemoving = removingId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <Link href={href} className="block">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                          <img
                            src={imageUrl(item.product.filename)}
                            alt={item.product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      </Link>
                      <div className="p-3 sm:p-4">
                        <Link href={href}>
                          <h2 className="line-clamp-1 text-sm font-medium text-gray-900 hover:underline sm:text-base">
                            {item.product.name}
                          </h2>
                        </Link>
                        <p className="mt-1 flex items-baseline gap-2">
                          <span className="font-semibold text-gray-900">
                            {formatBDT(price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatBDT(item.product.sellingPrice)}
                            </span>
                          )}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={href}
                            className="flex-1 rounded-lg bg-black py-2 text-center text-xs font-semibold text-white transition hover:bg-gray-800"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={isRemoving}
                            aria-label={`Remove ${item.product.name} from wishlist`}
                            className="rounded-lg border border-gray-200 px-3 text-gray-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                          >
                            {isRemoving ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <FiTrash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={FiHeart}
                title="Your wishlist is empty"
                message="Tap the heart on any product to save it here for later."
                actionHref="/"
                actionLabel="Start exploring"
              />
            )}
          </div>
        </div>
      </PageShell>
    </>
  );
};

export default WishList;
