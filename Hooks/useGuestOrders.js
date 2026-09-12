import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';
import { getGuestCustomerInfo, getGuestOrderTokens } from '../utils/guestCustomer';

// Guests have no Firebase session to prove ownership of an email, so unlike
// useOrder.js this can't ask the backend for "every order for this email" -
// that endpoint deliberately rejects unverified callers (see
// admin.service.ts's getAllBuyingHistories comments on the IDOR it used to
// have). Instead this fetches, one by one, every order this browser knows
// it placed (tracking token remembered in localStorage by
// addGuestOrderToken), the same lookup /my-orders/details/[token] already
// uses - so it's exactly as safe, just aggregated into a list.
const useGuestOrders = (enabled = true) => {
  const axiosPublic = useAxiosPublic();

  const fetchGuestOrders = async () => {
    const email = getGuestCustomerInfo()?.email;
    const tokens = getGuestOrderTokens();
    if (!email || tokens.length === 0) return [];

    const results = await Promise.allSettled(
      tokens.map((token) =>
        axiosPublic.get(`/admin/get-buying-history-by-token/${token}`, {
          params: { email },
        }),
      ),
    );

    return results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value.data ?? []);
  };

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['guestOrders'],
    queryFn: fetchGuestOrders,
    enabled,
  });

  return [orders, isLoading, refetch];
};

export default useGuestOrders;
