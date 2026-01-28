# Admin Folder Restructuring Instructions

## Problem
The admin routes are nested incorrectly:
```
src/app/admin/
├── layout.tsx
└── admin/
    ├── page.tsx        ← Dashboard at /admin/admin (WRONG)
    └── shipments/
        └── [id]/page.tsx
```

This causes:
- ❌ Dashboard accessible at `/admin/admin` instead of `/admin`
- ❌ Shipments at `/admin/admin/shipments` instead of `/admin/shipments`
- ❌ Layout inheritance broken for nested routes

## Solution
Restructure to proper Next.js App Router layout hierarchy:
```
src/app/admin/
├── layout.tsx         ← Wraps all /admin/* routes (auth + sidebar)
├── page.tsx           ← Dashboard at /admin (CORRECT)
└── shipments/
    └── [id]/
        └── page.tsx   ← Inherits admin layout
```

## Step-by-Step Instructions

### Step 1: Move Dashboard File
Already completed. The admin dashboard from `src/app/admin/admin/page.tsx` has been moved to `src/app/admin/page.tsx`.

**Verify:**
```
✅ src/app/admin/page.tsx exists (contains AdminDashboard component)
```

### Step 2: Move Shipments Folder (Manual CLI)
The nested folder structure needs to be flattened. Move from:
```
src/app/admin/admin/shipments/ → src/app/admin/shipments/
```

**Commands:**
```powershell
# From Crownshift-main directory
mv src/app/admin/admin/shipments src/app/admin/shipments
rm -r src/app/admin/admin  # Remove now-empty folder
```

Or in Windows PowerShell:
```powershell
# From Crownshift-main directory
Move-Item -Path src/app/admin/admin/shipments -Destination src/app/admin/shipments
Remove-Item -Path src/app/admin/admin -Force
```

### Step 3: Update Admin Layout
The `src/app/admin/layout.tsx` is already properly positioned at the admin root level.

**Current structure is correct:**
- ✅ Excludes global navbar/footer
- ✅ Includes admin sidebar with navigation
- ✅ Wraps all `/admin/*` routes via layout inheritance
- ✅ Handles admin authentication

### Step 4: Verify Import Paths
The dashboard page at `src/app/admin/page.tsx` uses relative imports:
```typescript
import { getAdminAuth } from '@/firebase/server-init';
import ServicesForm from '@/components/admin/services-form';
```

These paths use `@` alias, so they're **already correct** and don't need adjustment.

### Step 5: Verify Layout Inheritance
After moving files, your route structure will be:

```
Route              File                                    Layout
─────────────────────────────────────────────────────────────────
/admin             src/app/admin/page.tsx                 admin/layout.tsx
/admin/shipments   src/app/admin/shipments/page.tsx       admin/layout.tsx
/admin/shipments/1 src/app/admin/shipments/[id]/page.tsx admin/layout.tsx
```

All routes under `/admin/*` will:
- ✅ Use the admin layout (with sidebar, no global navbar)
- ✅ Get authentication checked server-side
- ✅ Display user info in sidebar

## Post-Restructure Verification

After moving files, verify the structure:

```bash
tree src/app/admin/
```

Should show:
```
src/app/admin/
├── layout.tsx           (Admin-specific layout)
├── page.tsx             (Dashboard at /admin)
└── shipments/
    └── [id]/
        └── page.tsx     (Inherits admin layout)
```

## Testing Checklist

- [ ] Local development: `npm run dev`
- [ ] Navigate to `http://localhost:3000/admin` → See dashboard with sidebar
- [ ] Verify sidebar shows "Crownshift Admin" and user welcome
- [ ] Click "Dashboard" link → Stays at `/admin`
- [ ] Check browser DevTools → No layout duplication (no double navbar/footer)
- [ ] Navigate to shipment detail → Layout persists
- [ ] Build for production: `npm run build`
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Test on production: https://crownshift-main.vercel.app/admin

## Why This Works

**Next.js App Router Layout Inheritance:**
- `src/app/layout.tsx` = Global layout (navbar, footer, providers)
- `src/app/admin/layout.tsx` = Admin layout (sidebar, admin navbar, REPLACES global layout inside `/admin`)
- `src/app/admin/page.tsx` = Dashboard page (content only, rendered inside admin layout)
- `src/app/admin/shipments/[id]/page.tsx` = Shipment detail (inherits admin layout)

**The Key:** When you create a `layout.tsx` file in a folder, it becomes the wrapper for all pages in that folder and its subfolders. The global layout is NOT used inside the folder with its own layout.

## File Dependencies After Restructure

Files that work with this structure:
- ✅ `src/app/admin/layout.tsx` - Admin wrapper layout
- ✅ `src/app/admin/page.tsx` - Dashboard (imports auth, components from @/*)
- ✅ `src/app/admin/shipments/[id]/page.tsx` - Shipment details (inherits admin layout)
- ✅ All component imports using `@/` work correctly
