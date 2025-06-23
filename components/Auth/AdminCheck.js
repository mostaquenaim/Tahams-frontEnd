import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import AdminDrawer from '../Drawers/AdminDrawer';
import NavbarCompTwo from '../Header/NavbarComp';
import Footer from '../Footer/Footer';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import Loading from '../Loading';

const AdminCheck = ({ children }) => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [isAdmin, setIsAdmin] = useState(null); //

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // console.log(token,'tokkk');

        const response = await axiosPublic.get(`/admin/checkIfAdmin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response.data);

        // ✅ Use response.data
        setIsAdmin(response.data?.isAdmin === true);
      } catch (error) {
        console.error('Admin check failed:', error.message);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (isAdmin === null) {
    return <div className="text-center py-10">
      <Loading />
    </div>;
  }

  if (isAdmin) {
    return (
      <div className="admin-container">
        <AdminDrawer />
        <div className="admin-content">{children}</div>
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
  );
};

export default AdminCheck;