import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoggedCheck() {

  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('email');
    // console.log(session)

    if (session) {
      router.push('dashboard');
    }

  }, []);

  return null;
};

