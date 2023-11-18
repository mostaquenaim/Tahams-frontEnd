import { createContext, useState } from "react";

export const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [theme, setTheme] = useState('black');
    
    const info ={
        loading,
        setLoading,
        theme,
        setTheme
    }

    return (
        <ThemeContext.Provider value={info}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;