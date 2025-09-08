import { createContext, useState } from "react";

export const DrawerContext = createContext(null);

const DrawerProvider = ({ children }) => {
    // Set initial fee: 0 if Wednesday, else 80
    const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);

    const info = {
        isLeftDrawerOpen,
        setIsLeftDrawerOpen
    };

    return (
        <DrawerContext.Provider value={info}>
            {children}
        </DrawerContext.Provider>
    );
};

export default DrawerProvider;
