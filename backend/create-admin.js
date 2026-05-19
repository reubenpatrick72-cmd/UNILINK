// Script to create initial admin user
// Run this once to create the admin account

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to database
mongoose.connect('mongodb://localhost:27017/unilink', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    // User model (same as in server.js)
    const userSchema = new mongoose.Schema({
        firstName: String,
        lastName: String,
        email: { type: String, unique: true },
        phone: String,
        university: String,
        course: String,
        year: Number,
        password: String,
        isActivated: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        activationDate: Date,
        createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            firstName: 'System',
            lastName: 'Administrator',
            email: 'admin@unilink.co.ke',
            phone: '254700000000',
            university: 'UniLink',
            course: 'System Administration',
            year: 1,
            password: hashedPassword,
            isActivated: true,
            isAdmin: true
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@unilink.co.ke');
        console.log('Password: admin123');
        console.log('Please change the password after first login.');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});