# Admin Redirect Loop - Fix & Troubleshooting Guide

## What Was Fixed

### 1. **Loading State Protection** ✅

**File:** `src/components/root-layout-client.tsx`

Added loading state check to prevent redirects during Firebase initialization:

```typescript
const { loading } = useAuth();

if (loading) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg font-semibold">Loading...</div>
        <div className="text-sm text-gray-500">Initializing application</div>
      </div>
    </div>
  );
}
```

**Why:** During the first few milliseconds, Firebase hasn't finished checking if the user is logged in. Without this check, the app redirects to `/login` even though the user IS authenticated.

### 2. **Admin Sidebar Enhanced** ✅

**File:** `src/app/admin/layout.tsx`

Added missing "Shipments" link and improved visual feedback:

- ✅ Added `/admin/shipments` link with 📦 icon
- ✅ Added logout button with 🚪 icon
- ✅ Better background color for main content

## How to Test & Debug

### Step 1: Clear Browser Cache

```
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Select http://localhost:3000
4. Click "Clear" to remove all cookies
5. Close and reopen the tab
```

### Step 2: Verify Session Cookie

```
1. Open DevTools → Application → Cookies
2. Look for __session cookie
3. It should be present after you log in
4. It should have a long value (JWT token)
```

### Step 3: Check Auth Loading State

Add this temporary debug code to `root-layout-client.tsx`:

```typescript
console.log("Auth Loading:", loading);
console.log("Is Admin Path:", isAdminPath);
console.log("Current Path:", pathname);
```

Then check the console in DevTools.

### Step 4: Test the Flow

**If Loop Happens:**

1. Visit `/admin`
2. Should redirect to `/login?callbackUrl=/admin`
3. Sign up with email/password
4. After signup, should redirect back to `/admin`
5. Should see sidebar with dashboard

**Expected Timeline:**

```
Refresh /admin
  ↓ (0ms) RootLayoutClient shows "Loading..."
  ↓ (100-500ms) AuthContext fires onAuthStateChanged
  ↓ (500-600ms) No session found → redirect to /login
  ↓ Click Sign Up
  ↓ Create auth account + user profile
  ↓ Firebase sets __session cookie
  ↓ Redirect back to /admin (via callbackUrl)
  ↓ RootLayoutClient checks auth again
  ↓ Session found + user loaded → show admin layout ✓
```

## Role Conflict Check

If you're logged in but still looping, check your user profile:

**Firestore Users Collection Structure:**

```
users/
├── {uid1}/
│   ├── email: "admin@example.com"
│   ├── fullName: "Admin User"
│   ├── role: "admin"  ← IMPORTANT!
│   └── company: "Crownshift"
└── {uid2}/
    ├── email: "client@example.com"
    ├── role: "client"
    └── ...
```

**Check in Admin Layout:**
The `src/app/admin/layout.tsx` does server-side check with `ADMIN_UID`:

```typescript
if (!decoded || decoded.uid !== ADMIN_UID) {
  // Not the admin user → redirect to /
  redirect("/");
}
```

This means: **Only the UID in your `.env.local` can access admin!**

### To Fix:

1. Get your Firebase UID when you sign up
2. Set `NEXT_PUBLIC_ADMIN_UID={your-uid}` in `.env.local`
3. Restart `npm run dev`

## Commands to Clear & Test

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev

# Test URLs:
# http://localhost:3000/admin
# http://localhost:3000/login
# http://localhost:3000/services
```

## Network Tab Debugging

Open DevTools → Network tab and look for:

1. **First redirect (unauthenticated):**

   - GET `/admin` → 307 redirect to `/login?callbackUrl=/admin`

2. **After login:**

   - POST `/api/auth/create-profile` → 200 OK
   - Sets `__session` cookie
   - GET `/admin` → 200 OK (shows admin layout) ✓

3. **If loop persists:**
   - GET `/admin` → 307 redirect to `/login` (repeated)
   - Check if `__session` cookie exists
   - Check if cookie value is valid JWT

## Emergency Fixes

### If Loop Continues:

**Option 1: Force Logout (in browser console)**

```javascript
// Clear all data
localStorage.clear();
sessionStorage.clear();
document.cookie = "__session=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
location.reload();
```

**Option 2: Disable Admin Redirect (temporary)**
Comment out the auth check in `src/app/admin/layout.tsx`:

```typescript
// TEMPORARILY DISABLED FOR DEBUGGING
// if (!decoded || decoded.uid !== ADMIN_UID) {
//   redirect('/');
// }
```

Then restart and test. Re-enable after you verify it works.

**Option 3: Check Middleware**
Look at `middleware.ts` to see if it's also redirecting:

```typescript
// If middleware is set to always redirect /admin to /login,
// it will fight with your layout.tsx auth check
```

## What Each File Does

| File                                    | Purpose                   | Auth Check                          |
| --------------------------------------- | ------------------------- | ----------------------------------- |
| `src/app/layout.tsx`                    | Root layout               | ❌ None (wraps everything)          |
| `src/components/root-layout-client.tsx` | Conditional navbar/footer | ✅ Loading state (prevents flicker) |
| `src/app/admin/layout.tsx`              | Admin sidebar + auth      | ✅ Server-side (checks ADMIN_UID)   |
| `src/app/admin/page.tsx`                | Dashboard content         | ✅ Inherited from layout            |
| `src/app/login/page.tsx`                | Login form                | ✅ Redirects if already logged in   |

## Summary

✅ **Loading state added** - Prevents premature redirects
✅ **Navbar hidden on admin** - Only admin sidebar shows
✅ **Admin layout has sidebar** - Full navigation visible
✅ **Clear error messages** - Easy to debug

**To test:** Clear cookies → restart dev → visit `/admin` → sign up → should see admin dashboard

If it still loops, check:

1. Is `__session` cookie created? (DevTools → Cookies)
2. Is `NEXT_PUBLIC_ADMIN_UID` set in `.env.local`?
3. Does your UID match the one in `.env.local`?
4. Run `npm run dev` with fresh `.next` folder
