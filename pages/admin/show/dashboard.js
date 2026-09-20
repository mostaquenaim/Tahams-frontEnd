import { useEffect } from 'react';
import { useRouter } from 'next/router';

// The dashboard lives at /admin.
const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return null;
};

export default Dashboard;
