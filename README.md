# UniLink - Student Notes Marketplace (soma hizi vitu zote mzee)
 
A peer-to-peer marketplace where university students buy and sell high-quality study notes, past papers, and exam preparation materials.

## Project Documentation

- **[Backend Documentation](./backend/README.md)** - Supabase architecture, database schema, API endpoints, and Edge Functions
- **[Frontend Documentation](./public/pages/README.md)** - Page structure, features, integration guides, and deployment

## Important: Business Model Pivot

I've strategically pivoted from an online business training platform to a student notes marketplace. This decision came after careful analysis of market dynamics and student needs.

### Why I Changed Direction

**Original Model Issues:**
- Oversaturated market with thousands of similar courses
- Low trust - students skeptical of "get rich quick" content
- High content creation burden requiring constant video production
- One-time payment model with limited recurring revenue
- Generic content not specific to student curriculum needs
- Free alternatives readily available (YouTube, free courses)
- Significant upfront investment required before earning

**New Model Advantages:**
- Solves real problem: Students need notes for their specific courses
- Proven demand: Students already share notes informally
- Win-win economics: Sellers earn money, buyers get quality materials
- Trust factor: University-verified peers, course-specific content
- Recurring revenue: Students buy notes every semester
- Low startup costs: PDF hosting is inexpensive
- Fast validation: Can test at one university within weeks
- Network effects: More sellers attract more buyers
- Scalable: Transaction-based revenue grows with users

### What I Removed and Why

| Removed Feature | Reason |
|----------------|---------|
| Video tutorials | Expensive hosting, high bandwidth costs, difficult to monetize |
| Amazon FBA/Shopify training | Saturated market, low trust, requires constant content creation |
| Tech consultancy services | Not scalable, trades time for money, distracts from platform |
| Website building services | Wrong business model - we're a platform, not an agency |
| Self-learning courses | Too broad, competes with established platforms without differentiation |

*These features can be reconsidered in Version 2.0+ if the marketplace succeeds first.*

## What UniLink Does

UniLink connects university students who create excellent study materials with those who need them. Top-performing students can monetize their notes while others access quality study materials from trusted peers at their own university.

## The Problem We Solve

**Student Pain Points:**
- Difficulty finding quality notes for specific courses and universities
- Generic study materials that don't match their curriculum
- Struggle to understand lecture content without proper notes
- Stressful exam preparation without adequate materials

**Top Student Pain Points:**
- Valuable notes with no monetization avenue
- Already sharing notes informally without compensation
- Desire to earn from their academic work

**Our Solution:** A trusted marketplace connecting both groups with secure payments and quality control.

## MVP Features (Version 1.0)

### For Buyers
- Register with university email verification
- Browse and search notes by university, course, subject
- View note details, ratings, and seller information
- Purchase notes via M-Pesa (Ksh 50-500)
- Download purchased PDFs instantly
- Rate and review purchased notes
- Track purchase history

### For Sellers
- Upload study notes (PDF only, max 10MB)
- Set pricing and note details
- Track upload approval status
- Monitor sales and earnings
- Earn 70% of each sale (platform takes 30%)
- Request earnings withdrawal via M-Pesa
- View ratings and reviews

### Admin Features
- Dashboard with platform statistics
- Moderate uploaded notes (approve/reject)
- User management
- Transaction monitoring
- Platform analytics

## Technology Architecture

### Why Supabase Instead of Custom Backend

We chose Supabase (Backend-as-a-Service) over building a custom Express/MongoDB backend because:

- **Faster Development:** Cuts development time by 60%
- **Less Code to Maintain:** Reduces codebase by 70%
- **Better Security:** Battle-tested authentication and authorization
- **Focus on Business Logic:** Spend time on M-Pesa integration, not infrastructure
- **Built-in Features:** Auth, database, file storage, and API generation included
- **Lower Risk:** Proven platform used by thousands of companies

### Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Supabase JS Client for backend communication
- Responsive design for mobile/desktop

**Backend (Supabase):**
- PostgreSQL database (managed by Supabase)
- Supabase Authentication (email/password)
- Supabase Storage (PDF file hosting with CDN)
- Supabase Edge Functions (serverless functions for custom logic)
- Auto-generated REST API from database schema

**Custom Backend Logic (Edge Functions):**
- M-Pesa payment initiation (STK Push)
- M-Pesa payment callback handling
- Seller earnings withdrawal processing

**Payments:**
- M-Pesa Daraja API (Safaricom)

**Deployment:**
- Frontend: Vercel or Netlify
- Backend: Supabase Cloud (fully managed)
- Database: Supabase Cloud (PostgreSQL)
- Files: Supabase Storage with CDN

## Team Responsibilities

### Backend Developer

**Primary Responsibilities:**
- Design PostgreSQL database schema in Supabase dashboard
- Configure Row Level Security (RLS) policies for data protection
- Set up file storage buckets and access policies
- Write Edge Functions for M-Pesa integration
- Set up database triggers for automated updates
- Configure email verification templates
- Monitor and optimize database performance
- Document API endpoints and data models

**What Supabase Handles Automatically:**
- User registration and login endpoints
- JWT token generation and validation
- Password hashing and security
- File upload/download endpoints
- Basic CRUD API endpoints
- Database connection management
- Backups and scaling

### Frontend Developer

**Primary Responsibilities:**
- Design and build all HTML pages
- Create responsive CSS styling
- Implement JavaScript frontend logic
- Integrate Supabase JS client
- Handle user authentication flows
- Build file upload interfaces
- Implement search and filtering
- Create payment initiation UI
- Handle error states and loading indicators

## Database Structure

### Core Tables
- **profiles** - Extended user information (university, course, year, earnings)
- **notes** - Uploaded study materials with metadata
- **transactions** - Payment records and history
- **reviews** - Ratings and feedback for notes

### Security Model
Row Level Security (RLS) ensures:
- Users can only view their own profile data
- Only approved notes are publicly visible
- Sellers can manage their own notes
- Buyers can only download purchased notes
- Admins have full access for moderation

## Revenue Model

### Revenue Streams

**Primary:** 30% transaction fee on each note sale
- Seller receives 70% (Ksh 350 on a Ksh 500 note)
- Platform receives 30% (Ksh 150)

**Future (Version 1.1+):**
- Monthly subscription (Ksh 500-1000 for unlimited downloads)
- Featured listing fees for sellers
- Tutoring session commissions (15-20%)

## Pre-Build Validation Checklist

**CRITICAL: Complete this before building**

### Week 1:(WEE REUBEN HII NI KAZI YAKO) Student Validation
- Interview 20+ students from target university
- Confirm willingness to pay Ksh 50-200 for quality notes
- Understand current study material acquisition methods
- Target: 60%+ express willingness to pay

### Week 1: Seller Validation
- Recruit 10 top-performing students
- Confirm willingness to sell notes for 70% revenue share
- Collect 20-30 sample notes before launch
- Target: 5+ committed sellers per university

### Week 2: Technical Validation
- Test M-Pesa integration in sandbox environment
- Verify student comfort with M-Pesa payments
- Confirm minimum payment amount (Ksh 50) is viable

### Week 2: Market Research
- Identify existing competitor platforms
- Analyze their weaknesses
- Define competitive advantages

*If validation shows less than 50% interest,WE WILL pivot before building.*

## Launch Strategy

### Phase 1: Soft Launch (Week 1-2)
**Target: ONE university only**

**Pre-Launch:**
- Have 30+ quality notes already uploaded
- Recruit 5-10 "founding creator" sellers
- Create WhatsApp group for early adopters

**Marketing:**
- Physical flyers in library, cafeteria, lecture halls
- Share in student WhatsApp/Telegram groups
- Partner with 2-3 student organizations
- Incentive: First 100 users get 50% off all purchases

**Goal:** 100 registered users, 20 purchases in 2 weeks

### Phase 2: Iterate (Week 3-6)
- Gather daily user feedback
- Fix bugs and UX issues quickly
- Add most-requested features
- Build trust through quality moderation

**Goal:** 20%+ of users make a purchase

### Phase 3: Scale (Month 2-3)
- Add 2-3 more universities if traction is strong
- Recruit campus ambassadors (commission-based)
- Run targeted social media ads
- Create seller success stories

**Goal:** 500 users, 100+ sales per month

## Key Success Metrics

- User activation: 40%+ browse notes after registration
- Conversion rate: 15%+ of browsers make a purchase
- Seller retention: 60%+ upload multiple notes
- Repeat purchases: 30%+ of buyers purchase again
- Revenue per user: Ksh 100 average

*If metrics fall below targets after Month 2,wee reassess the model.*

## Development Roadmap

### Version 1.0 - MVP (4-6 weeks)

**Backend (HII NI YANGU):**
- Supabase project setup and configuration
- Database schema design and RLS policies
- Storage buckets and file policies
- M-Pesa Edge Functions (initiate, callback, withdrawal)
- Database triggers for stats updates
- API documentation

**Frontend (REUBEN HII NI KAZI YAKE PIA):**
- Landing page
- Authentication pages (login/register)
- Marketplace browse and search
- Note detail and purchase flow
- Seller dashboard and upload form
- Buyer purchases page
- Admin dashboard
- Responsive styling

**Shared:**
- End-to-end testing
- Deployment (frontend and Edge Functions)
- M-Pesa production credentials setup

### Version 1.1 - Post-Launch (2-3 weeks)
- Subscription model for unlimited downloads
- Advanced search and filtering
- Seller profiles and portfolios
- Automated withdrawal processing
- Email notification system

### Version 2.0 - Growth Features (Future)
- P2P tutoring marketplace
- Note preview (first pages free)
- Wishlist and favorites
- Bundle deals and discounts
- Referral program
- Seller analytics dashboard

## Getting Started

### Prerequisites
- Supabase account (free tier available)
- M-Pesa Daraja API credentials
- Supabase CLI (for Edge Functions)
- Node.js (for frontend tooling)

### Setup Steps (NIWACHIE YENYE HUELEWI)

**Create Supabase Project**
1. Sign up at supabase.com
2. Create new project
3. Save database password and API keys

**Configure Database**
1. Run SQL migrations to create tables
2. Enable Row Level Security
3. Apply RLS policies

**Set Up Storage**
1. Create "notes" bucket (private)
2. Configure upload/download policies

**Deploy Edge Functions**
1. Install Supabase CLI
2. Configure M-Pesa environment variables
3. Deploy payment functions

**Configure Frontend**
1. Add Supabase client library
2. Set Supabase project URL and anon key
3. Test authentication flow

**Test M-Pesa Integration**
1. Use sandbox environment first
2. Test STK Push flow
3. Verify callback handling
4. Switch to production credentials

## Security & Compliance

### Data Protection
- Row Level Security (RLS) enforces data access rules at database level
- JWT tokens for secure authentication
- Encrypted passwords (handled by Supabase)
- HTTPS-only connections

### File Security
- Private storage buckets
- Download access only for purchased notes
- PDF-only uploads with size validation
- Virus scanning (Supabase feature)

### Payment Security
- M-Pesa handles actual payment processing
- No credit card data stored on platform
- Transaction records encrypted at rest

## Troubleshooting

### Common Issues

**Supabase Connection Errors**
- Verify project URL and API keys
- Check network connectivity
- Confirm API key permissions

**M-Pesa Payment Failures**
- Verify sandbox vs production credentials
- Check phone number format (254XXXXXXXXX)
- Ensure callback URL is publicly accessible
- Review M-Pesa API error codes

**File Upload Issues**
- Confirm file size under 10MB
- Verify PDF file type
- Check storage bucket policies
- Ensure user authentication

**Authentication Problems**
- Check email verification status
- Verify RLS policies are correct
- Confirm JWT token in requests

## Support & Contact

For technical issues or questions:
- Email: UTAJAZA HAPA
- Documentation: [unilink-docs]

For business inquiries:
- Email: UTAJAZA HAPA

## License

This project is proprietary. All rights reserved.

---

*Built for students, by students.*