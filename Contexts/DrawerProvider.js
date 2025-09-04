import { createContext, useState } from "react";

export const DrawerContext = createContext(null);

const DrawerProvider = ({ children }) => {
    // Set initial fee: 0 if Wednesday, else 80
    const [isOpen, setIsOpen] = useState(false);

    const info = {
        isOpen,
        setIsOpen
    };

    return (
        <DrawerContext.Provider value={info}>
            {children}
        </DrawerContext.Provider>
    );
};

export default DrawerProvider;
