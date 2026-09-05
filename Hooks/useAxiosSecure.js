import axios from "axios";
import Router from "next/router";

const axiosSecure = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
});

axiosSecure.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

axiosSecure.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 means the token is missing/invalid/expired/revoked - the session
        // itself is dead, so clear it and send the admin back to log in.
        // 403 means a valid, logged-in user just lacks the required role -
        // that's a real "not allowed" answer, not an expired session, so it
        // must not log the user out.
        if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            if (Router.pathname !== "/login") {
                Router.push("/login");
            }
        }
        return Promise.reject(error);
    },
);

const useAxiosSecure = () => {
    return axiosSecure;
};

export default useAxiosSecure;
