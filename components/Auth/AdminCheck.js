import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import AdminDrawer from '../Drawers/AdminDrawer';
import NavbarCompTwo from '../Header/NavbarComp';
import Footer from '../Footer/Footer';

const AdminCheck = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUserInfo = sessionStorage.getItem('userInfo');
        // console.log(storedUserInfo);
        if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            // console.log(parsedUserInfo,16);
            setUserData(parsedUserInfo);
        }
    }, [user]);

    if (userData && userData.role === 'admin') {
        return (
            <div className="admin-container">
                <AdminDrawer />
                <div className="admin-content">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <>
            <NavbarCompTwo />
            <div className="min-h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
                <p className="text-gray-500">The page you are looking for doesn't exist.</p>
            </div>
            <Footer />
        </>
    )
};

export default AdminCheck;
