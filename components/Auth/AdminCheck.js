import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import AdminDrawer from '../Drawers/AdminDrawer';
import Footer from '../Footer/Footer';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import Loading from '../Loading';
import DrawerProvider from '/Contexts/DrawerProvider';
import { AdminDrawerContext } from '/Contexts/AdminDrawerProvider';
import {
  ADMIN_ACCESS_KEY,
  AdminAccessContext,
} from '../../Contexts/AdminAccessContext';
import { canOpenPath, PAGE_RULES } from '../../utils/adminAccess';
import { NoAccess } from '../Admin/AdminAccess';
import NavBarCompRe from '../Header/NavBarCompRe';
import Custom404 from '/pages/404';

const NOT_STAFF = Object.freeze({ isStaff: false, permissions: [] });
const RETRY_DELAY_MS = 800;
// Re-read access when moving between admin pages, but not more often than
// this - so a demotion or a permission change shows up within one click.
const NAV_REFRESH_MIN_MS = 15 * 1000;

const statusOf = (error) => error?.response?.status;

const AdminCheck = ({ children }) => {
  const router = useRouter();
  const { user, backendEmail, logOut } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const { isAdminOpen } = useContext(AdminDrawerContext);

  const identity = user?.email || backendEmail || null;

  const { data, error, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: [ADMIN_ACCESS_KEY, identity],
    // Token passed by hand instead of through useAxiosSecure: that instance
    // redirects to /login on a 401, but a customer (or a logged-out visitor)
    // opening an /admin URL must just see the 404 page.
    queryFn: async () => {
      const token =
        typeof window !== 'undefined' && localStorage.getItem('access_token');
      if (!token) return NOT_STAFF;
      const res = await axiosPublic.get('/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.isStaff === true ? res.data : NOT_STAFF;
    },
    // A cached answer from earlier in the visit (e.g. "not staff" before
    // this account was promoted and signed in again) must never decide.
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: NAV_REFRESH_MIN_MS,
    // 401/403 is a real answer. Anything else (network, 5xx) may be a blip:
    // retry once before giving up.
    retry: (count, err) => {
      const status = statusOf(err);
      return status !== 401 && status !== 403 && count < 1;
    },
    retryDelay: RETRY_DELAY_MS,
  });

  useEffect(() => {
    const onRouteChange = () => {
      if (Date.now() - dataUpdatedAt > NAV_REFRESH_MIN_MS) refetch();
    };
    router.events.on('routeChangeComplete', onRouteChange);
    return () => router.events.off('routeChangeComplete', onRouteChange);
  }, [router.events, refetch, dataUpdatedAt]);

  // Staff whose session was revoked mid-visit (suspended, removed, password
  // reset - all of which log them out everywhere): send them to log in again,
  // the same as any other secured request answering 401.
  const wasStaff = useRef(false);
  if (data?.isStaff) wasStaff.current = true;
  const [leaving, setLeaving] = useState(false);
  const sessionEnded = statusOf(error) === 401 && wasStaff.current;

  useEffect(() => {
    if (!sessionEnded) return;
    wasStaff.current = false;
    // logOut() below changes the query key; keep the spinner up until the
    // redirect instead of flashing the 404 page in between.
    setLeaving(true);
    // Clear the whole session, Firebase included: the login page sends a
    // still-signed-in Firebase user with a staff userInfo straight back to
    // /admin, which would leave a promoted customer stuck on the 404 page.
    localStorage.removeItem('access_token');
    localStorage.removeItem('userInfo');
    toast.error('Your session has ended. Please sign in again.', {
      id: 'admin-session-ended',
    });
    Promise.resolve(logOut?.())
      .catch(() => {})
      .finally(() => router.push('/login'));
  }, [sessionEnded, router, logOut]);

  if (process.env.NODE_ENV !== 'production') {
    // Unlisted admin pages are Owner-only; flag them so the choice is made
    // on purpose rather than by omission.
    if (
      router.pathname.startsWith('/admin') &&
      !Object.prototype.hasOwnProperty.call(PAGE_RULES, router.pathname)
    ) {
      console.warn(
        `[admin access] ${router.pathname} has no entry in utils/adminAccess.js PAGE_RULES - only Owners can open it.`,
      );
    }
  }

  // Wait for a definite answer. A cached "not staff" while a fresh check is
  // in flight must not flash the 404 page at someone who just signed in.
  const settled = data !== undefined || error;
  if (!settled || sessionEnded || leaving || (!data?.isStaff && isFetching)) {
    return (
      <div className="text-center py-10">
        <Loading />
      </div>
    );
  }

  // A failed refetch keeps the last good answer (react-query keeps `data`),
  // so a network blip doesn't throw a staff member out of the page.
  const access = data?.isStaff ? data : null;

  if (access) {
    const allowed = canOpenPath(access, router.pathname);
    return (
      <AdminAccessContext.Provider value={access}>
        <div className="flex bg-gray-50 min-h-screen font-inter text-gray-800">
          <AdminDrawer />
          {/* Offsets must match the drawer widths (w-64 open / w-20 collapsed).
              On mobile the open drawer overlays the content instead. */}
          <main
            className={`flex-1 min-w-0 p-6 ml-20 transition-[margin] duration-300 ${
              isAdminOpen ? 'md:ml-64' : 'md:ml-20'
            }`}
          >
            {allowed ? children : <NoAccess />}
          </main>
        </div>
      </AdminAccessContext.Provider>
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
