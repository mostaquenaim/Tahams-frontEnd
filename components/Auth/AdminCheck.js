import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import AdminDrawer from '../Drawers/AdminDrawer';
import NavbarCompTwo from '../Header/NavbarCompDraft';
import Footer from '../Footer/Footer';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import Loading from '../Loading';
import DrawerProvider from '/Contexts/DrawerProvider';
import Head from 'next/head';
import Link from 'next/link';
import AdminDrawerProvider from '/Contexts/AdminDrawerProvider';
import { AdminDrawerContext } from '/Contexts/AdminDrawerProvider';

const AdminCheck = ({ children }) => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [isAdmin, setIsAdmin] = useState(null); //
  const { isAdminOpen } = useContext(AdminDrawerContext);

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

        // console.log(response.data);

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
    <>
      <DrawerProvider>
        <Head>
          <title>404 - Not Found </title>
        </Head>
        <NavbarCompTwo />

        <div className="min-h-screen flex flex-col justify-center items-center">
          <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-500">
            The page you are looking for doesn't exist.
          </p>
          <div className="text-center mt-4">
            <Link
              href={'/login'}
              className="btn btn-neutral"
            >
              Login
            </Link>
          </div>
        </div>
        <Footer />
      </DrawerProvider>
    </>
  );
};

export default AdminCheck;
