import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

// Admin-only (both call sites are under pages/admin) - sends the admin's
// backend JWT so the server can verify "is this really an admin" itself,
// rather than trusting an email in the query string.
const useCustomizationReq = (id = 0, isEnabled=true) => {
  const axiosSecure = useAxiosSecure();

  const loadCustomizations = async () => {
    try {
      const result = await axiosSecure.get(
        '/admin/get-all-customization-requests',
        {
          params: { id },
        }
      );

      let allCustomizations = result.data;

      if (Array.isArray(allCustomizations)) {
        allCustomizations = allCustomizations.sort((a, b) => {
          // First sort by isChecked (unchecked = first)
          if (a.isChecked !== b.isChecked) {
            return a.isChecked ? 1 : -1;
          }
          // Then sort by id (desc)
          return b.id - a.id;
        });
      }

      return allCustomizations;
    } catch (error) {
      console.error('Error loading customization requests:', error);
      return [];
    }
  };

  const {
    refetch,
    data: customizations = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['customizations', id],
    queryFn: loadCustomizations,
    enabled: isEnabled,
  });

  return [customizations, refetch, isLoading || isFetching];
};

export default useCustomizationReq;
