import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SessionCheck () {

  const router = useRouter();

  useEffect(() => {
    const session = sessionStorage.getItem('email');
    console.log(session)

    if (!session) {
      router.push('/deliveryman/login');
    }
    
  }, []);

  return null;
};

