// pages/_app.js

import '../styles/globals.css';
import AdminDrawer from "../components/Drawers/AdminDrawer";

function AdminLayout({ Component, pageProps }) {
    return (
        <div>
            <AdminDrawer />
            <Component {...pageProps} />
        </div>
    );
}

export default AdminLayout;
