// Import necessary dependencies and components
import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '/firebase'
import { useRouter } from 'next/router';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { mergeGuestCartIntoAccount } from '../../utils/guestCustomer';
import toast from 'react-hot-toast';
import Head from 'next/head';
import AuthCard from '/components/Auth/AuthCard';
import { Field, inputClass, buttonPrimary, buttonSecondary } from '/components/Storefront/StorefrontUI';

const provider = new GoogleAuthProvider();

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { user, signIn, logOut, setBackendEmail } = useContext(AuthContext)
    // console.log(user, "17");
    const router = useRouter()

    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        if (user) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const isAdmin = userInfo?.role === 'admin'; // Adjust this field name if needed
          // console.log('isAdmin',isAdmin);

            if (isAdmin) {
                router.push('/admin');
            }
            else {
                router.push('/');
            }
        }
    }, [user]);

    const storeSession = async (sessionData) => {
        toast.success('Logged in');
        localStorage.setItem('access_token', sessionData.access_token)
        localStorage.setItem('userInfo', JSON.stringify(sessionData.data));
        localStorage.setItem('email', sessionData.data.email);
        setBackendEmail(sessionData.data.email);
        await mergeGuestCartIntoAccount(axiosPublic, sessionData.data.email);
    };

    const onsubmit = async (data) => {
        // 1. Try this backend's own password check first. Admin accounts
        // (created via scripts/seed-admin.ts) only ever exist here, never
        // in Firebase, since the admin panel is gated purely by this
        // backend's JWT - so this is the only path that can ever log them
        // in at all.
        try {
            const response = await axiosPublic.post('/admin/signin', {
                email: data.email,
                password: data.password,
            });

            if (response.data.status >= 200 && response.data.status <= 205) {
                const loggedInUser = response.data.data;

                if (loggedInUser.role === 'admin') {
                    await storeSession(response.data);
                    router.push('/admin');
                    return;
                }

                // A customer account: also sign in to Firebase with the
                // same password so the rest of the storefront (cart,
                // wishlist, order ownership - all keyed off Firebase's auth
                // state) recognizes this session too.
                try {
                    await signIn(data.email, data.password);
                    await storeSession(response.data);
                    return;
                } catch (firebaseError) {
                    // Backend password matched but Firebase didn't - most
                    // likely this password was reset via Firebase's
                    // forgot-password flow and this backend's copy is now
                    // stale. Fall through to the Firebase-first path below
                    // instead of failing the login outright.
                    console.error('Firebase error after backend match:', firebaseError.message);
                }
            }
        } catch (error) {
            console.error('Backend sign-in error, trying Firebase next:', error.message);
        }

        // 2. Firebase-first fallback - covers a customer whose Firebase
        // password no longer matches this backend's (stale) copy, e.g.
        // after a Firebase forgot-password reset. Firebase is the actual
        // password check here; this backend only exchanges the verified ID
        // token for our JWT (see AdminService.firebaseSignIn) and never
        // sees the password itself.
        try {
            const userCredential = await signIn(data.email, data.password);
            const idToken = await userCredential.user.getIdToken();

            const response = await axiosPublic.post(
                '/admin/firebase-signin',
                {},
                { headers: { Authorization: `Bearer ${idToken}` } },
            );

            if (response.data.status >= 200 && response.data.status <= 205) {
                await storeSession(response.data);
            } else {
                toast.error(response.data.message || "Invalid email or password");
            }
        } catch (error) {
            console.error("Firebase sign-in failed:", error.message);
            toast.error("Invalid email or password");
        }
    }

    // Google login - the backend verifies our Firebase ID token itself and
    // finds-or-creates the account from the VERIFIED email, so there's no
    // client-supplied email/password step here at all (that used to be
    // spoofable - any known email could be signed into via a leaked/public
    // secret, with no real Google identity check on the backend side).
    //
    // Must stay a popup: signInWithRedirect silently returns no result when
    // the site's origin differs from Firebase's authDomain
    // (tahams-bd.firebaseapp.com), because browsers partition the storage
    // the redirect hand-off depends on.
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const response = await axiosPublic.post(
                '/admin/google-signin',
                {},
                { headers: { Authorization: `Bearer ${idToken}` } },
            );

            if (response.data.status >= 200 && response.data.status <= 205) {
                await storeSession(response.data);
                router.push(response.data.data.role === 'admin' ? '/admin' : '/dashboard');
            } else {
                toast.error(response.data.message || "Google sign-in failed");
                await logOut();
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error.message);
            toast.error("Google sign-in failed. Please try again.");
        }
    }

    // toggle password show 
    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <>
            <Head>
                <title>Login - Tahams</title>
            </Head>
            <AuthCard
                title="Welcome back"
                subtitle="Log in to track orders and check out faster."
                footer={
                    <>
                        New to Tahams?{' '}
                        <Link href="/register" className="font-semibold text-black underline-offset-2 hover:underline">
                            Create an account
                        </Link>
                    </>
                }
            >
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className={buttonSecondary + ' w-full'}
                >
                    <FcGoogle className="text-xl" /> Continue with Google
                </button>

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-gray-400">
                    <span className="h-px flex-1 bg-gray-200" />
                    or
                    <span className="h-px flex-1 bg-gray-200" />
                </div>

                <form onSubmit={handleSubmit(onsubmit)} className="space-y-4" noValidate>
                    <Field label="Email" icon={FiMail} error={errors.email?.message}>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ required: 'Email is required' }}
                            render={({ field }) => (
                                <input {...field} type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />
                            )}
                        />
                    </Field>

                    <Field
                        label="Password"
                        icon={FiLock}
                        error={errors.password?.message}
                        right={
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        }
                    >
                        <Controller
                            name="password"
                            control={control}
                            rules={{ required: 'Password is required' }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className={inputClass + ' pr-10'}
                                />
                            )}
                        />
                    </Field>

                    <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-black hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" disabled={isSubmitting} className={buttonPrimary + ' w-full'}>
                        {isSubmitting ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
            </AuthCard>
        </>
    );
};

export default Login;
