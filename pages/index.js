import { useEffect } from 'react';
import { useRouter } from 'next/router';
import IndexCheck from './components';

export default function Home () {

  // const router = useRouter();

  // useEffect(() => {
  //     router.push('/deliveryman/login');
  // }, []);

  return(
    <>
    <IndexCheck/>
    </>
  )
  
}

