import { AuthContext } from '/Contexts/Auth/AuthProvider';
import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { useContext, useState, useEffect } from 'react';
import { getGuestCustomerInfo } from '/utils/guestCustomer';

const useCustomizationReq = (id = 0) => {
    // console.log(id,'iding');
  const { user, loading } = useContext(AuthContext);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    setCustomerEmail(user?.email || getGuestCustomerInfo().email);
  }, [user]);

  const axiosPublic = useAxiosPublic();

  const loadCustomizations = async () => {
    // console.log(customerEmail, id, 'gibgib');  // Correcting to use customerEmail
    try {
      const result = await axiosPublic.get('/admin/get-all-customization-requests', {
        params: { email: customerEmail, id: id }, // Use params for GET requests
      });

      console.log(result.data, 'sdvsdaaa');

      const sortedCustomizations = result.data;
      // If you need to sort by serial (optional)
      // const sortedCustomizations = result.data.sort((a, b) => a.serial - b.serial);

      return sortedCustomizations;
    } catch (error) {
      console.error('Error loading customization requests:', error);
      return [];
    }
  };

  // Only run the query when `customerEmail` is set
  const { refetch, data: customizations = [], isLoading, isFetching } = useQuery({
    queryKey: ['customizations', customerEmail, id], // Add dependencies to re-fetch when needed
    queryFn: loadCustomizations,
    enabled: !!customerEmail, // Don't run the query until the email is set
  });

  return [customizations, refetch, isLoading || isFetching];
};

export default useCustomizationReq;
