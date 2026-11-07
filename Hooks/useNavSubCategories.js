import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

const NAV_STALE_TIME = 5 * 60 * 1000;

// Enabled sub-categories of a category (navigation menus).
export const useNavSubCategories = (catId, enabled = true) => {
  const axiosPublic = useAxiosPublic();

  const { data = [], isPending, isError } = useQuery({
    queryKey: ['navSubCategories', catId],
    queryFn: async () => {
      const res = await axiosPublic.get(`/admin/view-product-sub-category/${catId}`);
      return (Array.isArray(res.data) ? res.data : []).filter(
        (item) => item.isDisabled === false,
      );
    },
    enabled: enabled && catId != null,
    staleTime: NAV_STALE_TIME,
  });

  return { subCategories: data, isPending, isError };
};

// Sub-sub-categories of a sub-category, grouped the same way as the desktop
// mega menu (ListListComponent): non-printed sorted by name, printed separate.
export const useNavSubSubCategories = (subId, enabled = true) => {
  const axiosPublic = useAxiosPublic();

  const { data, isPending, isError } = useQuery({
    queryKey: ['navSubSubCategories', subId],
    queryFn: async () => {
      const res = await axiosPublic.get(`/admin/view-product-sub-sub-category/${subId}`);
      const all = Array.isArray(res.data) ? res.data : [];
      const isPrinted = (item) => (item.name || '').toLowerCase().includes('printed');
      return {
        printed: all.filter(isPrinted),
        regular: all
          .filter((item) => !isPrinted(item))
          .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      };
    },
    enabled: enabled && subId != null,
    staleTime: NAV_STALE_TIME,
  });

  return {
    printed: data ? data.printed : [],
    regular: data ? data.regular : [],
    isPending,
    isError,
  };
};
