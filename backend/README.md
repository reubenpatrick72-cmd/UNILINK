# UniLink Backend - MongoDB Integration

This backend provides a complete MongoDB-integrated API for the UniLink platform.

## Features

- **User Authentication**: Registration, login with JWT tokens
- **Tutorial Management**: CRUD operations for learning content
- **Progress Tracking**: Monitor user learning progress
- **Payment Integration**: M-Pesa STK push for account activation
- **Admin Dashboard**: User management and analytics
- **MongoDB Integration**: Full database operations with Mongoose

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- M-Pesa API credentials (optional, for payments)

## Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env` file and update values:
   ```bash
   MONGO_URI=mongodb://localhost:27017/unilink
   JWT_SECRET=your-secure-jwt-secret-here
   PORT=3000
   ```

4. **Start MongoDB**
   - Local: `mongod`
   - Atlas: Ensure connection string is correct

5. **Create admin user**
   ```bash
   npm run create-admin
   ```

6. **Start the server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Tutorials
- `GET /api/tutorials` - Get all tutorials (authenticated users only)
- `GET /api/tutorials/:id` - Get specific tutorial

### Progress
- `GET /api/progress` - Get user progress
- `GET /api/progress/stats` - Get progress statistics
- `GET /api/progress/:tutorialId` - Get progress for specific tutorial
- `POST /api/progress/update` - Update tutorial progress

### Payments
- `POST /api/payment/initiate` - Initiate M-Pesa payment
- `GET /api/payment/status/:checkoutRequestId` - Check payment status

### Admin (Admin users only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/admin/create-admin` - Create admin user
- `PUT /api/admin/users/:id/activate` - Activate user account
- `DELETE /api/admin/users/:id` - Delete user

## Database Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  university: String,
  course: String,
  year: Number,
  password: String (hashed),
  isActivated: Boolean,
  isAdmin: Boolean,
  activationDate: Date,
  createdAt: Date
}
```

### Tutorial
```javascript
{
  title: String,
  description: String,
  category: String,
  duration: Number,
  level: String,
  content: String,
  videos: [{
    title: String,
    url: String,
    duration: String,
    description: String
  }],
  createdAt: Date
}
```

### Progress
```javascript
{
  userId: ObjectId (ref: User),
  tutorialId: ObjectId (ref: Tutorial),
  completedSteps: Number,
  totalSteps: Number,
  timeSpent: Number,
  completed: Boolean,
  lastAccessed: Date
}
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Admin-only routes protected
- Input validation on all endpoints

## Development

### Adding New Features

1. Create/update models in `models/`
2. Add controller logic in `controllers/`
3. Create routes in `routes/`
4. Import routes in `server.js`

### Environment Variables

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3000)

## Testing

Use tools like Postman or curl to test endpoints:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"254700000000","university":"Test University","course":"Computer Science","year":3,"password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Deployment

1. Set up MongoDB (Atlas recommended for production)
2. Update environment variables
3. Change JWT secret to a secure random string
4. Set up M-Pesa credentials if using payments
5. Deploy to hosting service (Heroku, DigitalOcean, etc.)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string
- Verify network access (for Atlas)

### Authentication Issues
- Check JWT secret consistency
- Verify token format in requests
- Check token expiration

### Payment Issues
- Verify M-Pesa credentials
- Check STK push configuration
- Ensure test phone numbers are registered