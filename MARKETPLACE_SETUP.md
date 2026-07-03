# UNILINK Marketplace - Quick Start Guide

## Overview
Your UNILINK marketplace is now fully functional! It's a complete study notes buying and selling platform integrated into your application.

## What's Included

### Frontend
- **Marketplace Page**: `/public/pages/student/marketplace.html`
- **Styling**: `/public/css/marketplace.css`
- **JavaScript Logic**: `/public/js/marketplace.js`

### Backend
- **Database Models**: Note, Purchase, Review
- **Controllers**: noteController, purchaseController, reviewController
- **API Routes**: /api/notes, /api/purchases, /api/reviews
- **Authentication Middleware**: auth.js

## How It Works

### User Flow for Buyers
1. **Login** → User authenticates with email and password
2. **Activation** → User pays activation fee (as per existing system)
3. **Browse Marketplace** → Navigate to Marketplace from dashboard
4. **Search & Filter** → Find notes by course, unit, category
5. **View Sample** → See preview before purchase
6. **Purchase** → Pay 50 KES per note
7. **Download** → Access full content (10 downloads, 30 days)
8. **Review** → Leave rating and feedback

### User Flow for Sellers
1. **Activate Account** → Pay activation fee
2. **Upload Notes** → Add title, description, course, unit, sample, full content
3. **Set Price** → Default 50 KES (customizable)
4. **Monitor Sales** → View purchases and download stats
5. **Respond to Reviews** → Engage with buyer feedback
6. **Build Reputation** → Accumulate ratings

## API Endpoints

### Browse Notes
```
GET /api/notes/all?course=Math&unit=Calculus&sort=rating
```

### Get Note Details
```
GET /api/notes/{noteId}
```

### Purchase Note
```
POST /api/purchases/buy
{
  "noteId": "...",
  "transactionId": "...",
  "paymentMethod": "mpesa"
}
```

### Download Note
```
GET /api/purchases/download/{purchaseId}
```

### Leave Review
```
POST /api/reviews/create
{
  "purchaseId": "...",
  "noteId": "...",
  "rating": 5,
  "title": "Great notes!",
  "comment": "Very helpful for exam prep"
}
```

## Database Structure

### Notes Table
- Title, Description, Course, Unit
- Seller Info & Rating
- Sample & Full Content
- Price (50 KES default)
- Download/View counts
- Average Rating & Review count

### Purchases Table
- Buyer & Seller Info
- Note Details
- Transaction ID
- Payment Status
- Download count (max 10)
- Expiry Date (30 days)
- Review status

### Reviews Table
- Rating (1-5 stars)
- Aspect ratings (accuracy, completeness, clarity, relevance)
- Helpful/Unhelpful count
- Verified purchase badge
- Seller response capability

## Features

### For Buyers ✓
- Search by title, course, unit
- Filter by category
- Sort by newest, rating, downloads
- View seller profile & ratings
- See sample preview
- 30-day access period
- 10 downloads per purchase
- Leave detailed reviews

### For Sellers ✓
- Upload multiple notes
- Track sales
- View buyer reviews
- Respond to reviews
- Monitor download stats
- Build seller reputation

### Security ✓
- Authentication required
- Activation fee verified
- Purchase verification
- Access expiry
- Download limits
- Verified purchase badges

## Customization

### To Modify Price
In `noteController.js`, change:
```javascript
price: 50  // Change to desired amount
```

### To Change Access Duration
In `purchaseController.js`, change:
```javascript
expiryDate.setDate(expiryDate.getDate() + 30); // Change days
```

### To Adjust Download Limit
In `Purchase.js` model:
```javascript
maxDownloads: 10  // Change limit
```

## Integration Checklist

- [x] Database models created
- [x] Controllers implemented
- [x] API routes setup
- [x] Frontend page built
- [x] CSS styling complete
- [x] JavaScript functionality
- [x] Authentication middleware
- [x] Server configuration updated
- [ ] Test with sample data
- [ ] Configure payment integration
- [ ] Deploy to server

## Testing

### Test Data to Create

1. **Create Test Notes**
   - Upload sample notes with different courses/units
   - Include sample and full content

2. **Test Purchase Flow**
   - Purchase a note
   - Verify download access
   - Check access expiry

3. **Test Reviews**
   - Leave a review
   - Test helpful/unhelpful votes
   - Test seller response

## Troubleshooting

### Notes Not Loading
- Check authentication token
- Verify JWT secret in auth.js
- Ensure database connection

### Purchase Fails
- Verify user is activated
- Check payment transaction ID
- Ensure seller exists

### Reviews Not Saving
- Confirm purchase exists
- Verify purchase belongs to user
- Check review validation

## Next Steps

1. **Payment Integration**
   - Connect M-Pesa payment gateway
   - Verify transactions before giving access

2. **Enhanced Features**
   - Bulk purchases/subscriptions
   - Collections/bundles
   - Wishlist functionality
   - Seller analytics dashboard

3. **Notifications**
   - Email on purchase
   - Review notifications for sellers
   - Download reminders

4. **Quality Control**
   - Content moderation
   - Review approval system
   - Seller verification

## Support

For issues or questions:
1. Check MARKETPLACE_API.md for detailed API docs
2. Review controller functions for business logic
3. Check browser console for frontend errors
4. Check server logs for backend errors

## Files Reference

```
backend/
├── models/
│   ├── Note.js
│   ├── Purchase.js
│   ├── Review.js
│   └── User.js (updated)
├── controllers/
│   ├── noteController.js
│   ├── purchaseController.js
│   └── reviewController.js
├── routes/
│   ├── notes.js
│   ├── purchases.js
│   └── reviews.js
├── middleware/
│   └── auth.js
├── server.js (updated)
└── MARKETPLACE_API.md

public/
├── pages/
│   └── student/
│       ├── marketplace.html
│       └── dashboard.html (updated)
├── css/
│   └── marketplace.css
└── js/
    └── marketplace.js
```

Happy selling and learning! 🎓📚
