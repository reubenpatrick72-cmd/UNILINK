# UniLink

UniLink is a student-focused learning and activation platform built to help university students learn online business skills such as Amazon FBA, Shopify, dropshipping, freelancing, and digital entrepreneurship. The site combines a simple frontend experience with a Node.js/Express backend, MongoDB storage, and M-Pesa payment integration for account activation.

## What this project does

- Lets students register and log in securely.
- Provides tutorials and learning content for online business models.
- Tracks student progress and activation status.
- Supports admin management of users, tutorials, and platform analytics.
- Uses M-Pesa for account activation and payment-related flows.

## Key features

- User registration and authentication
- Student dashboard and tutorial access
- Payment method management
- Admin dashboard for insights and user control
- Responsive HTML/CSS/JS frontend
- Express + MongoDB backend

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT + bcrypt
- Payments: M-Pesa integration

## Project structure

```text
unilink/
├── index.html                  # Landing page
├── public/
│   ├── css/styles.css          # Main stylesheet
│   ├── js/                     # Frontend logic for auth, dashboard, payment, admin
│   └── pages/                  # HTML pages for students, auth, admin, activation
└── backend/
    ├── server.js               # Main Express server
    ├── routes/                 # API routes
    ├── controllers/            # Business logic
    ├── models/                 # MongoDB models
    └── middleware/             # M-Pesa and related middleware
```

## Prerequisites

- Node.js (recommended: 18 or newer)
- npm
- MongoDB running locally or a MongoDB Atlas URI
- M-Pesa API credentials (optional for testing)

## Getting started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd unilink
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Start MongoDB
   - Local MongoDB: `mongod`
   - Or use MongoDB Atlas and set `MONGO_URI` in your environment

4. Create an admin account
   ```bash
   npm run create-admin
   ```
   Default admin credentials:
   - Email: `admin@unilink.co.ke`
   - Password: `admin123`

5. Start the backend server
   ```bash
   npm start
   ```
   The app will run at `http://localhost:3000`.

## Main pages

- `index.html` — landing page
- `public/pages/auth/login.html` — login page
- `public/pages/auth/register.html` — registration page
- `public/pages/student/dashboard.html` — student dashboard
- `public/pages/student/tutorial.html` — tutorial view
- `public/pages/student/payment-methods.html` — payment method management
- `public/pages/admin/admin-dashboard.html` — admin dashboard
- `public/pages/activation/activate.html` — account activation page

## API overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Tutorials and progress
- `GET /api/tutorials`
- `GET /api/progress`

### Payments
- `POST /api/payment/initiate`
- `GET /api/payment/status/:checkoutRequestId`

### Admin
- `GET /api/admin/users`
- `GET /api/admin/stats`
- `PUT /api/admin/users/:id/activate`
- `DELETE /api/admin/users/:id`

## Deployment notes

This project is currently structured as:
- a static frontend for pages and UI
- a separate Express backend for API and database access

For production, a practical setup is:
- Vercel for the frontend
- Render or Railway for the backend
- MongoDB Atlas for the database

## Testing and development

- Use the browser to test the HTML pages in `public/pages/`.
- Use Postman or Insomnia to test the backend API.
- For automated testing, Playwright is a good fit for the frontend, while Jest + Supertest is suitable for backend API tests.

## Troubleshooting

- If MongoDB fails to connect, check the `MONGO_URI` value.
- If payments fail, verify your M-Pesa credentials in `backend/middleware/mpesa.js`.
- If the admin page does not work, create the admin account again using `npm run create-admin`.

## License

This project is licensed under the ISC License.

