import { createContext, useState } from 'react';

export const AdminDrawerContext = createContext(null);

const AdminDrawerProvider = ({ children }) => {
  const [isAdminOpen, setAdminIsOpen] = useState(false);

  const info = {
    isAdminOpen,
    setAdminIsOpen,
  };

  return <AdminDrawerContext.Provider value={info}>{children}</AdminDrawerContext.Provider>;
};

export default AdminDrawerProvider;
