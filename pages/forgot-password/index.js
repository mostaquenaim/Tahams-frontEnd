import { useForm, Controller } from 'react-hook-form';
import { FiMail } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '/firebase';
import toast from 'react-hot-toast';
import Head from 'next/head';

const ForgotPassword = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const [isSent, setIsSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, data.email);
        } catch (error) {
            // Deliberately not distinguishing "no such account" from other
            // errors in the UI - doing so would let anyone enumerate which
            // emails are registered.
            console.error('Password reset error:', error.message);
        } finally {
            // Always show the same confirmation regardless of outcome, for
            // the same reason.
            setIsSent(true);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Forgot Password - Tahams</title>
            </Head>
            <div className='pt-56 pb-10'>
                <div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded flex flex-col text-center items-center justify-center gap-3 border-black border-2">
                    <Link className='' href='/'>
                        <img src='/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2' alt="logo" />
                    </Link>

                    {isSent ? (
                        <>
                            <h1 className="text-xl font-bold mt-2">Check your email</h1>
                            <p className="text-gray-600">
                                If an account exists for that email address, we&apos;ve sent a link to reset your password.
                            </p>
                            <Link href="/login">
                                <span className="text-blue-500 hover:underline cursor-pointer">Back to login</span>
                            </Link>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center gap-3">
                            <h1 className="text-xl font-bold mt-2">Reset your password</h1>
                            <p className="text-gray-600 text-sm">
                                Enter your account email and we&apos;ll send you a link to reset your password.
                            </p>

                            <div className="mb-2 w-full">
                                <label className="block text-gray-700 text-sm font-bold mb-2 text-left">
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

                            <div className="text-center mt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary bg-black hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-black disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send reset link'}
                                </button>
                            </div>

                            <p className="mt-4">
                                <Link href="/login">
                                    <span className="text-blue-500 hover:underline cursor-pointer">Back to login</span>
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
