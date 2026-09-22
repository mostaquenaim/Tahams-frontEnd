import React, { useContext } from 'react';
import Head from 'next/head';
import { FiPackage } from 'react-icons/fi';
import useOrder from '../../Hooks/useOrder';
import useGuestOrders from '../../Hooks/useGuestOrders';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import ShowOrderComp from '../../components/Show/ShowOrderComp';
import {
  PageShell,
  PageHeader,
  EmptyState,
} from '../../components/Storefront/StorefrontUI';

const OrdersSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
    {[0, 1, 2].map((key) => (
      <div key={key} className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 flex gap-3">
          <div className="h-14 w-14 animate-pulse rounded-lg bg-gray-100" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="mt-6 h-10 animate-pulse rounded-xl bg-gray-100" />
      </div>
    ))}
  </div>
);

const ShowOrders = () => {
  const { user, loading } = useContext(AuthContext);
  const [accountOrders] = useOrder(1, 10, !loading && !!user, true);
  const [guestOrders, isGuestOrdersLoading] = useGuestOrders(!loading && !user);

  const orders = user ? accountOrders : guestOrders;
  const isLoading = loading || (!user && isGuestOrdersLoading);

  // Group orders by history ID
  const groupedOrders = (orders || []).reduce((acc, order) => {
    const key = order.history?.id;
    if (!acc[key]) {
      acc[key] = {
        history: order.history,
        orders: [],
        totalPrice: 0,
        deliveryFee: order.history?.deliveryFee || 0,
        customer: order.customer,
      };
    }
    acc[key].orders.push(order);
    acc[key].totalPrice += order.totalPrice;
    return acc;
  }, {});

  const groups = Object.values(groupedOrders);

  return (
    <>
      <Head>
        <title>My Orders - Tahams</title>
      </Head>
      <PageShell tone="muted">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            eyebrow="Your account"
            title="My orders"
            subtitle={
              !isLoading && groups.length > 0
                ? `${groups.length} order${groups.length === 1 ? '' : 's'} placed.`
                : 'Track, review and manage everything you have ordered.'
            }
          />

          <div className="mt-8">
            {isLoading ? (
              <OrdersSkeleton />
            ) : groups.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group, index) => (
                  <ShowOrderComp
                    key={group.history?.trackingToken ?? index}
                    group={group}
                    idx={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FiPackage}
                title="No orders yet"
                message={
                  user
                    ? "When you place an order, you'll be able to follow it here."
                    : "Guest orders only show up in the browser you checked out in. If you're on a different device, use the confirmation link from your order instead."
                }
                actionHref="/"
                actionLabel="Start shopping"
              />
            )}
          </div>
        </div>
      </PageShell>
    </>
  );
};

export default ShowOrders;
