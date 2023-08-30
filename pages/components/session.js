import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Session() {
  const [email, setEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('email');
      if (session) {
        setEmail(session);
      }
    }
  }, []);

  const handleSignOut = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get('http://localhost:3000/users/signout');
      console.log(response.data);
      sessionStorage.removeItem('email');
      setEmail(null);
      router.push('/signin');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {email !== null ? (
        <>
          <a href="#">{email}</a>
          <button onClick={handleSignOut}>Sign out</button>
          <Link href="/deliveryman/productList">Dashboard</Link>
        </>
      ) : (
        <Link href="/signin">Sign in</Link>
      )}
    </>
  );
}