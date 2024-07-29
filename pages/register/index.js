// Import necessary dependencies and components
import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import NavbarCompTwo from '/components/Header/NavbarComp';
import Footer from '/components/Footer/Footer';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const router = useRouter()

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
        try {
            // Send OTP to the user's phone number or email
            const response = await axiosPublic.post('/admin/send-otp', {
                email: data.email
            });
            console.log(response);
            // console.log(response);
            if (response.data.success) {
                setOtpSent(true);
                setError('')
                setSuccess('[OTP sent to your email]')
                sessionStorage.setItem('userData', JSON.stringify(data));
            }
            else{
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
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        try {
            const response = await axiosPublic.post('/admin/verify-otp', {
                email: userData.email,
                otp: otp
            });
            // console.log(response);
            if (response.data.success) {
                setError('')
                // Complete registration
                console.log(userData);
                const result = await axiosPublic.post('/admin/create', userData);
                if(result.data.status >= 400 && result.data.status <= 500)
                {
                    setError(result.data.message)
                    toast.error(result.data.message)
                }
                toast.success('Thank you for registering')
                router.push('/login');
                console.log("Registration successful");
            } else {
                console.error("Invalid OTP");
            }
        } catch (error) {
            setError('OTP verification error')
            setSuccess('')
            console.error(error.message);
        }
    };

    return (
        <>
            <NavbarCompTwo />
            <div className='pt-48 pb-10'>
                {!otpSent ? (
                    <form onSubmit={handleSubmit(onRegisterSubmit)} className="max-w-md mx-auto p-8 bg-white shadow-lg rounded flex flex-col text-center items-center justify-center gap-3 border-black border-2">
                        <Link href='/'>
                            <img src='https://i.ibb.co/5FcQHFJ/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2' alt="logo" />
                        </Link>

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
                                <FiPhone className="inline-block mr-2" />
                                Phone:
                            </label>
                            <Controller
                                name="phone"
                                control={control}
                                rules={{ required: 'Phone number is required' }}
                                render={({ field }) => <input {...field} type="tel" className="w-full p-2 border rounded" />}
                            />
                            {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone.message}</p>}
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
                        <Link href='/'>
                            <img src='https://i.ibb.co/5FcQHFJ/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2' alt="logo" />
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
            <Footer />
        </>
    );
};

export default Register;
