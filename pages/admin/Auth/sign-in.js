import { useEffect } from 'react'
import { useRouter } from 'next/router';
import Head from 'next/head';

// This used to be a second, separate admin login form that duplicated
// (and had drifted out of sync with) the real login flow at /login - it
// never checked the sign-in response's status, so it treated ANY submitted
// password as a successful login, and it never stored an access_token, so
// nothing authenticated actually worked afterward anyway. /login already
// implements the correct flow (checks status, stores the token, redirects
// admins to /admin) and stays as the single source of truth for login.
export default function AdminSignIn() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <>
            <Head>
                <title>Sign in Auth</title>
            </Head>
        </>
    )
}
