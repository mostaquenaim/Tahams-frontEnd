import { createContext, useState } from "react";

export const CountContext = createContext(null);

const CountProvider = ({ children }) => {
    const [showCount, setShowCount] = useState(0);
    
    const info ={
        showCount,
        setShowCount
    }

    return (
        <CountContext.Provider value={info}>
            {children}
        </CountContext.Provider>
    );
};

export default CountProvider;