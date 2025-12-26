# Firestore Database Schema & Setup

## Collections Overview

### 1. services

Services offered by Crownshift Logistics

**Document ID**: Auto-generated
**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Service name (e.g., "Express Delivery") |
| description | string | Yes | Detailed description |
| price | number | Yes | Base price in dollars |
| isFeatured | boolean | Yes | Show on homepage |
| createdAt | timestamp | Yes | Creation timestamp |
| updatedAt | timestamp | No | Last update timestamp |

**Example Document**:

```json
{
  "title": "Express Delivery",
  "description": "Next-day delivery for urgent shipments",
  "price": 99.99,
  "isFeatured": true,
  "createdAt": "2024-12-16T10:00:00Z",
  "updatedAt": "2024-12-16T11:00:00Z"
}
```

---

### 2. offers

Promotional offers for services

**Document ID**: Auto-generated
**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| serviceId | string | Yes | Reference to services.id |
| discountPercent | number | Yes | Discount percentage (1-100) |
| description | string | Yes | Offer description |
| isActive | boolean | Yes | Whether offer is visible |
| createdAt | timestamp | Yes | Creation timestamp |
| updatedAt | timestamp | No | Last update timestamp |

**Example Document**:

```json
{
  "serviceId": "service_123",
  "discountPercent": 20,
  "description": "20% off for new customers this month",
  "isActive": true,
  "createdAt": "2024-12-16T10:00:00Z"
}
```

**Relationships**:

- Queries: `offers.serviceId` → `services.id`

---

### 3. reviews

Customer reviews and ratings

**Document ID**: Auto-generated
**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Reference to user UID |
| userName | string | Yes | Display name |
| rating | number | Yes | 1-5 stars |
| comment | string | Yes | Review text |
| serviceId | string | Yes | Reference to services.id |
| status | string | Yes | 'pending', 'approved', 'rejected' |
| createdAt | timestamp | Yes | Submission timestamp |
| approvedAt | timestamp | No | Approval timestamp |
| rejectedAt | timestamp | No | Rejection timestamp |

**Example Document**:

```json
{
  "userId": "user_456",
  "userName": "John Doe",
  "rating": 5,
  "comment": "Excellent service! Very reliable and fast.",
  "serviceId": "service_123",
  "status": "approved",
  "createdAt": "2024-12-16T10:00:00Z",
  "approvedAt": "2024-12-16T11:00:00Z"
}
```

**Indexes**:

- Composite: `status`, `createdAt`
- Single: `status`
- Single: `serviceId`

---

### 4. bookings

Service bookings/orders

**Document ID**: Auto-generated
**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Reference to user UID |
| serviceId | string | Yes | Reference to services.id |
| status | string | Yes | 'pending', 'completed', 'cancelled' |
| createdAt | timestamp | Yes | Booking timestamp |

**Example Document**:

```json
{
  "userId": "user_456",
  "serviceId": "service_123",
  "status": "completed",
  "createdAt": "2024-12-10T10:00:00Z"
}
```

**Purpose**: Validates review eligibility (user can only review completed services)

**Indexes**:

- Composite: `userId`, `serviceId`, `status`

---

### 5. users

User profiles

**Document ID**: Firebase Auth UID
**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| name | string | No | Display name |
| createdAt | timestamp | Yes | Account creation |

**Example Document**:

```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

**Note**: Document ID should match `auth.uid` for integrity

---

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow all reads (public data)
    match /{document=**} {
      allow read: if true;
    }

    // Services: Admin only for writes
    match /services/{document=**} {
      allow write: if isAdmin();
    }

    // Offers: Admin only for writes
    match /offers/{document=**} {
      allow write: if isAdmin();
    }

    // Reviews: Authenticated users can create
    match /reviews/{document=**} {
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Bookings: Authenticated users for own, admin for all
    match /bookings/{document=**} {
      allow create: if request.auth != null;
      allow read, update: if request.auth.uid == resource.data.userId || isAdmin();
      allow delete: if isAdmin();
    }

    // Users: Own profile reads, admin for all
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId || isAdmin();
    }

    // Helper function: Check if user is admin
    function isAdmin() {
      return request.auth.uid == "YOUR_ADMIN_UID_HERE";
    }
  }
}
```

---

## Query Examples

### Get Active Offers

```javascript
db.collection("offers").where("isActive", "==", true).get();
```

### Get Approved Reviews for Service

```javascript
db.collection("reviews")
  .where("serviceId", "==", "service_123")
  .where("status", "==", "approved")
  .get();
```

### Check Review Eligibility

```javascript
db.collection("bookings")
  .where("userId", "==", userId)
  .where("serviceId", "==", serviceId)
  .where("status", "==", "completed")
  .get();
```

### Get Pending Reviews (Admin)

```javascript
db.collection("reviews")
  .where("status", "==", "pending")
  .orderBy("createdAt", "desc")
  .get();
```

---

## Database Setup Checklist

- [ ] Create `services` collection (start with empty)
- [ ] Create `offers` collection (start with empty)
- [ ] Create `reviews` collection (start with empty)
- [ ] Create `bookings` collection (start with empty)
- [ ] Create `users` collection (will auto-populate from auth)
- [ ] Create indexes for `reviews` composite queries
- [ ] Create indexes for `bookings` composite queries
- [ ] Update Firestore rules with admin UID
- [ ] Test read/write permissions
- [ ] Load sample data (optional)

---

## Sample Data Setup (Optional)

Run these commands in Firebase Console → Firestore → Seed Data

### Sample Service 1

```json
{
  "title": "Standard Shipping",
  "description": "Reliable 3-5 day shipping to anywhere in the country",
  "price": 49.99,
  "isFeatured": true
}
```

### Sample Service 2

```json
{
  "title": "Express Overnight",
  "description": "Guaranteed next-day delivery for urgent items",
  "price": 99.99,
  "isFeatured": true
}
```

### Sample Offer 1

```json
{
  "serviceId": "[service_1_id]",
  "discountPercent": 15,
  "description": "Limited time: 15% off standard shipping",
  "isActive": true
}
```

---

## Performance Tips

1. **Indexes**: Firestore will suggest composite indexes when needed
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Denormalization**: Store frequently accessed data (e.g., service title) in reviews
4. **Cache**: Use SWR or React Query for client-side caching
5. **Batch Operations**: Use batch writes for multiple document updates

---

## Monitoring

Check Firestore usage in Firebase Console:

- **Reads/Writes**: Monitor daily quota usage
- **Storage**: Track document count and size
- **Indexes**: Verify created indexes are being used

Free tier limits:

- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage
- Max 1 MB document size
