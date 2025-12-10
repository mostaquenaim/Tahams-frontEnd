import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { useContext, useState, useEffect } from 'react';
import { getGuestCustomerInfo } from '/utils/guestCustomer';

const useCustomizationReq = (id = 0, isEnabled=true) => {
  const { user } = useContext(AuthContext);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    setCustomerEmail(user?.email || getGuestCustomerInfo().email);
  }, [user]);

  const axiosPublic = useAxiosPublic();

  const loadCustomizations = async () => {
    try {
      const result = await axiosPublic.get(
        '/admin/get-all-customization-requests',
        {
          params: { email: customerEmail, id: id },
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
    queryKey: ['customizations', customerEmail, id],
    queryFn: loadCustomizations,
    enabled: !!customerEmail && isEnabled,
  });

  return [customizations, refetch, isLoading || isFetching];
};

export default useCustomizationReq;
