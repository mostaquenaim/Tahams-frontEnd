import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import NavbarCompTwo from '/components/Header/NavbarComp';
import Footer from '/components/Footer/Footer';
import Link from 'next/link';
import { useContext, useState } from 'react';
import axios from 'axios';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
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

    const { control, handleSubmit, formState: { errors }, watch } = useForm();
    const axiosPublic = useAxiosPublic();

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prevState => !prevState);
    };

    const password = watch("password");

    const onRegisterSubmit = async (data) => {
        console.log(data);
        data.loggedInWith = 'Email-Pass'
        try {
            // Send OTP to the user's phone number or email
            const response = await axiosPublic.post('/admin/send-otp', {
                email: data.email
            });
            // console.log(response);
            if (response.data.success) {
                setOtpSent(true);
                setError('')
                setSuccess('[OTP sent to your email]')
                localStorage.setItem('userData', JSON.stringify(data));
            }
            else {
                setError(response.data.message)
                toast.error(response.data.message)
                setSuccess('')
            }
        } catch (error) {
            setError('Error sending OTP')
            setSuccess('')
            console.error("Error sending OTP:", error.message);
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

                // Complete registration
                const result = await axiosPublic.post('/admin/create', userData);
                if (result.data.status >= 400 && result.data.status <= 500) {
                    setError(result.data.message);
                    toast.error(result.data.message);
                } else {
                    // Create user in Firebase
                    try {
                        const userCredential = await createUser(userData.email, userData.password);
                        console.log('Firebase user created:', userCredential.user);
                        toast.success('Thank you for registering');
                        await axiosPublic.post('/admin/signin', {
                            email: userData.email,
                            password: userData.password,
                        });

                        // console.log(result.data,'breaak',result.data.data);
                        localStorage.setItem('access_token', response.data.access_token)

                        localStorage.setItem('userInfo', JSON.stringify(result.data.data));

                        router.push('/login');
                    } catch (firebaseError) {
                        console.error('Firebase error:', firebaseError.message);
                        setError(firebaseError.message);
                        toast.error(firebaseError.message);
                    }
                    finally {
                        localStorage.removeItem('userData')
                        console.log("Registration successful");
                    }

                }
            } else {
                console.error("Invalid OTP");
                setError('Invalid OTP');
                toast.error('Invalid OTP');
            }
        } catch (error) {
            setError('OTP verification error');
            setSuccess('');
            console.error('Error:', error.message);
            toast.error('OTP verification error');
        }
    }

    return (
        <>
            {/* <NavbarCompTwo /> */}
            <Head>
                <title>Register - Tahams </title>
            </Head>
            <div className='pt-48 pb-10'>
                {!otpSent ? (
                    <form onSubmit={handleSubmit(onRegisterSubmit)} className="max-w-md mx-auto p-8 bg-white shadow-lg rounded flex flex-col text-center items-center justify-center gap-3 border-black border-2">
                        <Link className='' href='/'>
                            <img src='/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2' alt="logo" />
                        </Link>

                        {/* name */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                <FiUser className="inline-block mr-2" />
                                Name:
                            </label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Name is required' }}
                                render={({ field }) => <input {...field} type="text" className="w-full p-2 border rounded" />}
                            />
                            {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
                        </div>

                        {/* email */}
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

                        {/* phone */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                <FiPhone className="inline-block mr-2" />
                                Phone <span className='text-gray-400'>[optional]</span> :
                            </label>
                            <Controller
                                name="mbl_no"
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^(\+8801|01)\d{9}$/,
                                        message: 'Invalid phone number format',
                                    },
                                }}
                                render={({ field }) => <input {...field} type="tel" className="w-full p-2 border rounded" />}
                            />
                            {errors.mbl_no && <p className="text-red-500 text-xs italic">{errors.mbl_no.message}</p>}
                        </div>

                        {/* password */}
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

                        {/* confirm password */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                <FiLock className="inline-block mr-2" />
                                Confirm Password:
                            </label>
                            <div className="relative">
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    rules={{
                                        required: 'Confirm Password is required',
                                        validate: value => value === password || 'Passwords do not match'
                                    }}
                                    render={({ field }) =>
                                        <input
                                            {...field}
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="w-full p-2 border rounded"
                                        />
                                    }
                                />
                                <span
                                    className="absolute right-2 top-2 text-xl cursor-pointer"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </span>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="text-center mt-4">
                            <button type="submit" className="btn btn-primary bg-black hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-black">
                                Register
                            </button>
                        </div>

                        <p className="mt-4">
                            Already have an account?{' '}
                            <Link href="/login">
                                <span className="text-blue-500 hover:underline cursor-pointer">Login here</span>
                            </Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit(onOtpSubmit)} className="max-w-md mx-auto p-8 bg-white shadow-lg rounded flex flex-col text-center items-center justify-center gap-3 border-black border-2">
                        <Link className='' href='/'>
                            <img src='/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2' alt="logo" />
                        </Link>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                <FiLock className="inline-block mr-2" />
                                OTP:
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <p className=''>{success && success}</p>
                            <p className='text-red-500 font-bold'>{error && error}</p>
                        </div>

                        <div className="text-center mt-4">
                            <button type="submit" className="btn btn-primary bg-black hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-black">
                                Verify OTP
                            </button>
                        </div>
                    </form>
                )}
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default Register;
