import useAxiosPublic from '/Hooks/useAxiosPublic';
import PaymentInfo from '/components/Cart/PaymentInfo';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { useRouter } from 'next/router';
import Head from 'next/head';

import Swal from 'sweetalert2'; // make sure it's installed
import toast from 'react-hot-toast';

const PaymentProcess = () => {
  const { user, loading } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [buyingHistory, setBuyingHistory] = useState();
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    const fetchHistory = async () => {
      const email =
        user?.email ||
        JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email;

      if (!email) throw new Error('No email found for the user or guest');

      const result = await axiosPublic.get(
        `/admin/get-buying-history-by-token/${token}?email=${email}`,
      );

      setBuyingHistory(result.data);
      handleAddressUpdateCheck(); // 👈 trigger after data load
    };

    if (token && (user || localStorage.getItem('guestCustomerInfo'))) {
      fetchHistory();
    }
  }, [user?.email, router.query]);

  // 👇 New helper: silently check and update user address if needed
  const handleAddressUpdateCheck = async () => {
    try {
      const savedAddress = JSON.parse(localStorage.getItem('userAddress'));

      if (!savedAddress) return;

      toast.loading('Updating your default address...', { id: 'addr-update' });

      await axiosPublic.put(`admin/update-user-address/${savedAddress.id}`, {
        name: savedAddress.fullName,
        region: savedAddress.region,
        city: savedAddress.city,
        address: savedAddress.address,
      });

      localStorage.removeItem('userAddress');

      toast.success('Your default info has been updated.', {
        id: 'addr-update',
      });
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error('Failed to update address. Try again later.');
    }
  };

  // UI section remains same
  return (
    <div className="min-h-screen">
      <Head>
        <title>Confirm Order</title>
      </Head>
      <div className="pt-40 lg:pt-56 min-h-screen">
        {loading ? (
          <span className="loading loading-spinner loading-md"></span>
        ) : (
          <PaymentInfo history={buyingHistory} />
        )}
      </div>
    </div>
  );
};

export default PaymentProcess;
