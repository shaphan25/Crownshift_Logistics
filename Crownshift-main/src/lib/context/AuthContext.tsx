'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

// Use initializeFirebase to get the client auth instance
const { auth } = initializeFirebase();

// Define the shape of the context data
interface AuthContextType {
  user: User | null; // The Firebase User object or null
  loading: boolean;  // True while checking the initial state
}

// 1. Create the Context object
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. The Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener: This runs once when the component mounts
    // and whenever the user's authentication state changes (login/logout).
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
