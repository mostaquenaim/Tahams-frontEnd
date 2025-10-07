import { createContext, useState } from 'react';

export const CustomizationOrderContext = createContext(null);

const CustomizationOrderCountProvider = ({ children }) => {
  const [showCustomizedCount, setShowCustomizedCount] = useState(0);

  const info = {
    showCustomizedCount,
    setShowCustomizedCount,
  };

  return (
    <CustomizationOrderContext.Provider value={info}>
      {children}
    </CustomizationOrderContext.Provider>
  );
};

export default CustomizationOrderCountProvider;
