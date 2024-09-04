// Import necessary dependencies and components
import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import NavbarCompTwo from '/components/Header/NavbarComp';
import Footer from '/components/Footer/Footer';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc";
import { useContext, useEffect, useState } from 'react';
import AuthProvider, { AuthContext } from '/Contexts/Auth/AuthProvider';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '/firebase'
import { useLocation } from 'react-router-dom';
import { useRouter } from 'next/router';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const provider = new GoogleAuthProvider();

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm();
    const { user, signIn, logOut } = useContext(AuthContext)
    // console.log(user, "17");
    const router = useRouter()

    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        user && (
            console.log(user),
            router.push('/')
        )
    }, [user])

    const onsubmit = async (data) => {
        // console.log(data);

        try {
            // Sending a POST request to the sign-in endpoint
            const response = await axiosPublic.post('/admin/signin', {
                email: data.email,
                password: data.password,
            });
            // console.log(response.data, 40);

            if (response.data.status >= 200 && response.data.status <= 205) {
                try {
                    const userCredential = await signIn(data.email, data.password);
                    console.log('Firebase user logged in:', userCredential.user);
                    toast.success('Logged in');
                    // console.log(JSON.stringify(response.data.data));

                    localStorage.setItem('userInfo', JSON.stringify(response.data.data));
                    localStorage.setItem('email', response.data.data.email);

                } catch (firebaseError) {
                    console.error('Firebase error:', firebaseError.message);
                    setError(firebaseError.message);
                    toast.error(firebaseError.message);
                }

                console.log("Registration successful");
                // router.push('/');
            } else {
                // console.log(response);
                toast.error(response.data.error.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Error: " + error.message);

            // Differentiating between different error types
            if (error.response) {
                // Server responded with a status other than 200 range
                console.error("Error response: ", error.response.data);
                toast.error(error.response.data.message || "An error occurred during login");
            } else if (error.request) {
                // Request was made but no response was received
                console.error("Error request: ", error.request);
                toast.error("No response from server. Please try again later.");
            } else {
                // Something else happened while setting up the request
                console.error("Error message: ", error.message);
                toast.error("An unexpected error occurred. Please try again.");
            }
        }
    }

    // Function to generate a random password
    const generateRandomPassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }
        return password;
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const loggedInUser = result.user;
            const userEmail = loggedInUser.email;
            const userName = loggedInUser.displayName;
            const proPic = loggedInUser.photoURL;

            // Generate a random password
            const generatedPassword = generateRandomPassword();
            const currentDate = new Date();

            const dto = {
                name: userName,
                email: userEmail,
                password: generatedPassword,
                filename: proPic,
                loggedInWith: 'Google',
                created_at: currentDate.toISOString(),
                updated_at: currentDate.toISOString(),
                uniqueId: loggedInUser.uid
            };

            try {
                // Check if the email is already registered
                const emailCheckResponse = await axiosPublic.get(`/admin/check-email?email=${userEmail}`);
                console.log(emailCheckResponse);

                if (emailCheckResponse.data.status !== 404) {
                    console.log("Email already registered");
                    // You may want to sign out the user here
                    const response = await axiosPublic.post('/admin/signin', { email: userEmail, password: process.env.NEXT_PUBLIC_GOOGLE_PASS });
                    // console.log(response.data);
                    localStorage.setItem('userInfo', JSON.stringify(response.data.data));
                    localStorageetItem('email', userEmail);
                    setSuccess("Logged in")
                    router.push('dashboard');
                    return;
                }
                else {
                    const result = await axiosPublic.post('/admin/create', dto);
                    if (result.data.status >= 400 && result.data.status <= 500) {
                        setError(result.data.message);
                        toast.error(result.data.message);
                    }
                }
            } catch (emailCheckError) {
                if (emailCheckError.response && emailCheckError.response.status !== 404) {
                    console.error("Email check failed:", emailCheckError.message);
                    // Sign out the user if email check fails
                    await logOut();
                    return;
                }
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error.message);
        }
    }

    // toggle password show 
    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <>
            {/* <NavbarCompTwo /> */}
            <div className='pt-48 pb-10'>
                <form onSubmit={handleSubmit(onsubmit)} className="max-w-md mx-auto p-8 bg-white shadow-lg rounded flex flex-col text-center items-center justify-center gap-3 border-black border-2">
                    <Link href='/'>
                        <img src='https://i.ibb.co/5FcQHFJ/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2'></img>
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
            <Footer />
        </>
    );
};

export default Login;
