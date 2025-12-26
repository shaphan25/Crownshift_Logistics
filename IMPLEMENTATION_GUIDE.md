# Crownshift Logistics - Implementation Guide

## Overview

This document describes the complete implementation of a Next.js 14 application with Firebase authentication, Firestore data management, and admin dashboard, deployed on Vercel with free-tier constraints.

## Project Structure

```
src/
├── app/
│   ├── admin/page.tsx                 # Admin dashboard with analytics
│   ├── login/page.tsx                 # Authentication page (email, Google, socials)
│   ├── page.tsx                       # Home page with offers carousel
│   ├── reviews/page.tsx               # Reviews listing page
│   ├── services/page.tsx              # Services listing page
│   └── actions.ts                     # Server Actions for Firestore operations
├── components/
│   ├── admin/
│   │   ├── services-form.tsx          # Services CRUD form
│   │   ├── offers-form.tsx            # Offers CRUD form
│   │   └── reviews-approval-form.tsx  # Review approval interface
│   ├── offers-carousel.tsx            # Home page offers carousel
│   └── [ui components]                # Shadcn/ui components
├── firebase/
│   ├── config.ts                      # Firebase configuration
│   ├── provider.tsx                   # Firebase context provider
│   ├── client-provider.tsx            # Client-side Firebase initialization
│   ├── server-init.ts                 # Admin SDK initialization
│   └── [other firebase utilities]
├── hooks/
│   └── use-auth.ts                    # Authentication hook
└── lib/
    └── utils.ts                       # Utility functions

middleware.ts                          # Auth middleware for protected routes
```

## Features Implemented

### 1. Authentication (Task 2)

- **Email/Password**: Full signup and login support via Firebase Auth
- **Google OAuth**: Real Google Sign-in integration
- **Simulated Social Logins**: Yahoo, Outlook, Apple buttons with demo functionality
- **Auth Guard Middleware**: Redirects unauthenticated users from protected routes to `/login?callbackUrl=<original_path>`
- **Post-Login Redirect**: Users are redirected to callback URL or default dashboard

**Files:**

- [src/app/login/page.tsx](src/app/login/page.tsx) - Main auth component
- [middleware.ts](middleware.ts) - Auth middleware
- [src/hooks/use-auth.ts](src/hooks/use-auth.ts) - useAuth hook

### 2. Data Management - Firestore (Task 3)

#### Firestore Collections Schema

**services**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "price": "number",
  "isFeatured": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**offers**

```json
{
  "id": "string",
  "serviceId": "string",
  "discountPercent": "number",
  "description": "string",
  "isActive": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**reviews**

```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "rating": "number(1-5)",
  "comment": "string",
  "serviceId": "string",
  "status": "pending|approved|rejected",
  "createdAt": "timestamp",
  "approvedAt": "timestamp (optional)",
  "rejectedAt": "timestamp (optional)"
}
```

**bookings** (for review eligibility)

```json
{
  "id": "string",
  "userId": "string",
  "serviceId": "string",
  "status": "pending|completed|cancelled",
  "createdAt": "timestamp"
}
```

**users** (for customer count)

```json
{
  "uid": "string",
  "email": "string",
  "name": "string",
  "createdAt": "timestamp"
}
```

**Files:**

- [src/app/actions.ts](src/app/actions.ts) - Server Actions for all Firestore operations

### 3. Landing Page with Carousel (Task 3.2)

- Displays active offers (where `offers.isActive === true`)
- Client Component that fetches from Firestore
- Click "Book Now" triggers auth guard logic
- Carousel navigation with dot indicators

**File:** [src/components/offers-carousel.tsx](src/components/offers-carousel.tsx)

### 4. Services Page (Task 3.3)

- Lists all services from Firestore
- Shows featured services with special badge
- "Book Service" button with auth guard
- Loading skeleton states
- Responsive grid layout

**File:** [src/app/services/page.tsx](src/app/services/page.tsx)

### 5. Reviews System (Task 4)

#### Review Submission (4.1)

- Server Action validates user has completed service
- Checks `bookings` collection for completed service
- Creates review with `status: 'pending'`
- Prevents duplicate reviews

**Function:** `submitReview()` in [src/app/actions.ts](src/app/actions.ts)

#### Reviews Page (4.2)

- Displays all approved reviews
- Calculates average rating
- Shows total review count
- Rating distribution breakdown
- Responsive card layout

**File:** [src/app/reviews/page.tsx](src/app/reviews/page.tsx)

### 6. Admin Dashboard (Task 5)

#### Security (5.1)

- Protected by `ADMIN_UID` environment variable
- Server-side authorization check
- Redirects unauthorized users to login
- Requires authentication middleware

#### Analytics (5.2)

- **Total Customers**: Count from `users` collection
- **Total Bookings**: Count from `bookings` collection
- **Pending Reviews**: Count of reviews with `status: 'pending'`

#### CRUD Forms (5.3)

**Services Form:**

- Add/Edit/Delete services
- Form validation with Zod
- Real-time list updates
- Edit mode with cancel option
- Featured service toggle

**Offers Form:**

- Add/Edit/Delete offers
- Service dropdown selector
- Discount percentage input (1-100%)
- Active/Inactive toggle
- Displays calculated discount price
- Real-time list updates

**Reviews Approval Form:**

- Lists pending reviews
- Approve/Reject buttons
- Updates review status in Firestore
- Real-time updates

**Files:**

- [src/app/admin/page.tsx](src/app/admin/page.tsx) - Main dashboard
- [src/components/admin/services-form.tsx](src/components/admin/services-form.tsx)
- [src/components/admin/offers-form.tsx](src/components/admin/offers-form.tsx)
- [src/components/admin/reviews-approval-form.tsx](src/components/admin/reviews-approval-form.tsx)

## Environment Configuration

### .env.local Template

```
# Firebase Client Configuration (exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Configuration
NEXT_PUBLIC_ADMIN_UID=admin_user_uid_from_firebase

# Firebase Admin SDK (server-only, never expose)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key_from_service_account
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com

# AI/Genkit Configuration (already set)
GENAI_PROVIDER=google
GOOGLE_GENAI_API_KEY=your_genai_api_key
```

## Setup Instructions

### 1. Firebase Project Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication methods:
   - Email/Password
   - Google OAuth
3. Create a Firestore database (Start in test mode for development)
4. Get Web API keys from Project Settings
5. Create a service account:
   - Go to Project Settings → Service Accounts
   - Generate new private key (JSON format)
   - Store securely (never commit to repo)

### 2. Environment Variables

1. Copy credentials to `.env.local` (already configured)
2. Set `NEXT_PUBLIC_ADMIN_UID`:
   - Create a test user in Firebase Auth
   - Copy their UID from Firebase Console
   - Add to `.env.local`

### 3. Database Rules (Firestore)

```firebase-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reading public collections
    match /{document=**} {
      allow read: if true;
    }

    // Authenticated users can write reviews
    match /reviews/{document=**} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Only admin can modify services and offers
    match /services/{document=**} {
      allow write: if request.auth.uid == "YOUR_ADMIN_UID";
    }

    match /offers/{document=**} {
      allow write: if request.auth.uid == "YOUR_ADMIN_UID";
    }

    // Bookings management
    match /bookings/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Free-Tier Constraints Addressed

✅ **Authentication**: Firebase Auth free tier supports unlimited users
✅ **Database**: Firestore free tier provides 1GB storage, 50K reads/day
✅ **Storage**: Not used - leveraging Firebase Auth storage
✅ **Functions**: Server Actions minimize server function usage
✅ **Hosting**: Deploying to Vercel free tier (up to 100 deployments/month)
✅ **Cost Optimization**:

- RSC for static content (no client-side rendering cost)
- Client Components only for interactive features
- Efficient data fetching with Server Actions
- Cached responses where possible
- Pagination-ready for large datasets

## Deployment to Vercel

### 1. Prepare Repository

```bash
# Push code to GitHub
git add .
git commit -m "Implement full feature set"
git push origin main
```

### 2. Vercel Configuration

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel --env-file .env.local
```

### 3. Environment Variables in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add all `.env.local` variables
5. Redeploy

### 4. Post-Deployment

1. Test authentication flow
2. Create sample data in Firestore
3. Verify admin dashboard access
4. Monitor usage in Firebase Console

## API Endpoints / Server Actions

### Services

- `getServices()` - Fetch all services
- `addService(data)` - Create service
- `updateService(id, data)` - Update service
- `deleteService(id)` - Delete service

### Offers

- `getOffers()` - Fetch all offers
- `getActiveOffers()` - Fetch active offers only
- `addOffer(data)` - Create offer
- `updateOffer(id, data)` - Update offer
- `deleteOffer(id)` - Delete offer

### Reviews

- `getApprovedReviews()` - Fetch published reviews
- `submitReview(data)` - Submit new review (requires completed booking)
- `getPendingReviews()` - Admin: get pending reviews
- `approveReview(id)` - Admin: approve review
- `rejectReview(id)` - Admin: reject review

### Analytics

- `getTotalCustomers()` - Get user count
- `getTotalBookings()` - Get booking count

## User Flows

### Customer Flow

1. **Visit home page** → See carousel of active offers
2. **Click "Book Now"** → Redirects to login if not authenticated
3. **After login** → Can see services and reviews
4. **Submit review** → Review appears as pending
5. **Admin approves** → Review appears on reviews page

### Admin Flow

1. **Login as admin** (UID matches `NEXT_PUBLIC_ADMIN_UID`)
2. **Access /admin** → Dashboard with analytics
3. **Manage Services** → CRUD operations
4. **Manage Offers** → Create/edit/delete with active toggle
5. **Approve Reviews** → Moderate customer feedback

## Best Practices Implemented

✅ **Security**

- Admin UID check on server
- Middleware protects routes
- Firestore rules validate access
- No sensitive data exposed to client

✅ **Performance**

- React Server Components for static content
- Client Components only where needed
- Server Actions for data mutations
- Image optimization ready

✅ **UX**

- Loading skeletons
- Toast notifications
- Form validation with Zod
- Responsive design
- Error handling

✅ **Code Quality**

- TypeScript throughout
- Proper error handling
- Separation of concerns
- Reusable components

## Testing Checklist

- [ ] Firebase authentication works (email, Google, simulated socials)
- [ ] Middleware redirects to login for protected routes
- [ ] Carousel displays active offers
- [ ] Services page loads and displays all services
- [ ] Reviews page calculates stats correctly
- [ ] Admin can CRUD services
- [ ] Admin can CRUD offers with discount calculation
- [ ] Admin can approve/reject reviews
- [ ] Pagination/sorting ready for scale
- [ ] Mobile responsive
- [ ] Environment variables configured in Vercel

## Troubleshooting

### "Firebase: Missing Project ID"

- Add `NEXT_PUBLIC_FIREBASE_PROJECT_ID` to `.env.local`
- Verify it matches your Firebase console

### "Admin access denied"

- Check `NEXT_PUBLIC_ADMIN_UID` matches logged-in user
- User must exist in Firebase Auth first

### "Firestore document not found"

- Ensure collections exist in Firestore console
- Check Firestore rules allow reads

### "Middleware not redirecting"

- Verify `/middleware.ts` is at project root
- Check auth cookie is being set

## Future Enhancements

- [ ] Payment integration (Stripe on free tier)
- [ ] Email notifications
- [ ] Real booking system with payment
- [ ] User profile management
- [ ] Search and filters on services/reviews
- [ ] Pagination for large datasets
- [ ] PDF invoice generation
- [ ] SMS notifications

## Support

For issues or questions:

1. Check Firebase documentation: https://firebase.google.com/docs
2. Review Next.js App Router: https://nextjs.org/docs/app
3. Vercel deployment guide: https://vercel.com/docs
