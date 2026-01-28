'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAdminPath = pathname?.startsWith('/admin');

  // Redirect logic to prevent redirect loop and handle authorization
  useEffect(() => {
    // 1. DON'T DO ANYTHING IF STILL LOADING
    if (loading) return;

    // 2. NOT LOGGED IN AT ALL? GO TO LOGIN
    if (!user) {
      if (pathname?.startsWith('/admin')) {
        console.log("No user found, redirecting to login...");
        router.push('/login');
      }
    } 
    // 3. LOGGED IN BUT NOT AN ADMIN? GO TO UNAUTHORIZED (BREAKS THE LOOP!)
    else if (user && !user.isAdmin && pathname?.startsWith('/admin')) {
      console.log("User is not an admin, redirecting to unauthorized...");
      router.push('/unauthorized');
    }
    // 4. ALREADY AUTHENTICATED AND ADMIN? PREVENT LOGIN PAGE FROM REDIRECTING
    else if (user && user.isAdmin && pathname === '/login') {
      router.push('/admin');
    }
  }, [user, loading, pathname, router]);

  // 4. PREVENT RENDERING UNTIL WE KNOW THE AUTH STATUS
  if (loading && pathname?.startsWith('/admin')) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {!isAdminPath && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
}
