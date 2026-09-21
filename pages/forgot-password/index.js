import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '/firebase';
import Head from 'next/head';
import AuthCard from '/components/Auth/AuthCard';
import {
  Field,
  inputClass,
  buttonPrimary,
  BackLink,
} from '/components/Storefront/StorefrontUI';

const ForgotPassword = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
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
      <AuthCard
        title={isSent ? 'Check your email' : 'Reset your password'}
        subtitle={
          isSent
            ? undefined
            : "Enter your account email and we'll send you a link to reset your password."
        }
        footer={<BackLink href="/login">Back to login</BackLink>}
      >
        {isSent ? (
          <div className="text-center">
            <FiCheckCircle className="mx-auto h-10 w-10 text-green-600" />
            <p className="mt-3 text-sm text-gray-600">
              If an account exists for that email address, we&apos;ve sent a
              link to reset your password. It may take a minute to arrive, so
              check your spam folder too.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="Email" icon={FiMail} error={errors.email?.message}>
              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                )}
              />
            </Field>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonPrimary} w-full`}
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
      </AuthCard>
    </>
  );
};

export default ForgotPassword;
