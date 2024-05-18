import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";

const AdminDrawer = () => {

    const links = <>
        <li><Link href='/'>Add Product</Link></li>
        <li><Link href='/'>Add Product</Link></li>
        <li><Link href='/'>Add Product</Link></li>
        <li><Link href='/'>Add Product</Link></li>
        <li><Link href='/'>Add Product</Link></li>
    </>
    return (
        <div>
            <div className="drawer">
                <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    {/* Page content here */}
                    <label htmlFor="admin-drawer" className="btn btn-primary drawer-button">
                        <GiHamburgerMenu></GiHamburgerMenu>
                    </label>
                </div>
                <div className="drawer-side">
                    <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                        {/* Sidebar content here */}
                        {links}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDrawer;