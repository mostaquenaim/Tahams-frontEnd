import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

// Checkout details owned by the backend (it is the only copy, and it checks
// every order against them). Never fall back to numbers or fees written in
// the storefront: a wrong fallback would show customers a price or an
// account number that is no longer true.

// Active payment methods, in display order:
// [{ id, name, icon, instructions, accountNumber, payOnline }]
export const usePaymentMethods = () => {
  const axiosPublic = useAxiosPublic();
  return useQuery({
    queryKey: ['checkout', 'paymentMethods'],
    queryFn: async () => {
      const res = await axiosPublic.get('/admin/checkout/payment-methods');
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 60 * 1000,
  });
};

// { fees: { dhakaCity, aroundDhaka, outsideDhaka, other },
//   dhakaAreas: { dhakaCity: [], aroundDhaka: [], outsideDhaka: [] } }
export const useDeliveryFees = () => {
  const axiosPublic = useAxiosPublic();
  return useQuery({
    queryKey: ['checkout', 'deliveryFees'],
    queryFn: async () => {
      const res = await axiosPublic.get('/admin/checkout/delivery-fees');
      const data = res.data;
      // A malformed answer must look like a failure, not like "free".
      const fees = data?.fees;
      const ok =
        fees &&
        ['dhakaCity', 'aroundDhaka', 'outsideDhaka', 'other'].every(
          (key) => Number.isFinite(fees[key]) && fees[key] >= 0,
        ) &&
        ['dhakaCity', 'aroundDhaka', 'outsideDhaka'].every((key) =>
          Array.isArray(data?.dhakaAreas?.[key]),
        );
      if (!ok) throw new Error('Unexpected delivery fee data');
      return data;
    },
    staleTime: 60 * 1000,
    retry: 2,
  });
};
