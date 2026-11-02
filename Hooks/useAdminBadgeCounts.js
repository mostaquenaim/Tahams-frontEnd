import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

export const ADMIN_BADGE_COUNTS_KEY = ['adminBadgeCounts'];

const EMPTY_COUNTS = {
  newOrders: 0,
  newCustomizations: 0,
  pendingRequests: 0,
};

// Polling is the only way new orders show up without a socket, so keep it
// slow: one tiny COUNT request a minute, and only while the tab is visible
// (react-query pauses refetchInterval for hidden tabs).
const POLL_MS = 60 * 1000;
// Navigating between admin pages refreshes the counts, but not more often
// than this, so clicking through the sidebar doesn't fire a request per page.
const NAV_REFRESH_MIN_MS = 10 * 1000;

// Call after an admin action that changes a count (checking an order or
// customization request, approving a cancel/return request) so the badges
// update immediately instead of on the next poll.
export const refreshAdminBadges = (queryClient) =>
  queryClient.invalidateQueries({ queryKey: ADMIN_BADGE_COUNTS_KEY });

/**
 * Counts of admin work waiting to be looked at, for the sidebar and tab
 * badges: { newOrders, newCustomizations, pendingRequests }. All callers
 * share one cached query, so using it in several components costs one
 * request. Only call it inside admin pages (after AdminCheck).
 */
const useAdminBadgeCounts = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data = EMPTY_COUNTS } = useQuery({
    queryKey: ADMIN_BADGE_COUNTS_KEY,
    // Sends the token by hand rather than through useAxiosSecure: that
    // instance logs the admin out on a 401, and a background poll firing
    // after the token expires shouldn't yank them off the page they're on.
    queryFn: async () => {
      const res = await axiosPublic.get('/admin/badge-counts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      return { ...EMPTY_COUNTS, ...res.data };
    },
    staleTime: 15 * 1000,
    // Stop polling once the session is rejected; it won't start working
    // again until the admin logs in, which remounts everything anyway.
    refetchInterval: (query) => {
      const status = query.state.error?.response?.status;
      return status === 401 || status === 403 ? false : POLL_MS;
    },
    retry: 1,
  });

  useEffect(() => {
    // Every component using this hook registers a listener; the fetchStatus
    // check means only the first one to run actually refetches.
    const onRouteChange = () => {
      const state = queryClient.getQueryState(ADMIN_BADGE_COUNTS_KEY);
      if (
        state?.fetchStatus !== 'fetching' &&
        Date.now() - (state?.dataUpdatedAt || 0) > NAV_REFRESH_MIN_MS
      ) {
        refreshAdminBadges(queryClient);
      }
    };

    router.events.on('routeChangeComplete', onRouteChange);
    return () => router.events.off('routeChangeComplete', onRouteChange);
  }, [router.events, queryClient]);

  return data;
};

export default useAdminBadgeCounts;
