import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import AuthCard from '/components/Auth/AuthCard';
import { Field, inputClass, buttonPrimary } from '/components/Storefront/StorefrontUI';
import Link from 'next/link';
import { useContext, useState } from 'react';
import axios from 'axios';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { mergeGuestCartIntoAccount } from '../../utils/guestCustomer';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import Head from 'next/head';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const router = useRouter()
    const { createUser } = useContext(AuthContext)

    const { control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
    const axiosPublic = useAxiosPublic();

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prevState => !prevState);
    };

    const password = watch("password");

    // Returns true only when the backend confirms the OTP email was sent
    const sendOtp = async (email) => {
        try {
            const res = await axiosPublic.post('/admin/send-otp', { email });
            if (res.data?.success) return true;
            // e.g. "Email already exists" comes back as a 200 with status 400
            toast.error(res.data?.message || 'We could not send your verification code. Please try again.');
        } catch (err) {
            console.error("Error sending OTP:", err.message);
            toast.error(
                err.response?.data?.message
                || 'We could not reach the server. Please check your connection and try again.'
            );
        }
        return false;
    };

    const onRegisterSubmit = async (data) => {
        data.loggedInWith = 'Email-Pass'
        localStorage.setItem('userData', JSON.stringify(data));
        setError('')
        setSuccess('')

        if (await sendOtp(data.email)) {
            setOtpSent(true);
        }
    };

    const onResendOtp = async () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (await sendOtp(userData.email)) {
            setError('');
            toast.success('OTP sent again');
        }
    };

    const onOtpSubmit = async () => {
        const userData = JSON.parse(localStorage.getItem('userData'));

        try {
            const response = await axiosPublic.post('/admin/verify-otp', {
                email: userData.email,
                otp: otp
            });

            if (response.data.success) {
                setError('');

                // Complete registration - customer-login is the public,
                // role-safe creation endpoint (/admin/create is admin-only)
                try {
                    await axiosPublic.post('/admin/customer-login', userData);
                } catch (createError) {
                    const msg = createError.response?.data?.message || 'Registration failed';
                    setError(msg);
                    toast.error(msg);
                    return;
                }

                // Create user in Firebase
                try {
                    const userCredential = await createUser(userData.email, userData.password);
                  // console.log('Firebase user created:', userCredential.user);
                    toast.success('Thank you for registering');
                    const idToken = await userCredential.user.getIdToken();
                    const signInResponse = await axiosPublic.post(
                        '/admin/firebase-signin',
                        {},
                        { headers: { Authorization: `Bearer ${idToken}` } },
                    );

                    localStorage.setItem('access_token', signInResponse.data.access_token)
                    localStorage.setItem('userInfo', JSON.stringify(signInResponse.data.data));
                    await mergeGuestCartIntoAccount(axiosPublic, userData.email);

                    router.push('/login');
                } catch (firebaseError) {
                    console.error('Firebase error:', firebaseError.message);
                    const firebaseMessages = {
                        'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
                        'auth/weak-password': 'Your password is too weak. Please use at least 6 characters.',
                        'auth/invalid-email': 'That email address is not valid.',
                        'auth/network-request-failed': 'Network problem. Please check your connection and try again.',
                    };
                    const msg = firebaseMessages[firebaseError.code]
                        || 'We could not finish creating your account. Please try again.';
                    setError(msg);
                    toast.error(msg);
                }
                finally {
                    localStorage.removeItem('userData')
                  // console.log("Registration successful");
                }
            } else {
                setError('The code you entered is incorrect. Please try again.');
                toast.error('The code you entered is incorrect. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error.message);
            const msg = error.response?.data?.message
                || 'We could not verify your code. Please check your connection and try again.';
            setError(msg);
            setSuccess('');
            toast.error(msg);
        }
    }

    const passwordToggle = (visible, onToggle) => (
        <button
            type="button"
            onClick={onToggle}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        >
            {visible ? <FiEyeOff /> : <FiEye />}
        </button>
    );

    return (
        <>
            <Head>
                <title>Register - Tahams </title>
            </Head>
            {!otpSent ? (
                <AuthCard
                    title="Create your account"
                    subtitle="Save your details, track orders and check out faster."
                    footer={
                        <>
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-black underline-offset-2 hover:underline">
                                Log in
                            </Link>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4" noValidate>
                        <Field label="Name" icon={FiUser} error={errors.name?.message}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Name is required' }}
                                render={({ field }) => <input {...field} type="text" autoComplete="name" className={inputClass} />}
                            />
                        </Field>

                        <Field label="Email" icon={FiMail} error={errors.email?.message}>
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: 'Email is required' }}
                                render={({ field }) => <input {...field} type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />}
                            />
                        </Field>

                        <Field label="Phone" hint="(optional)" icon={FiPhone} error={errors.mbl_no?.message}>
                            <Controller
                                name="mbl_no"
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^(\+8801|01)\d{9}$/,
                                        message: 'Enter a valid number, e.g. 01XXXXXXXXX',
                                    },
                                }}
                                render={({ field }) => <input {...field} type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={inputClass} />}
                            />
                        </Field>

                        <Field
                            label="Password"
                            icon={FiLock}
                            error={errors.password?.message}
                            right={passwordToggle(showPassword, togglePasswordVisibility)}
                        >
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: 'Password is required' }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        className={inputClass + ' pr-10'}
                                    />
                                )}
                            />
                        </Field>

                        <Field
                            label="Confirm password"
                            icon={FiLock}
                            error={errors.confirmPassword?.message}
                            right={passwordToggle(showConfirmPassword, toggleConfirmPasswordVisibility)}
                        >
                            <Controller
                                name="confirmPassword"
                                control={control}
                                rules={{
                                    required: 'Confirm Password is required',
                                    validate: value => value === password || 'Passwords do not match'
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        className={inputClass + ' pr-10'}
                                    />
                                )}
                            />
                        </Field>

                        <button type="submit" disabled={isSubmitting} className={buttonPrimary + ' w-full'}>
                            {isSubmitting ? 'Sending code...' : 'Create account'}
                        </button>
                    </form>
                </AuthCard>
            ) : (
                <AuthCard
                    title="Verify your email"
                    subtitle="Enter the code we just emailed you to finish creating your account."
                    footer={
                        <>
                            Didn&apos;t get the code?{' '}
                            <button type="button" onClick={onResendOtp} className="font-semibold text-black underline-offset-2 hover:underline">
                                Resend OTP
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-4">
                        <Field label="Verification code" icon={FiLock}>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className={inputClass + ' text-center text-lg tracking-[0.4em]'}
                                required
                            />
                        </Field>
                        {success && <p className="text-sm text-green-700">{success}</p>}
                        {error && (
                            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </p>
                        )}
                        <button type="submit" disabled={isSubmitting} className={buttonPrimary + ' w-full'}>
                            {isSubmitting ? 'Verifying...' : 'Verify and create account'}
                        </button>
                    </form>
                </AuthCard>
            )}
        </>
    );
};

export default Register;
