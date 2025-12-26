# Quick Start Guide - Crownshift Logistics

## 30-Minute Setup

### Step 1: Environment Configuration (5 min)

1. Open [Firebase Console](https://console.firebase.google.com)
2. Copy your credentials to `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
3. For admin functionality, create a test user and add their UID:
   ```bash
   NEXT_PUBLIC_ADMIN_UID=admin_user_uid_from_firebase_console
   ```

### Step 2: Enable Firebase Auth Methods (5 min)

1. Go to Firebase Console → Authentication
2. Enable Sign-in Methods:
   - ✅ Email/Password
   - ✅ Google

### Step 3: Create Firestore Collections (5 min)

1. Go to Firebase Console → Firestore Database
2. Create collections (click "+ Start collection"):
   - **services** (start empty)
   - **offers** (start empty)
   - **reviews** (start empty)
   - **bookings** (start empty)
   - **users** (will auto-populate)

### Step 4: Update Firestore Rules (5 min)

Copy this to Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
    }
    match /services/{document=**} {
      allow write: if request.auth.uid == "YOUR_ADMIN_UID_HERE";
    }
    match /offers/{document=**} {
      allow write: if request.auth.uid == "YOUR_ADMIN_UID_HERE";
    }
    match /reviews/{document=**} {
      allow create: if request.auth != null;
      allow update: if request.auth.uid == "YOUR_ADMIN_UID_HERE";
    }
  }
}
```

### Step 5: Run Locally (5 min)

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## Test the Features

### Test 1: Authentication

1. Go to `/login`
2. Click "Sign Up"
3. Create account with email/password
4. Test Google Sign-in
5. Test simulated social logins (Yahoo, Outlook, Apple)

### Test 2: Home Page

1. Should see "Special Offers" carousel (empty until you add offers)
2. Click "Book Now" → Should redirect to login if not authenticated

### Test 3: Services Page

1. Go to `/services`
2. Should see "No services" message
3. Need to add services via admin panel

### Test 4: Admin Dashboard

1. Go to `/admin`
2. If not logged in as admin, you'll see error
3. **Log in as your admin user** (UID must match `NEXT_PUBLIC_ADMIN_UID`)
4. Should see dashboard with stats and forms

### Test 5: Add Sample Data

From Admin Dashboard:

1. **Services Tab** → Add:

   - Title: "Standard Shipping"
   - Description: "3-5 day delivery"
   - Price: 49.99
   - Click "Create Service"

2. **Offers Tab** → Add:

   - Select service just created
   - Discount: 15%
   - Description: "15% off for this month"
   - Click "Create Offer"

3. Go home → Should see offer in carousel

---

## Key Routes

| Route              | Access     | Purpose                 |
| ------------------ | ---------- | ----------------------- |
| `/`                | Public     | Home page with carousel |
| `/services`        | Public     | Services listing        |
| `/reviews`         | Public     | Reviews with stats      |
| `/login`           | Public     | Authentication          |
| `/admin`           | Admin only | Dashboard & CRUD forms  |
| `/admin/dashboard` | Admin only | Alternative dashboard   |

---

## Important Notes

⚠️ **Never commit `.env.local`** - It's in `.gitignore`

⚠️ **Admin UID must match exactly** - Case-sensitive string from Firebase

⚠️ **Test mode vs Production** - Start with Firestore test mode for development

✅ **Free tier usage** - All features work with Firebase free tier

✅ **Mobile responsive** - All pages are mobile-friendly

---

## Troubleshooting

### Issue: "Firebase not initialized"

**Solution**: Check `.env.local` has all required keys and `npm run dev` is running

### Issue: "Admin access denied"

**Solution**:

1. Verify user is logged in as the admin user
2. Check `NEXT_PUBLIC_ADMIN_UID` matches Firebase Console user UID
3. Refresh page after login

### Issue: "No services showing"

**Solution**:

1. Log in as admin
2. Go to `/admin`
3. Click "Services" tab
4. Add a service
5. Return to home page

### Issue: "Carousel not showing"

**Solution**:

1. Carousel only shows if you have active offers
2. Add a service, then add an offer for that service
3. Ensure offer has `isActive: true`

---

## Next Steps

1. ✅ Complete setup above
2. ✅ Test all features locally
3. ✅ Add your own services and offers
4. ✅ Deploy to Vercel (see IMPLEMENTATION_GUIDE.md)
5. ✅ Set up custom domain
6. ✅ Configure email (optional - use Firebase extensions)

---

## Need Help?

- **Firebase Docs**: https://firebase.google.com/docs/firestore
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Implementation Guide**: See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Database Schema**: See [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md)

---

## Features Checklist

- [x] Email/Password authentication
- [x] Google OAuth
- [x] Simulated social logins
- [x] Auth middleware for protected routes
- [x] Home page with offers carousel
- [x] Services listing page
- [x] Reviews page with stats
- [x] Admin dashboard with analytics
- [x] Services CRUD
- [x] Offers CRUD with discount calculation
- [x] Review approval system
- [x] Firestore integration
- [x] Server Actions for data operations
- [x] Responsive design
- [x] TypeScript throughout
- [x] Free-tier optimized

Enjoy! 🚀
