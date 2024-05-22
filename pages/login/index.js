// Import necessary dependencies and components
import { useForm, Controller } from 'react-hook-form';
import { FiMail, FiLock } from 'react-icons/fi';
import NavbarCompTwo from '/components/Header/NavbarComp';
import Footer from '/components/Footer/Footer';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc";
import { useContext, useEffect } from 'react';
import AuthProvider, { AuthContext } from '/Contexts/Auth/AuthProvider';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '/firebase'
import { useLocation } from 'react-router-dom';
import { useRouter } from 'next/router';
import axios from 'axios';
const provider = new GoogleAuthProvider();

const Login = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const { user } = useContext(AuthContext)
    console.log(user, "17");
    const router = useRouter()

    useEffect(() => {
        user && router.push('/')
    }, [user])

    const onSubmit = (data) => {
        console.log(data);
        // You can handle login logic here
    };

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

    // google sign in 
    const handleGoogleSignIn = () => {
        // e.preventDefault()
        signInWithPopup(auth, provider)
            .then((result) => {
                const loggedInUser = result.user
                console.log(loggedInUser);
                const userEmail = result.user.email
                const user = { userEmail }
                const userName = loggedInUser.displayName;
                const proPic = loggedInUser.photoURL

                // Generate a random password
                const generatedPassword = generateRandomPassword();

                const currentDate = new Date();

                const dto = {
                    name: userName,
                    email: userEmail,
                    password: generatedPassword,
                    filename: proPic,
                    created_at: currentDate.toISOString(), 
                    updated_at: currentDate.toISOString(),
                    uniqueId: loggedInUser.uid
                };

                axios.post('https://api.tahamsbd.com/admin/customer-login', dto, {
                    withCredentials: true
                })
                    .then(res => {
                        if (res.data.success) {
                            console.log(result.data);
                            // setUser(result.user);
                            // navigate(location?.state ? location.state : '/');
                        }
                    })

            }).catch((error) => {
                console.log(error.message)
                // ...
            });

    }

    return (
        <>
            <NavbarCompTwo />
            <div className='pt-48 pb-10'>
                <form className="max-w-md mx-auto p-8 bg-white shadow-lg rounded flex flex-col text-center items-center justify-center gap-3 border-black border-2">
                    <Link href='/'>
                        <img src='https://i.ibb.co/5FcQHFJ/logo-removebg.png' className='h-20 w-20 rounded-full p-3 bg-black border-white border-2'></img>
                    </Link>

                    {/* Login with Google */}
                    {/* <button className="btn bg-black text-white" onClick={(e)=>handleGoogleSignIn(e)}>
                        <FcGoogle className="text-xl" /> Login with Google
                    </button> */}

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
                        <Controller
                            name="password"
                            control={control}
                            rules={{ required: 'Password is required' }}
                            render={({ field }) => <input {...field} type="password" className="w-full p-2 border rounded" />}
                        />
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
