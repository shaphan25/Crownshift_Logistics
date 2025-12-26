import { logoutAction } from "@/app/actions";
import { getAdminAuth } from "@/firebase/server-init";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 1. Get the session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  let displayName = "Admin"; // Fallback name

  try {
    if (sessionCookie) {
      const auth = getAdminAuth();
      // Verify the session to get the user's details
      const decodedToken = await auth.verifySessionCookie(sessionCookie);
      const user = await auth.getUser(decodedToken.uid);
      
      if (user.email) {
        // Extract "richard" from "richard@crownshift.com"
        const emailName = user.email.split('@')[0];
        // Capitalize the first letter: "richard" → "Richard"
        displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
    }
  } catch (error) {
    console.error("Layout Auth Error:", error);
    // If auth fails here, we let the middleware handle the redirect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-orange-500 tracking-tight">Crownshift Admin</h2>
          {/* DYNAMIC WELCOME MESSAGE */}
          <p className="text-sm text-slate-300 mt-2 font-medium">
            Welcome Admin-<span className="text-white">{displayName}</span>
          </p>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <span className="text-slate-400 group-hover:text-white">📊</span>
            Dashboard
          </Link>
          <Link 
            href="/admin/services" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <span className="text-slate-400 group-hover:text-white">🛠️</span>
            Services
          </Link>
          <Link 
            href="/admin/offers" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <span className="text-slate-400 group-hover:text-white">🏷️</span>
            Offers
          </Link>
          <Link 
            href="/admin/reviews" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <span className="text-slate-400 group-hover:text-white">⭐</span>
            Reviews
          </Link>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <form action={logoutAction}>
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">Management Panel</h1>
          <div className="text-sm text-gray-500">2025 Live System</div>
        </header>

        <main className="flex-grow overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* ADMIN FOOTER */}
        <footer className="h-12 bg-white border-t flex items-center justify-center text-gray-400 text-xs tracking-wider">
          © 2025 CROWNSHIFT LOGISTICS LTD. ALL RIGHTS RESERVED
        </footer>
      </div>
    </div>
  );
}
