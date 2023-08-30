import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function IndexCheck () {

  const router = useRouter();

  useEffect(() => {
    const session = sessionStorage.getItem('email');
    console.log(session)

    if (session) {
      router.push('/admin/dashboard');
    }
    else{
      router.push('/admin/sign-in');
    }
    
  }, []);

  return null;
};

