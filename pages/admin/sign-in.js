import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router';
import LoggedCheck from '../components/loggedCheck';
import MyHeader from '../components/header';


export default function AdminSignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter();

    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')


    const handleSubmit = async (event) => {
        event.preventDefault()

        try {

            const response = await axios.post('http://localhost:3000/admin/signin', { email, password });

            sessionStorage.setItem('email', email);
            setSuccess("Logged in")
            router.push('dashboard');

        } catch (error) {
            console.log("error")
            console.log("error22: " + error.message)
            setError("Invalid")
        }
    };





    return (
        <>
            <MyHeader title="Login" />
            <LoggedCheck />
            <section className="flex h-screen items-center justify-center text-center bg-gradient-to-b from-zinc-50 to-blue-100">
                <div className='flex flex-col bg-white p-5 shadow-lg rounded-lg hover:shadow-2xl hover:shadow-black max-w-md w-full items-center justify-center text-center space-y-4'>

                    {/* Form start */}
                    <form onSubmit={handleSubmit} className="mx-auto">

                        <table >
                            <tbody className=' gap-5'>
                                <tr>
                                    <td colSpan="2">
                                        <h1 className='font-bold text-black text-xl'>Admin Login</h1>
                                        {success? <p className="text-green-500">{success}</p>
                                        :<p className="text-red-500">{error}</p>}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <label>Email</label>
                                    </td>
                                    <td>
                                        <input
                                            className="input input-bordered input-success w-full max-w-xs"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <label>Password</label>
                                    </td>
                                    <td>
                                        <input
                                            className="input input-bordered input-success w-full max-w-xs"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <button className='btn bg-green-50 w-full' type="submit">Login</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            </section>


        </>
    )
}