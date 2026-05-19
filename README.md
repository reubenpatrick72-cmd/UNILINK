# UniLink - University Student Community Platform

A comprehensive platform for university students to learn online entrepreneurship skills including Amazon FBA, Shopify, Dropshipping, and Freelancing.

## Features

- **User Registration & Authentication**: Secure user registration with JWT authentication
- **M-Pesa Payment Integration**: Account activation via M-Pesa STK push
- **Tutorial System**: Comprehensive tutorials for various online business models
- **Progress Tracking**: Monitor learning progress and completion
- **Admin Dashboard**: Complete admin panel for user and content management
- **Responsive Design**: Mobile-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- M-Pesa API credentials (for payment processing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unilink
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up MongoDB**
   - Install MongoDB on your system
   - Start MongoDB service
   - The application will connect to `mongodb://localhost:27017/unilink`

4. **Configure M-Pesa (Optional)**
   - Update the M-Pesa credentials in `backend/middleware/mpesa.js`
   - For testing, you can skip this step and manually activate users via admin panel

5. **Create Admin User**
   ```bash
   npm run create-admin
   ```
   This will create an admin user with:
   - Email: `admin@unilink.co.ke`
   - Password: `admin123`

6. **Start the server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`

## Usage

### For Students

1. **Register**: Visit the homepage and click "Register"
2. **Activate Account**: Pay KES 150 via M-Pesa to activate your account
3. **Access Tutorials**: Browse and complete tutorials in your dashboard
4. **Track Progress**: Monitor your learning progress

### For Administrators

1. **Login**: Use admin credentials at `/public/pages/login.html`
2. **Dashboard**: Access admin panel at `/public/pages/admin-dashboard.html`
3. **User Management**: View, activate, and manage user accounts
4. **Content Management**: Monitor tutorials and user progress
5. **Analytics**: View platform statistics and reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Payments
- `POST /api/payment/initiate` - Initiate M-Pesa payment
- `GET /api/payment/status/:checkoutRequestId` - Check payment status

### Tutorials
- `GET /api/tutorials` - Get all tutorials
- `GET /api/progress` - Get user progress

### Admin (Requires Admin Token)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `PUT /api/admin/users/:id/activate` - Activate user account
- `DELETE /api/admin/users/:id` - Delete user account

## File Structure

```
unilink/
├── backend/
│   ├── server.js              # Main server file
│   ├── create-admin.js        # Admin user creation script
│   ├── middleware/
│   │   └── mpesa.js          # M-Pesa payment integration
│   ├── package.json
│   └── routes/               # API routes (expandable)
├── public/
│   ├── css/
│   │   └── styles.css        # Main stylesheet
│   ├── js/
│   │   ├── utils.js          # Shared utility functions
│   │   ├── register.js       # Registration form handling
│   │   ├── login.js          # Login form handling
│   │   ├── payment.js        # Payment processing
│   │   ├── dashboard.js      # User dashboard
│   │   └── admin-dashboard.js # Admin dashboard
│   ├── pages/
│   │   ├── index.html        # Landing page
│   │   ├── register.html     # Registration page
│   │   ├── login.html       # Login page
│   │   ├── activate.html    # Account activation page
│   │   ├── dashboard.html   # User dashboard
│   │   └── admin-dashboard.html # Admin dashboard
│   └── README.md
└── README.md
```

## Development

### Adding New Tutorials

Tutorials are stored in the MongoDB database. You can add new tutorials programmatically or through the admin interface (future feature).

### Customizing Styles

The main stylesheet is located at `public/css/styles.css`. The design uses CSS custom properties for easy theming.

### Extending API

Add new routes in `backend/server.js` or create separate route files in the `routes/` directory.

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- Admin routes require special authentication
- Change default admin password after setup

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `server.js`
- Verify database name and credentials

### Payment Issues
- Verify M-Pesa API credentials
- Check STK push configuration
- Ensure test phone numbers are registered

### Admin Access
- Run `npm run create-admin` to create admin user
- Default login: `admin@unilink.co.ke` / `admin123`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, contact:
- Email: support@unilink.co.ke
- Phone: +254 712 345 678
   ```bash
   npm start
   ```

6. **Open the application:**
   - Open `index.html` in your browser
   - The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Payment
- `POST /api/payment/initiate` - Initiate Mpesa STK push
- `GET /api/payment/status/:checkoutRequestId` - Check payment status

### Content
- `GET /api/tutorials` - Get all tutorials (requires activation)
- `GET /api/progress` - Get user progress

## Project Structure

```
unilink/
├── index.html                 # Landing page
├── public/
│   ├── css/
│   │   └── styles.css         # Main stylesheet
│   ├── js/
│   │   ├── main.js           # Main JavaScript utilities
│   │   ├── register.js       # Registration logic
│   │   ├── login.js          # Login logic
│   │   ├── payment.js        # Payment processing
│   │   └── dashboard.js      # Dashboard functionality
│   └── pages/
│       ├── register.html     # Registration page
│       ├── login.html        # Login page
│       ├── activate.html     # Payment activation page
│       └── dashboard.html    # User dashboard
└── backend/
    ├── server.js             # Main server file
    ├── middleware/
    │   └── mpesa.js          # Mpesa integration
    ├── models/               # Database models
    ├── routes/               # API routes
    ├── controllers/          # Business logic
    ├── package.json          # Dependencies
    └── .env                  # Environment variables
```

## Usage

1. **Registration:** Students register with their details
2. **Activation:** Pay KES 299 via Mpesa STK push to activate account
3. **Access:** Once activated, students can access all tutorials and features
4. **Learning:** Track progress through the dashboard

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Secure payment processing via Mpesa

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@unilink.co.ke or join our community forum.
