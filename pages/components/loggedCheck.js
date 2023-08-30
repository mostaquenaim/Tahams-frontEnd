import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoggedCheck () {

  const router = useRouter();

  useEffect(() => {
    const session = sessionStorage.getItem('email');
    console.log(session)

    if (session) {
      router.push('/deliveryman/updateProfile');
    }
    
  }, []);

  return null;
};

