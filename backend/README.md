# UniLink Backend - Supabase Architecture

This backend provides the complete Supabase-based infrastructure for the UniLink student notes marketplace platform.

## Overview

We use Supabase as our Backend-as-a-Service (BaaS) platform instead of a traditional custom backend. This approach significantly reduces development time, improves security, and lets us focus on business logic rather than infrastructure management.

## Features

- **User Authentication**: Registration, login with email verification via Supabase Auth
- **Notes Marketplace**: CRUD operations for study materials with approval workflow
- **Transaction Management**: Payment tracking and earnings calculation
- **Payment Integration**: M-Pesa STK push for note purchases
- **File Storage**: Secure PDF hosting via Supabase Storage
- **Admin Dashboard**: User management, content moderation, and platform analytics
- **Row Level Security**: Database-level access control for data protection

## Why Supabase?

- **60% faster development** compared to building custom backend
- **70% less code** to maintain
- **Battle-tested security** with built-in authentication and authorization
- **Auto-generated APIs** from database schema
- **Built-in features**: Auth, database, storage, and edge functions
- **Proven platform** trusted by thousands of companies

## Technology Stack

- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth (email/password with email verification)
- **File Storage**: Supabase Storage with CDN
- **Serverless Functions**: Supabase Edge Functions for custom logic
- **API**: Auto-generated REST API from database schema
- **Payments**: M-Pesa Daraja API integration

## Database Schema

### Core Tables

#### profiles
Extended user information linked to Supabase auth.users
```sql
- id (UUID, references auth.users)
- university (text)
- course (text)
- year (integer)
- is_seller (boolean)
- is_admin (boolean)
- earnings (decimal)
- created_at (timestamp)
```

#### notes
Study materials uploaded by sellers
```sql
- id (UUID, primary key)
- seller_id (UUID, references profiles)
- title (text)
- description (text)
- university (text)
- course (text)
- subject (text)
- price (decimal)
- file_url (text)
- file_size (integer)
- status (enum: pending, approved, rejected)
- downloads_count (integer)
- created_at (timestamp)
```

#### transactions
Payment records for note purchases
```sql
- id (UUID, primary key)
- buyer_id (UUID, references profiles)
- note_id (UUID, references notes)
- seller_id (UUID, references profiles)
- amount (decimal)
- platform_fee (decimal)
- seller_earnings (decimal)
- mpesa_transaction_id (text)
- status (enum: pending, completed, failed)
- created_at (timestamp)
```

#### reviews
Ratings and feedback for purchased notes
```sql
- id (UUID, primary key)
- note_id (UUID, references notes)
- buyer_id (UUID, references profiles)
- rating (integer, 1-5)
- comment (text)
- created_at (timestamp)
```

## Security Model

### Row Level Security (RLS) Policies

Our security is enforced at the database level through RLS policies:

- **Users can only view their own profile data**
- **Only approved notes are publicly visible**
- **Sellers can manage their own notes (update/delete)**
- **Buyers can only download notes they've purchased**
- **Admins have full access for moderation**

### Key Security Features

- JWT tokens for secure authentication (handled by Supabase)
- Encrypted passwords (handled by Supabase)
- HTTPS-only connections
- Private storage buckets for PDF files
- Download access only for purchased notes
- PDF-only uploads with size validation (max 10MB)
- Virus scanning (Supabase feature)

## Edge Functions

We use Supabase Edge Functions for custom business logic:

### M-Pesa Payment Functions

#### `mpesa-initiate`
Initiates STK Push payment for note purchase
- Validates user authentication
- Checks note ownership and pricing
- Calls M-Pesa Daraja API
- Returns payment initiation response

#### `mpesa-callback`
Handles M-Pesa payment callback
- Validates callback signature
- Updates transaction status
- Grants download access to buyer
- Updates seller earnings
- Sends confirmation notifications

#### `mpesa-withdraw`
Processes seller earnings withdrawal
- Validates seller request
- Checks available balance
- Initiates M-Pesa payout
- Updates transaction records

## Getting Started

### Prerequisites

- Supabase account (free tier available)
- Supabase CLI installed
- Node.js (v14 or higher)
- M-Pesa Daraja API credentials (sandbox for testing)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase project**
   ```bash
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Configure environment variables**
   - Create `.env` file:
   ```bash
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   MPESA_CONSUMER_KEY=your-mpesa-consumer-key
   MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
   MPESA_PASSKEY=your-mpesa-passkey
   MPESA_SHORTCODE=your-mpesa-shortcode
   MPESA_ENVIRONMENT=sandbox  # or 'production'
   ```

5. **Run database migrations**
   ```bash
   supabase db push
   ```

6. **Deploy Edge Functions**
   ```bash
   supabase functions deploy mpesa-initiate
   supabase functions deploy mpesa-callback
   supabase functions deploy mpesa-withdraw
   ```

7. **Set up storage buckets**
   - Navigate to Supabase dashboard
   - Create "notes" bucket (private)
   - Configure upload/download policies in RLS

## Database Setup

### Create Tables

Run the SQL migrations to create the database schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  university TEXT,
  course TEXT,
  year INTEGER,
  is_seller BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  university TEXT NOT NULL,
  course TEXT NOT NULL,
  subject TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  seller_earnings DECIMAL(10,2) NOT NULL,
  mpesa_transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, buyer_id)
);
```

### Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Notes policies
CREATE POLICY "Anyone can view approved notes"
ON notes FOR SELECT USING (status = 'approved');

CREATE POLICY "Sellers can view own notes"
ON notes FOR SELECT USING (seller_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sellers can create notes"
ON notes FOR INSERT WITH CHECK (
  seller_id = (SELECT id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Sellers can update own notes"
ON notes FOR UPDATE USING (
  seller_id = (SELECT id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can update any note"
ON notes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT USING (
  buyer_id = (SELECT id FROM profiles WHERE id = auth.uid()) OR
  seller_id = (SELECT id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT USING (TRUE);

CREATE POLICY "Buyers can create reviews for purchased notes"
ON reviews FOR INSERT WITH CHECK (
  buyer_id = (SELECT id FROM profiles WHERE id = auth.uid()) AND
  EXISTS (SELECT 1 FROM transactions WHERE 
    note_id = reviews.note_id AND 
    buyer_id = (SELECT id FROM profiles WHERE id = auth.uid()) AND
    status = 'completed'
  )
);
```

## API Endpoints

Supabase automatically generates REST API endpoints from your database schema:

### Authentication (Supabase Auth)
- `POST /auth/v1/signup` - Register new user
- `POST /auth/v1/token?grant_type=password` - User login
- `GET /auth/v1/user` - Get current user
- `POST /auth/v1/logout` - Logout user

### Profiles
- `GET /rest/v1/profiles` - Get profiles (with RLS filtering)
- `GET /rest/v1/profiles?id=eq.{id}` - Get specific profile
- `PATCH /rest/v1/profiles?id=eq.{id}` - Update profile

### Notes
- `GET /rest/v1/notes` - Get notes (with RLS filtering)
- `GET /rest/v1/notes?id=eq.{id}` - Get specific note
- `POST /rest/v1/notes` - Create note (sellers only)
- `PATCH /rest/v1/notes?id=eq.{id}` - Update note (sellers/admins only)

### Transactions
- `GET /rest/v1/transactions` - Get transactions (with RLS filtering)
- `POST /rest/v1/transactions` - Create transaction (system-generated)

### Reviews
- `GET /rest/v1/reviews` - Get reviews
- `POST /rest/v1/reviews` - Create review (buyers only)

### Edge Functions
- `POST /functions/v1/mpesa-initiate` - Initiate M-Pesa payment
- `POST /functions/v1/mpesa-callback` - M-Pesa payment callback
- `POST /functions/v1/mpesa-withdraw` - Withdraw seller earnings

## Storage Configuration

### Create Storage Buckets

1. Navigate to Supabase dashboard → Storage
2. Create "notes" bucket with these settings:
   - Public: False (private bucket)
   - File size limit: 10MB
   - Allowed MIME types: application/pdf

### Storage Policies

```sql
-- Allow sellers to upload to notes bucket
CREATE POLICY "Sellers can upload notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to download purchased notes
CREATE POLICY "Users can download purchased notes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'notes' AND
  EXISTS (
    SELECT 1 FROM transactions
    WHERE note_id::text = (storage.foldername(name))[1]
    AND buyer_id = (SELECT id FROM profiles WHERE id = auth.uid())
    AND status = 'completed'
  )
);

-- Allow sellers to delete their own notes
CREATE POLICY "Sellers can delete own notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Development

### Local Development

Use Supabase local development environment:

```bash
# Start local Supabase
supabase start

# Run migrations locally
supabase db reset

# Test edge functions locally
supabase functions serve
```

### Database Triggers

Create triggers for automated updates:

```sql
-- Update seller earnings when transaction completes
CREATE OR REPLACE FUNCTION update_seller_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles 
    SET earnings = earnings + NEW.seller_earnings
    WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_earnings_trigger
AFTER UPDATE OF status ON transactions
FOR EACH ROW EXECUTE FUNCTION update_seller_earnings();

-- Increment note download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE notes 
  SET downloads_count = downloads_count + 1
  WHERE id = NEW.note_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER download_count_trigger
AFTER INSERT ON transactions
FOR EACH ROW WHEN (NEW.status = 'completed')
EXECUTE FUNCTION increment_download_count();
```

### Testing

Test the API using Supabase client or curl:

```bash
# Get all approved notes
curl 'https://your-project.supabase.co/rest/v1/notes?status=eq.approved' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a note (requires seller authentication)
curl -X POST 'https://your-project.supabase.co/rest/v1/notes' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Calculus",
    "description": "Comprehensive notes for first-year calculus",
    "university": "University of Nairobi",
    "course": "Mathematics",
    "subject": "Calculus I",
    "price": 150,
    "file_url": "https://storage-url/note.pdf",
    "file_size": 2048000
  }'
```

## Deployment

### Production Setup

1. **Set up production Supabase project**
   - Create new project in Supabase dashboard
   - Enable required extensions
   - Configure environment variables

2. **Migrate database schema**
   ```bash
   supabase db push --linked
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy mpesa-initiate --no-verify-jwt
   supabase functions deploy mpesa-callback --no-verify-jwt
   supabase functions deploy mpesa-withdraw --no-verify-jwt
   ```

4. **Configure M-Pesa production credentials**
   - Update environment variables with production keys
   - Set MPESA_ENVIRONMENT=production
   - Test with small transaction amounts

5. **Set up monitoring**
   - Enable Supabase logs
   - Configure error tracking
   - Set up database performance monitoring

## Monitoring & Maintenance

### Key Metrics to Monitor
- Database performance and query times
- Storage usage and costs
- Edge Function execution times and errors
- Authentication success rates
- Payment success rates

### Regular Maintenance Tasks
- Review and optimize slow queries
- Clean up rejected note files
- Archive old transaction records
- Update RLS policies as needed
- Monitor security advisories from Supabase

## Troubleshooting

### Common Issues

**Supabase Connection Errors**
- Verify project URL and API keys
- Check network connectivity
- Confirm API key permissions
- Ensure project is active

**RLS Policy Issues**
- Test policies with different user roles
- Check policy logic and conditions
- Verify user authentication state
- Review policy precedence

**M-Pesa Integration Issues**
- Verify sandbox vs production credentials
- Check phone number format (254XXXXXXXXX)
- Ensure callback URL is publicly accessible
- Review M-Pesa API error codes
- Test with small amounts first

**Storage Permission Issues**
- Check bucket policies
- Verify file path structure
- Confirm user authentication
- Review MIME type restrictions

## Support & Contact

For technical issues or questions:
- Email: dev@unilink.co.ke
- Supabase Documentation: https://supabase.com/docs
- M-Pesa Daraja API: https://developer.safaricom.co.ke

## License

This project is proprietary. All rights reserved.

---

*Built for students, by students.*