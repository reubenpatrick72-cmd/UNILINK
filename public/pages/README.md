# UniLink Frontend - Student Notes Marketplace

This directory contains the HTML pages for the UniLink student notes marketplace platform. The frontend provides a clean, responsive interface for buyers, sellers, and administrators to interact with the marketplace.

## Overview

The frontend is built with pure HTML5, CSS3, and JavaScript (ES6+), integrated with Supabase for authentication, data management, and file storage. The design is mobile-first and fully responsive for optimal user experience across all devices.

## Features

### For Buyers
- Browse and search notes by university, course, and subject
- View detailed note information including ratings and seller profiles
- Secure M-Pesa payment integration for purchases
- Instant PDF download after purchase
- Purchase history and tracking
- Rating and review system for purchased notes

### For Sellers
- Upload study notes (PDF format, max 10MB)
- Set pricing and provide detailed descriptions
- Track upload approval status
- Monitor sales performance and earnings
- Request earnings withdrawal via M-Pesa
- View ratings and reviews from buyers

### For Administrators
- Dashboard with platform statistics and analytics
- Content moderation (approve/reject notes)
- User management and verification
- Transaction monitoring and oversight
- Platform performance metrics

## Page Structure

### Authentication Pages

**`auth/`**
- `register.html` — User registration with university email verification
- `login.html` — User login with email/password authentication
- `forgot-password.html` — Password recovery flow
- `verify-email.html` — Email verification confirmation

### Marketplace Pages

**`marketplace/`**
- `browse.html` — Main marketplace page with search and filtering
- `note-detail.html` — Detailed view of individual notes with purchase option
- `search-results.html` — Search results with advanced filtering

### Buyer Pages

**`buyer/`**
- `dashboard.html` — Buyer dashboard showing purchase history and recommendations
- `purchases.html` — Complete purchase history with download access
- `downloads.html` — Quick access to purchased PDF files

### Seller Pages

**`seller/`**
- `dashboard.html` — Seller dashboard with sales overview and earnings
- `upload.html` — Note upload form with file validation
- `my-notes.html` — Manage uploaded notes (edit/delete/view status)
- `earnings.html` — Track earnings and request withdrawals

### Admin Pages

**`admin/`**
- `dashboard.html` — Admin dashboard with platform statistics
- `moderation.html` — Content moderation queue (approve/reject notes)
- `users.html` — User management and verification
- `transactions.html` — Transaction monitoring and oversight
- `analytics.html` — Platform performance metrics and reports

### Public Pages

**Root Pages**
- `index.html` — Public landing page with platform overview
- `about.html` — About UniLink and our mission
- `how-it-works.html` — Guide for buyers and sellers
- `faq.html` — Frequently asked questions
- `contact.html` — Contact form and support information

## Technology Stack

- **HTML5** — Semantic markup and accessibility
- **CSS3** — Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** — Client-side logic and Supabase integration
- **Supabase JS Client** — Authentication, database queries, and file storage
- **Responsive Design** — Mobile-first approach for all screen sizes
- **M-Pesa Integration** — Payment initiation and status tracking

## Key Integrations

### Supabase Integration

The frontend integrates with Supabase for:

- **Authentication**: User registration, login, logout, and email verification
- **Database**: Real-time data fetching for notes, profiles, transactions, and reviews
- **Storage**: File uploads for notes and downloads for purchased content
- **Real-time Updates**: Live updates for transaction status and notifications

### M-Pesa Integration

Payment flow for note purchases:
1. User clicks "Buy Now" on note detail page
2. Frontend calls Supabase Edge Function to initiate STK Push
3. User receives M-Pesa prompt on phone
4. User enters PIN to complete payment
5. Callback updates transaction status
6. Frontend shows success and enables download

## File Organization

### CSS Structure
- `/public/css/` — Global stylesheets
  - `main.css` — Base styles and reset
  - `components.css` — Reusable UI components
  - `layout.css` — Page layouts and responsive utilities
  - `auth.css` — Authentication page styles
  - `marketplace.css` — Marketplace-specific styles
  - `dashboard.css` — Dashboard styles for buyers/sellers/admins

### JavaScript Structure
- `/public/js/` — JavaScript modules and utilities
  - `main.js` — Main application entry point
  - `auth.js` — Authentication functions and flows
  - `supabase-client.js` — Supabase client initialization
  - `marketplace.js` — Marketplace browsing and search
  - `payments.js` — M-Pesa payment integration
  - `upload.js` — File upload handling
  - `dashboard.js` — Dashboard functionality
  - `utils.js` — Utility functions and helpers

### Assets
- `/public/images/` — Images and icons
- `/public/fonts/` — Custom fonts (if any)

## Getting Started

### Prerequisites

- Node.js (v14 or higher) for development tools
- Supabase project with database schema set up
- M-Pesa Daraja API credentials (for payment testing)

### Installation

1. **Navigate to project root**
   ```bash
   cd UNILINK
   ```

2. **Install development dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase client**
   - Create `/public/js/config.js`:
   ```javascript
   const SUPABASE_URL = 'your-supabase-project-url';
   const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
   ```

4. **Test authentication flow**
   - Open `auth/login.html` in browser
   - Test registration and login with Supabase

5. **Test marketplace functionality**
   - Ensure database has sample data
   - Test browsing, searching, and note viewing

### Local Development

For local development with live reload:

```bash
# Using a simple HTTP server
npx http-server public -p 8080

# Or using Node.js http-server
npm run dev
```

The application will be available at `http://localhost:8080`

## Page Features by Category

### Authentication Flow

**Registration Process:**
1. User enters email, password, and profile information
2. Frontend validates input format
3. Creates user in Supabase Auth
4. Creates profile record with university, course, year
5. Sends verification email
6. User verifies email via link
7. Redirects to appropriate dashboard based on role

**Login Process:**
1. User enters email and password
2. Frontend calls Supabase Auth
3. On success, stores JWT token
4. Redirects to appropriate dashboard
5. Sets up real-time subscriptions for updates

### Marketplace Experience

**Browsing Notes:**
- Filter by university, course, subject, price range
- Sort by relevance, price, rating, upload date
- Search with full-text search
- Pagination for large result sets
- Preview note details before purchase

**Viewing Note Details:**
- Comprehensive note information
- Seller profile and ratings
- Preview of note content (first page)
- Reviews from other buyers
- Related notes recommendations
- Clear purchase options with M-Pesa

**Purchase Flow:**
1. User clicks "Buy Now" button
2. Frontend validates user authentication
3. Shows payment amount and M-Pesa prompt
4. Initiates M-Pesa STK Push via Edge Function
5. Displays payment status in real-time
6. On success, enables PDF download
7. Shows purchase confirmation

### Seller Experience

**Upload Flow:**
1. Seller fills note details (title, description, pricing)
2. Selects university, course, subject
3. Uploads PDF file (max 10MB)
4. Frontend validates file format and size
5. Uploads to Supabase Storage
6. Creates note record with "pending" status
7. Shows confirmation and status tracking

**Dashboard Features:**
- Sales overview with charts
- Earnings tracking and history
- Note management (view, edit, delete)
- Approval status monitoring
- Performance metrics (views, downloads, ratings)
- Withdrawal request form

### Buyer Experience

**Dashboard Features:**
- Purchase history with filtering
- Download access for purchased notes
- Recommendations based on purchases
- Rating and review prompts
- Search history and saved notes

**Download Process:**
1. User navigates to purchases page
2. Clicks download button on purchased note
3. Frontend verifies ownership
4. Generates signed URL from Supabase Storage
5. Initiates browser download
6. Tracks download for analytics

## Responsive Design

The frontend is designed to work seamlessly across all device sizes:

- **Mobile (< 768px)**: Stacked layout, hamburger menu, touch-friendly buttons
- **Tablet (768px - 1024px)**: Optimized grid layouts, refined spacing
- **Desktop (> 1024px)**: Multi-column layouts, hover states, keyboard navigation

### Breakpoints
```css
--mobile: 768px;
--tablet: 1024px;
--desktop: 1280px;
--wide: 1440px;
```

## Accessibility

We follow WCAG 2.1 AA guidelines for accessibility:

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators for interactive elements
- Color contrast ratios meet standards
- Screen reader compatible
- Alt text for images
- Skip navigation links

## Performance Optimization

### Image Optimization
- Use WebP format where supported
- Lazy loading for below-the-fold images
- Responsive images with srcset
- Compress images before deployment

### Code Optimization
- Minify CSS and JavaScript in production
- Defer non-critical JavaScript
- Use CSS transitions instead of JavaScript animations
- Optimize database queries with proper indexes
- Implement client-side caching for static data

### Load Optimization
- CDN for Supabase assets
- Preload critical resources
- Implement progressive enhancement
- Use font-display: swap for custom fonts

## Browser Support

We support modern browsers with the last 2 versions:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)

## Security Best Practices

### Client-Side Security
- Never store sensitive data in localStorage
- Validate all user inputs before sending to backend
- Use Content Security Policy (CSP) headers
- Implement CSRF protection for forms
- Sanitize user-generated content to prevent XSS

### Supabase Security
- Use Supabase Row Level Security (RLS) policies
- Never expose service role key in frontend
- Validate JWT tokens on protected pages
- Implement proper error handling for auth failures
- Use environment variables for configuration

### Payment Security
- Never store M-Pesa credentials in frontend
- All payment processing via Edge Functions
- Validate payment amounts before initiation
- Implement proper error handling for payment failures

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] User can register with valid email
- [ ] Email verification works correctly
- [ ] User can login with correct credentials
- [ ] Password reset flow works
- [ ] Logout clears session properly

**Marketplace:**
- [ ] Browse notes displays correctly
- [ ] Search returns relevant results
- [ ] Filtering works as expected
- [ ] Note detail page shows all information
- [ ] Related notes appear appropriately

**Payments:**
- [ ] M-Pesa initiation works
- [ ] Payment status updates in real-time
- [ ] Download unlocks after payment
- [ ] Transaction records are created
- [ ] Error handling works for failed payments

**Seller Features:**
- [ ] File upload accepts PDF only
- [ ] File size validation works
- [ ] Note details save correctly
- [ ] Status tracking shows correct states
- [ ] Earnings display accurately

**Responsive:**
- [ ] Mobile layout works correctly
- [ ] Tablet layout is optimized
- [ ] Desktop layout displays properly
- [ ] Touch interactions work on mobile
- [ ] Keyboard navigation works on desktop

## Deployment

### Production Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Configure production environment**
   - Update Supabase credentials
   - Set production M-Pesa endpoints
   - Enable CDN for static assets
   - Configure proper caching headers

3. **Deploy to hosting platform**
   - **Vercel**: Connect GitHub repository and deploy
   - **Netlify**: Drag and drop or connect Git
   - **GitHub Pages**: Push to gh-pages branch

4. **Post-deployment checks**
   - Test all critical user flows
   - Verify Supabase connection
   - Test M-Pesa integration (with small amounts)
   - Monitor performance and error logs

### Environment Configuration

Create environment-specific configuration files:

**Development**: `/public/js/config.dev.js`
**Production**: `/public/js/config.prod.js`

## Troubleshooting

### Common Issues

**Authentication Not Working**
- Check Supabase project URL and API keys
- Verify email confirmation settings in Supabase
- Check browser console for errors
- Ensure JWT token is being stored correctly

**File Upload Failing**
- Verify file is PDF format
- Check file size is under 10MB
- Ensure user is authenticated
- Check Supabase storage bucket permissions
- Review browser console for specific error

**Payment Not Processing**
- Verify M-Pesa credentials are correct
- Check sandbox vs production environment
- Ensure phone number format is correct (254XXXXXXXXX)
- Verify Edge Function deployment
- Check Supabase function logs

**Page Not Loading**
- Check JavaScript console for errors
- Verify all CSS and JS files are linked correctly
- Ensure Supabase client is initialized
- Check network tab for failed requests

**Styles Not Applying**
- Verify CSS file paths are correct
- Check for CSS syntax errors
- Clear browser cache
- Ensure no CSS conflicts with other stylesheets

## Support & Contact

For technical issues or questions:
- Email: dev@unilink.co.ke
- Documentation: [Link to full docs]

For design and UI issues:
- Email: design@unilink.co.ke

## License

This project is proprietary. All rights reserved.

---

*Built for students, by students.*