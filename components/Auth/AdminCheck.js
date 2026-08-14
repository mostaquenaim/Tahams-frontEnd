import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import AdminDrawer from '../Drawers/AdminDrawer';
import Footer from '../Footer/Footer';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import Loading from '../Loading';
import DrawerProvider from '/Contexts/DrawerProvider';
import { AdminDrawerContext } from '/Contexts/AdminDrawerProvider';
import NavBarCompRe from '../Header/NavBarCompRe';
import Custom404 from '/pages/404';

const ADMIN_CHECK_RETRY_DELAY_MS = 800;

const AdminCheck = ({ children }) => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [isAdmin, setIsAdmin] = useState(null); //
  const { isAdminOpen } = useContext(AdminDrawerContext);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const checkAdminStatus = async (isRetry = false) => {
      try {
        const token = localStorage.getItem('access_token');

        const response = await axiosPublic.get(`/admin/checkIfAdmin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMountedRef.current) {
          setIsAdmin(response.data?.isAdmin === true);
        }
      } catch (error) {
        console.error('Admin check failed:', error.message);

        // A real "not an admin" answer from the backend - trust it immediately.
        const isAuthFailure =
          error.response?.status === 401 || error.response?.status === 403;

        if (!isRetry && !isAuthFailure) {
          // Network error/timeout/5xx - could be transient, retry once before giving up.
          setTimeout(() => {
            if (isMountedRef.current) checkAdminStatus(true);
          }, ADMIN_CHECK_RETRY_DELAY_MS);
          return;
        }

        if (isMountedRef.current) {
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, [user]);

  if (isAdmin === null) {
    return (
      <div className="text-center py-10">
        <Loading />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex bg-gray-100 min-h-screen font-inter text-gray-800">
        <AdminDrawer />
        <main
          className={`flex-1  p-6 transition-all ${
            isAdminOpen ? 'ml-64' : 'ml-10'
          }`}
        >
          {children}
        </main>
        {/* <main className="flex-1 ml-64 p-6 transition-all">{children}</main> */}
      </div>
    );
  }

  return (
    <DrawerProvider>
      <NavBarCompRe />
      <Custom404 />
      <Footer />
    </DrawerProvider>
  );
};

export default AdminCheck;
