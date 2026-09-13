import { createContext, useEffect, useState } from "react";
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithRedirect, signOut } from "firebase/auth";
import PropTypes from "prop-types"; // Import PropTypes
import { auth } from '/firebase'

export const AuthContext = createContext(null);
const provider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGotoCart, setShowGotoCart] = useState(false)


    // onAuthStateChanged below is what normally flips loading back to
    // false, but it only fires on an actual auth state change - a rejected
    // sign-in/sign-up (wrong password, email already in use, etc.) never
    // triggers it, so without the explicit reset here `loading` gets stuck
    // true forever after any failed attempt, and every page that gates on
    // it (e.g. /dashboard, /my-orders) shows a permanent spinner.
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password).catch((error) => {
            setLoading(false);
            throw error;
        });
    }

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password).catch((error) => {
            setLoading(false);
            throw error;
        });
    }

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    // Redirect instead of popup - signInWithPopup breaks under a
    // Cross-Origin-Opener-Policy: same-origin response header (Firebase
    // can't inspect/close the popup, and reports a spurious
    // "popup-closed-by-user" error). onAuthStateChanged above picks up the
    // signed-in user once Firebase completes the redirect back.
    const handleGoogleSignIn = () => {
        signInWithRedirect(auth, provider);
    }

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => {
            unSubscribe();
        }
    }, [])

    const authInfo = {
        user,
        setUser,
        loading,
        setLoading,
        createUser,
        signIn,
        logOut,
        handleGoogleSignIn,
        setShowGotoCart,
        showGotoCart
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthProvider;