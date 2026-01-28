# Admin Layout Template - Best Practices

This file demonstrates the recommended template structure for `src/app/admin/layout.tsx`.

## Key Principles

### 1. **No Global Layout Inside Admin**

The admin layout **replaces** the global layout for all `/admin/*` routes. The global navbar, footer, and providers are NOT used inside `/admin`.

### 2. **Authentication at Layout Level**

All routes under `/admin` must verify the session cookie. This is done in the layout, not in individual pages.

### 3. **Unique Admin Navigation**

Admin routes have their own sidebar and navigation. Clients never see this UI.

## Recommended Template

```tsx
import { logoutAction } from "@/app/actions";
import { getAdminAuth } from "@/firebase/server-init";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ADMIN_UID } from "@/firebase/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- AUTHENTICATION & AUTHORIZATION ---
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login?callbackUrl=/admin");
  }

  let displayName = "Admin";
  let userEmail = "";

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie);

    // Verify this user is the admin
    if (decodedToken.uid !== ADMIN_UID) {
      redirect("/");
    }

    const user = await auth.getUser(decodedToken.uid);
    if (user.email) {
      userEmail = user.email;
      const emailName = user.email.split("@")[0];
      displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
  } catch (error) {
    console.error("Layout Auth Error:", error);
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <html lang="en">
      <body className="antialiased">
        {/* Flex container: sidebar + main content */}
        <div className="flex h-screen bg-gray-50">
          {/* --- ADMIN SIDEBAR --- */}
          <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl overflow-y-auto">
            {/* Logo & Welcome */}
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-orange-500 tracking-tight">
                Crownshift Admin
              </h2>
              <p className="text-sm text-slate-300 mt-2 font-medium">
                Welcome <span className="text-white">{displayName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {userEmail}
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow p-4 space-y-1">
              <Link
                href="/admin"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/shipments"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                📦 Shipments
              </Link>
              <Link
                href="/admin/services"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                🛠️ Services
              </Link>
              <Link
                href="/admin/offers"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                🏷️ Offers
              </Link>
              <Link
                href="/admin/reviews"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                ⭐ Reviews
              </Link>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all active:scale-95 shadow-lg shadow-red-900/20"
                >
                  🚪 Logout
                </button>
              </form>
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Top Header Bar */}
            <header className="h-16 bg-white border-b flex items-center px-8 justify-between shadow-sm">
              <h1 className="text-lg font-semibold text-gray-800">
                Management Panel
              </h1>
              <div className="text-sm text-gray-500">2025 Live System</div>
            </header>

            {/* Page Content (scrollable) */}
            <main className="flex-grow overflow-y-auto p-8 bg-gray-50">
              <div className="max-w-6xl mx-auto">{children}</div>
            </main>

            {/* Footer */}
            <footer className="h-12 bg-white border-t flex items-center justify-center text-gray-400 text-xs tracking-wider">
              © 2025 CROWNSHIFT LOGISTICS LTD. ALL RIGHTS RESERVED
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
```

## Structure Explanation

### Route Hierarchy

```
Global Routes          Admin Routes
───────────────────────────────────────────────────
/ (home)               /admin
/login                 /admin/shipments/[id]
/services              /admin/offers
/faq                   /admin/reviews
/tracking

Global Layout:         Admin Layout:
- navbar               - sidebar
- footer               - admin header
- providers            - auth check
```

### Authentication Flow

1. User visits `/admin`
2. AdminLayout checks for session cookie
3. If missing → redirect to `/login`
4. If invalid → redirect to `/` (not admin)
5. If valid admin → render page with sidebar
6. All child pages (`/admin/shipments/[id]`, etc.) inherit this check

### Why Routes Work Correctly

| Route                | File                            | Layout Used        | Result                            |
| -------------------- | ------------------------------- | ------------------ | --------------------------------- |
| `/admin`             | `admin/page.tsx`                | `admin/layout.tsx` | ✅ Dashboard with sidebar         |
| `/admin/shipments/1` | `admin/shipments/[id]/page.tsx` | `admin/layout.tsx` | ✅ Shipment detail with sidebar   |
| `/services`          | `app/services/page.tsx`         | `app/layout.tsx`   | ✅ Client page with navbar/footer |

## Important Notes

- ❌ **Don't** import global navbar/footer in admin layout
- ❌ **Don't** pass `children` to global layout from admin
- ✅ **Do** handle auth at layout level (affects all child pages)
- ✅ **Do** keep admin layout separate from global layout
- ✅ **Do** use `redirect()` for unauthorized access

## Testing Routes

```bash
# Local development
npm run dev

# Test these URLs:
# ✅ http://localhost:3000/admin → Admin dashboard
# ✅ http://localhost:3000/admin/shipments/123 → Shipment detail
# ❌ http://localhost:3000/admin (when not logged in) → Redirects to /login
# ✅ http://localhost:3000/services → Client page (different layout)
```
