import React, { useContext } from 'react';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import AdminDrawer from '../Drawers/AdminDrawer';

const AdminCheck = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (user && user.role === 'admin') {
        return (
            <div className="admin-container">
                <AdminDrawer />
                <div className="admin-content">
                    {children}
                </div>
            </div>
        );
    }

    return null; 
};

export default AdminCheck;
