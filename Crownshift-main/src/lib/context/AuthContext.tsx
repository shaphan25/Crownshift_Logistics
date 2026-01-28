'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

// Extend the User type to include custom fields
interface AuthUser extends User {
  role?: string;
  isAdmin?: boolean;
}

// Define the shape of the context data
interface AuthContextType {
  user: AuthUser | null; // The Firebase User object with role attached, or null
  loading: boolean;  // True while checking the initial state
}

// 1. Create the Context object
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. The Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener: This runs once when the component mounts
    // and whenever the user's authentication state changes (login/logout).
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Go to Firestore and look for the document with this UID
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            // 2. Attach the role to the user object in the app state
            const authUser: AuthUser = {
              ...firebaseUser,
              role: userData.role || "user",
              isAdmin: userData.role === "admin"
            };
            setUser(authUser);
          } else {
            // If no Firestore doc exists, treat them as a basic user
            const authUser: AuthUser = {
              ...firebaseUser,
              role: "user",
              isAdmin: false
            };
            setUser(authUser);
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          // Fallback to basic user on error
          const authUser: AuthUser = {
            ...firebaseUser,
            role: "user",
            isAdmin: false
          };
          setUser(authUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This throws an error if the hook is used outside the Provider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
