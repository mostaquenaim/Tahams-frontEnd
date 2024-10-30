import { useContext, useEffect } from "react";
import { AuthContext } from "../../Contexts/Auth/AuthProvider";

const HandleLogout = () => {
    const { logOut } = useContext(AuthContext)

    const handleLogout = () => {
        logOut()
            .then(() => {
                // Remove userInfo from localStorage
                localStorage.removeItem('userInfo');
                console.log('User logged out and userInfo removed from localStorage');
            })
            .catch((error) => {
                console.error('Error during logout:', error.message);
                toast.error('Error during logout. Please try again.');
            });
    };

    useEffect(() => {
        handleLogout();
    })
};

export default HandleLogout;