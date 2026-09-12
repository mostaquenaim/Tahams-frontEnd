// Import necessary dependencies and components
import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '/Contexts/Auth/AuthProvider';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '/firebase'
import { useRouter } from 'next/router';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { mergeGuestCartIntoAccount } from '../../utils/guestCustomer';
import toast from 'react-hot-toast';
import Head from 'next/head';

const provider = new GoogleAuthProvider();

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm();
    const { user, signIn, logOut } = useContext(AuthContext)
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
                try {
                    const userCredential = await signIn(data.email, data.password);
                  // console.log('Firebase user logged in:', userCredential.user);
                    toast.success('Logged in');
                    // console.log(JSON.stringify(response.data.data));
                    localStorage.setItem('access_token', response.data.access_token)
                    localStorage.setItem('userInfo', JSON.stringify(response.data.data));
                    localStorage.setItem('email', response.data.data.email);
                } catch (firebaseError) {
                    console.error('Firebase error:', firebaseError.message);
                    toast.error(firebaseError.message);
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
    // Uses a full-page redirect rather than a popup: signInWithPopup relies
    // on the opener being able to inspect/close the popup window, which a
    // Cross-Origin-Opener-Policy: same-origin response header blocks -
    // Firebase then reports a spurious "popup-closed-by-user" error even
    // though the user never closed anything. Redirect sidesteps that
    // entirely and also works on mobile browsers that block popups outright.
    const completeGoogleSignIn = async (idToken) => {
        const response = await axiosPublic.post(
            '/admin/google-signin',
            {},
            { headers: { Authorization: `Bearer ${idToken}` } },
        );

        if (response.data.status >= 200 && response.data.status <= 205) {
            await storeSession(response.data);
            router.push('/dashboard');
        } else {
            toast.error(response.data.message || "Google sign-in failed");
            await logOut();
        }
    };

    useEffect(() => {
        const checkRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    const idToken = await result.user.getIdToken();
                    await completeGoogleSignIn(idToken);
                }
            } catch (error) {
                console.error("Error completing Google sign-in:", error.message);
                toast.error("Google sign-in failed. Please try again.");
            }
        };

        checkRedirectResult();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoogleSignIn = () => {
        signInWithRedirect(auth, provider);
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
            <div className='pt-56 pb-10'>
                <form onSubmit={handleSubmit(onsubmit)} className="max-w-md mx-auto p-8 bg-white shadow-lg rounded flex flex-col text-center items-center justify-center gap-3 border-black border-2">
                    <Link className='' href='/'>
                        <img src='/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2'></img>
                    </Link>

                    {/* google */}
                    <span className="btn bg-black text-white" onClick={handleGoogleSignIn}>
                        <FcGoogle className="text-xl" /> Login with Google
                    </span>

                    <div className="divider">OR</div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            <FiMail className="inline-block mr-2" />
                            Email:
                        </label>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ required: 'Email is required' }}
                            render={({ field }) => <input {...field} type="email" className="w-full p-2 border rounded" />}
                        />
                        {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            <FiLock className="inline-block mr-2" />
                            Password:
                        </label>
                        <div className="relative">
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: 'Password is required' }}
                                render={({ field }) =>
                                    <input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full p-2 border rounded"
                                    />
                                }
                            />
                            <span
                                className="absolute right-2 top-2 text-xl cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
                    </div>

                    {/* Forgot Password */}
                    <Link href="/forgot-password">
                        <span className="text-blue-500 hover:underline cursor-pointer">Forgot Password?</span>
                    </Link>

                    <div className="text-center mt-4">
                        <button type="submit" className="btn btn-primary bg-black hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-black">
                            Login
                        </button>
                    </div>

                    <p className="mt-4">
                        Haven't registered yet?{' '}
                        <Link href="/register">
                            <span className="text-blue-500 hover:underline cursor-pointer">Register here</span>
                        </Link>
                    </p>
                </form>
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default Login;
