import { createContext, useEffect, useState } from "react";
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import PropTypes from "prop-types"; // Import PropTypes
import { auth } from '/firebase'

export const AuthContext = createContext(null);
const provider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGotoCart, setShowGotoCart] = useState(false)
    // Admins created via scripts/seed-admin.ts sign in through this
    // backend's own password check (/admin/signin) and never touch
    // Firebase, so `user` above stays null for them forever. This tracks
    // that there's still a valid backend session, mirroring localStorage.email
    // which login.js's storeSession() writes on every login.
    const [backendEmail, setBackendEmail] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('email')) || null
    );


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
        setBackendEmail(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('email');
        }
        return signOut(auth);
    }

    const handleGoogleSignIn = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                setUser(result.user);
            }).catch(() => {});
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
        showGotoCart,
        backendEmail,
        setBackendEmail,
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