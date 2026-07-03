# Marketplace API Documentation

## Overview
This is a complete notes marketplace system that allows students to buy, sell, and review study notes.

## Features
- Browse and search study notes by course, unit, and category
- Purchase notes with secure M-Pesa payment integration
- Sample preview before purchase
- 30-day access with 10 downloads per purchase
- Review and rating system
- Seller profiles and ratings

## Database Models

### Note Model
```javascript
{
  title: String,
  description: String,
  course: String,
  unit: String,
  university: String,
  sellerId: ObjectId (User),
  sellerName: String,
  sellerRating: Number (0-5),
  price: Number (default: 50),
  category: String (lecture_notes, past_papers, revision_guide, summary),
  sampleContent: String,
  fullContent: String,
  fileType: String (pdf, docx, txt, jpg, png),
  fileSize: Number,
  downloads: Number,
  views: Number,
  totalReviews: Number,
  averageRating: Number (0-5),
  tags: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Purchase Model
```javascript
{
  buyerId: ObjectId (User),
  buyerName: String,
  noteId: ObjectId (Note),
  noteTitle: String,
  sellerId: ObjectId (User),
  sellerName: String,
  amount: Number,
  transactionId: String,
  paymentMethod: String (mpesa, card),
  paymentStatus: String (pending, completed, failed, refunded),
  downloadCount: Number,
  maxDownloads: Number (default: 10),
  lastDownloadDate: Date,
  expiryDate: Date (30 days from purchase),
  hasReviewed: Boolean,
  reviewId: ObjectId (Review),
  isPurchased: Boolean,
  purchaseDate: Date
}
```

### Review Model
```javascript
{
  purchaseId: ObjectId (Purchase),
  noteId: ObjectId (Note),
  reviewerId: ObjectId (User),
  reviewerName: String,
  sellerId: ObjectId (User),
  rating: Number (1-5),
  title: String,
  comment: String,
  aspects: {
    accuracy: Number (1-5),
    completeness: Number (1-5),
    clarity: Number (1-5),
    relevance: Number (1-5)
  },
  helpful: Number,
  unhelpful: Number,
  sellerResponse: {
    comment: String,
    respondedAt: Date
  },
  status: String (pending, approved, rejected),
  isVerifiedPurchase: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Notes Endpoints

#### Get All Notes
```
GET /api/notes/all
Query Parameters:
  - page: Number (default: 1)
  - limit: Number (default: 10)
  - course: String (optional)
  - unit: String (optional)
  - search: String (optional)
  - category: String (optional)
  - sort: String (newest, rating, downloads)

Response:
{
  success: Boolean,
  data: [Note],
  pagination: {
    total: Number,
    page: Number,
    pages: Number
  }
}
```

#### Get Note by ID
```
GET /api/notes/:id
Response:
{
  success: Boolean,
  data: Note,
  hasFullAccess: Boolean
}
```

#### Get Courses
```
GET /api/notes/courses/list
Response:
{
  success: Boolean,
  data: [String] // Array of course names
}
```

#### Get Units by Course
```
GET /api/notes/courses/:course/units
Response:
{
  success: Boolean,
  data: [String] // Array of unit names
}
```

#### Upload Note (Seller)
```
POST /api/notes/upload
Headers: Authorization: Bearer <token>
Body:
{
  title: String (required),
  description: String (required),
  course: String (required),
  unit: String (required),
  university: String (required),
  category: String (required),
  sampleContent: String (required),
  fullContent: String (required),
  fileType: String (required)
}

Response:
{
  success: Boolean,
  message: String,
  data: Note
}
```

#### Get Seller Info
```
GET /api/notes/seller/:sellerId/info
Response:
{
  success: Boolean,
  data: {
    seller: User,
    notesCount: Number,
    totalDownloads: Number
  }
}
```

### Purchases Endpoints

#### Purchase Note
```
POST /api/purchases/buy
Headers: Authorization: Bearer <token>
Body:
{
  noteId: String (required),
  transactionId: String (required),
  paymentMethod: String (required)
}

Response:
{
  success: Boolean,
  message: String,
  data: Purchase
}
```

#### Download Note
```
GET /api/purchases/download/:purchaseId
Headers: Authorization: Bearer <token>

Response:
{
  success: Boolean,
  data: {
    title: String,
    content: String,
    fileType: String,
    downloadCount: Number,
    maxDownloads: Number,
    expiryDate: Date
  }
}
```

#### Get User's Purchases
```
GET /api/purchases/my-purchases
Headers: Authorization: Bearer <token>
Query Parameters:
  - page: Number (default: 1)
  - limit: Number (default: 10)

Response:
{
  success: Boolean,
  data: [Purchase],
  pagination: {...}
}
```

#### Get Seller's Sales
```
GET /api/purchases/my-sales
Headers: Authorization: Bearer <token>
Query Parameters:
  - page: Number (default: 1)
  - limit: Number (default: 10)

Response:
{
  success: Boolean,
  data: [Purchase],
  pagination: {...}
}
```

### Reviews Endpoints

#### Create Review
```
POST /api/reviews/create
Headers: Authorization: Bearer <token>
Body:
{
  purchaseId: String (required),
  noteId: String (required),
  rating: Number (1-5, required),
  title: String (required),
  comment: String (required),
  aspects: {
    accuracy: Number (1-5),
    completeness: Number (1-5),
    clarity: Number (1-5),
    relevance: Number (1-5)
  }
}

Response:
{
  success: Boolean,
  message: String,
  data: Review
}
```

#### Get Note's Reviews
```
GET /api/reviews/note/:noteId
Query Parameters:
  - page: Number (default: 1)
  - limit: Number (default: 10)
  - sort: String (helpful, rating-high, rating-low)

Response:
{
  success: Boolean,
  data: [Review],
  pagination: {...}
}
```

#### Mark Review Helpful
```
POST /api/reviews/:reviewId/helpful

Response:
{
  success: Boolean,
  message: String,
  data: Review
}
```

#### Mark Review Unhelpful
```
POST /api/reviews/:reviewId/unhelpful

Response:
{
  success: Boolean,
  message: String,
  data: Review
}
```

#### Seller Responds to Review
```
POST /api/reviews/:reviewId/respond
Headers: Authorization: Bearer <token>
Body:
{
  comment: String (required)
}

Response:
{
  success: Boolean,
  message: String,
  data: Review
}
```

#### Get Seller's Reviews
```
GET /api/reviews/seller/my-reviews
Headers: Authorization: Bearer <token>
Query Parameters:
  - page: Number (default: 1)
  - limit: Number (default: 10)

Response:
{
  success: Boolean,
  data: [Review],
  pagination: {...}
}
```

## Frontend Pages

### Marketplace Page
**Location:** `/public/pages/student/marketplace.html`

Features:
- Browse all available notes
- Filter by course, unit, category
- Search functionality
- Sort by newest, rating, or downloads
- View note details in modal
- Purchase notes with single click
- View reviews and seller ratings
- View seller profiles

### Requirements
- User must be authenticated
- User must have paid activation fee
- 50 KES required per note purchase

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install mongoose express cors
```

### 2. Update Server Configuration
Add the following imports to your `server.js`:
```javascript
const notesRoutes = require('./routes/notes');
const purchasesRoutes = require('./routes/purchases');
const reviewsRoutes = require('./routes/reviews');
```

Register the routes:
```javascript
app.use('/api/notes', notesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/reviews', reviewsRoutes);
```

### 3. Authentication Middleware
Ensure you have authentication middleware in place:
```javascript
// middleware/auth.js
exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  // Verify token and set req.user
  // Implementation depends on your auth system
  next();
};
```

## Usage Flow

### For Buyers
1. User logs in with credentials
2. User pays activation fee
3. User browses marketplace
4. User views note sample preview
5. User clicks "Purchase & Download"
6. Payment processed via M-Pesa
7. User gets 30-day access
8. User can download up to 10 times
9. User can leave review after purchase

### For Sellers
1. User creates account
2. User pays activation fee
3. User uploads notes with:
   - Title, description
   - Course and unit details
   - Sample and full content
   - Category and file type
4. Notes appear in marketplace
5. Seller receives payments
6. Seller can view sales and reviews
7. Seller can respond to reviews

## Security Features
- Authentication required for purchases
- Activation fee prevents spam
- Purchase verification before download
- Download limits (10 per purchase)
- Access expiry (30 days)
- Verified purchase badges on reviews
- Seller response validation

## Future Enhancements
- Bulk purchases/subscriptions
- Seller collections/bundles
- Advanced recommendation system
- Wishlist feature
- User messaging/support
- Analytics dashboard for sellers
- Refund system
- Note versions/updates
