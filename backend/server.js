const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// const dotenv = require('dotenv');
const mpesa = require('./middleware/mpesa');

// Load environment variables
// dotenv.config();

// Import models
const User = require('./models/User');
const Tutorial = require('./models/Tutorial');
const Progress = require('./models/Progress');

// Import routes
const authRoutes = require('./routes/auth');
const tutorialRoutes = require('./routes/tutorials');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const paymentMethodsRoutes = require('./routes/paymentMethods');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Database connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/unilink';
mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/progress', progressRoutes);

// Initialize sample tutorials
const initializeTutorials = async() => {
    const tutorialCount = await Tutorial.countDocuments();
    if (tutorialCount === 0) {
        const sampleTutorials = [{
                title: "Amazon FBA Basics - Complete Beginner's Guide",
                description: "Learn the fundamentals of Amazon FBA and how to start selling on Amazon. This comprehensive guide covers everything from product research to launching your first product.",
                category: "amazon",
                duration: 45,
                level: "Beginner",
                content: `Welcome to Amazon FBA! This course will teach you:

**Module 1: Amazon FBA Fundamentals**
- What is Amazon FBA and how it works
- Benefits of selling on Amazon
- Understanding Amazon's marketplace

**Module 2: Getting Started**
- Creating your Amazon seller account
- Setting up your seller central dashboard
- Understanding seller fees and requirements

**Module 3: Product Research**
- Finding profitable products to sell
- Using tools like Jungle Scout and Helium 10
- Analyzing competition and market trends

**Module 4: Sourcing Products**
- Finding reliable suppliers (AliExpress, Alibaba)
- Understanding wholesale pricing
- Quality control and shipping

**Module 5: Listing Your Products**
- Writing compelling product listings
- Professional photography tips
- Optimizing for Amazon's algorithm

**Module 6: Launching and Scaling**
- PPC advertising strategies
- Customer service best practices
- Scaling your Amazon business`,
                videos: [{
                        title: "How to Start Amazon FBA Business (Kevin David)",
                        url: "https://www.youtube.com/watch?v=7-0noLxmWQM",
                        duration: "12:45",
                        description: "Complete beginner's guide to starting Amazon FBA"
                    },
                    {
                        title: "Amazon Product Research for Beginners (Jungle Scout)",
                        url: "https://www.youtube.com/watch?v=8VxBKQHkZHg",
                        duration: "15:30",
                        description: "Learn how to find profitable products on Amazon"
                    },
                    {
                        title: "Amazon PPC Advertising for Beginners (AMZ Insight)",
                        url: "https://www.youtube.com/watch?v=9W5Z8JvJcNk",
                        duration: "18:20",
                        description: "Master Amazon PPC to boost your sales"
                    },
                    {
                        title: "Scaling Amazon FBA to 7 Figures (Kevin David)",
                        url: "https://www.youtube.com/watch?v=5X8RzJfLkQw",
                        duration: "22:15",
                        description: "Advanced strategies for growing your Amazon business"
                    }
                ],
                templates: [{
                        name: "Amazon Product Research Spreadsheet",
                        description: "Professional Excel template for product research with automated calculations",
                        type: "free",
                        features: ["Product research tracker", "Profit margin calculator", "Competition analysis", "Supplier contact list"],
                        downloadUrl: "/templates/amazon-research-free.xlsx"
                    },
                    {
                        name: "Amazon FBA Business Plan Template",
                        description: "Complete business plan template with financial projections and marketing strategy",
                        type: "premium",
                        price: 100,
                        features: ["Financial projections", "Marketing strategy", "Supplier analysis", "Risk assessment", "3-year growth plan"],
                        downloadUrl: "/templates/amazon-business-plan-premium.docx",
                        previewUrl: "/templates/previews/amazon-business-plan-preview.pdf"
                    },
                    {
                        name: "Amazon PPC Campaign Manager",
                        description: "Advanced PPC campaign management template with keyword tracking and ROI analysis",
                        type: "premium",
                        price: 100,
                        features: ["Keyword performance tracker", "A/B testing framework", "ROI calculator", "Budget optimization", "Campaign scheduling"],
                        downloadUrl: "/templates/amazon-ppc-manager-premium.xlsx",
                        previewUrl: "/templates/previews/amazon-ppc-preview.pdf"
                    },
                    {
                        name: "Amazon Inventory Management System",
                        description: "Comprehensive inventory tracking and reorder point calculator",
                        type: "free",
                        features: ["Stock level monitoring", "Reorder point calculator", "Supplier lead time tracker", "Seasonal demand analysis"],
                        downloadUrl: "/templates/amazon-inventory-free.xlsx"
                    },
                    {
                        name: "Amazon Listing Optimization Template",
                        description: "Professional product listing template with SEO optimization and A+ content structure",
                        type: "premium",
                        price: 100,
                        features: ["SEO-optimized titles", "A+ content templates", "Keyword research integration", "Performance tracking", "Listing audit checklist"],
                        downloadUrl: "/templates/amazon-listing-premium.docx",
                        previewUrl: "/templates/previews/amazon-listing-preview.pdf"
                    }
                ]
            },
            {
                title: "Shopify Store Setup - Step-by-Step Guide",
                description: "Complete guide to creating and launching your Shopify store from scratch. Learn design, product setup, payment integration, and marketing strategies.",
                category: "shopify",
                duration: 60,
                level: "Beginner",
                content: `Build your dream e-commerce store with Shopify!

**Module 1: Shopify Basics**
- What is Shopify and why choose it
- Understanding Shopify pricing plans
- Domain setup and store customization

**Module 2: Store Design**
- Choosing and customizing themes
- Mobile-responsive design principles
- Adding apps and integrations

**Module 3: Product Management**
- Adding products and variants
- Inventory management
- Product photography and descriptions

**Module 4: Payment & Shipping**
- Setting up payment gateways
- Configuring shipping rates
- Tax settings and compliance

**Module 5: Marketing & Sales**
- Email marketing integration
- Social media marketing
- SEO optimization for e-commerce

**Module 6: Analytics & Growth**
- Google Analytics setup
- Sales tracking and reporting
- Customer retention strategies`,
                videos: [{
                        title: "Shopify Store Setup for Complete Beginners (Shopify)",
                        url: "https://www.youtube.com/watch?v=6r7b5MzF5Hg",
                        duration: "14:30",
                        description: "Step-by-step Shopify store creation guide"
                    },
                    {
                        title: "Shopify Theme Customization Tutorial (Shopify Partners)",
                        url: "https://www.youtube.com/watch?v=8VzBKQHkZHg",
                        duration: "16:45",
                        description: "Make your Shopify store look professional"
                    },
                    {
                        title: "Setting Up Shopify Dropshipping Store (Oberlo)",
                        url: "https://www.youtube.com/watch?v=9W5Z8JvJcNk",
                        duration: "19:20",
                        description: "Complete dropshipping setup with automation"
                    },
                    {
                        title: "Shopify Marketing & Sales Funnels (Shopify)",
                        url: "https://www.youtube.com/watch?v=5X8RzJfLkQw",
                        duration: "21:10",
                        description: "Drive traffic and increase conversions"
                    }
                ],
                templates: [{
                        name: "Shopify Store Setup Checklist",
                        description: "Comprehensive checklist for launching your Shopify store successfully",
                        type: "free",
                        features: ["Store setup steps", "App recommendations", "Launch checklist", "Post-launch tasks"],
                        downloadUrl: "/templates/shopify-checklist-free.pdf"
                    },
                    {
                        name: "Shopify Product Upload Template",
                        description: "Bulk product upload template with all required fields and formatting",
                        type: "free",
                        features: ["CSV upload format", "Variant management", "SEO fields", "Custom options"],
                        downloadUrl: "/templates/shopify-products-free.csv"
                    },
                    {
                        name: "Shopify Marketing Strategy Template",
                        description: "Complete marketing strategy template with social media and email campaigns",
                        type: "premium",
                        price: 100,
                        features: ["Social media calendar", "Email marketing sequences", "PPC campaign templates", "Content marketing plan", "Influencer outreach templates"],
                        downloadUrl: "/templates/shopify-marketing-premium.docx",
                        previewUrl: "/templates/previews/shopify-marketing-preview.pdf"
                    },
                    {
                        name: "Shopify Sales Funnel Builder",
                        description: "Advanced sales funnel templates with upsell and cross-sell automation",
                        type: "premium",
                        price: 100,
                        features: ["Email automation sequences", "Cart abandonment recovery", "Upsell/cross-sell flows", "Customer retention campaigns", "A/B testing framework"],
                        downloadUrl: "/templates/shopify-funnels-premium.xlsx",
                        previewUrl: "/templates/previews/shopify-funnels-preview.pdf"
                    },
                    {
                        name: "Shopify Analytics Dashboard Template",
                        description: "Custom analytics dashboard template for tracking store performance",
                        type: "free",
                        features: ["Key metrics tracking", "Conversion rate analysis", "Customer behavior insights", "Revenue forecasting"],
                        downloadUrl: "/templates/shopify-analytics-free.xlsx"
                    },
                    {
                        name: "Shopify Dropshipping Supplier Management",
                        description: "Professional supplier management system with performance tracking",
                        type: "premium",
                        price: 100,
                        features: ["Supplier performance metrics", "Order fulfillment tracking", "Quality control checklists", "Communication templates", "Contract management"],
                        downloadUrl: "/templates/shopify-suppliers-premium.xlsx",
                        previewUrl: "/templates/previews/shopify-suppliers-preview.pdf"
                    }
                ]
            },
            {
                title: "Dropshipping Masterclass - Build Passive Income",
                description: "Everything you need to know about starting a dropshipping business. From finding suppliers to automating your store and scaling to multiple streams of income.",
                category: "dropshipping",
                duration: 90,
                level: "Intermediate",
                content: `Master the art of dropshipping and create passive income streams!

**Module 1: Dropshipping Fundamentals**
- What is dropshipping and how it works
- Pros and cons of dropshipping
- Legal considerations and requirements

**Module 2: Niche Selection**
- Finding profitable niches
- Market research techniques
- Competition analysis

**Module 3: Supplier Research**
- Finding reliable dropshipping suppliers
- AliExpress, Oberlo, and SaleHoo
- Quality control and shipping times

**Module 4: Store Setup**
- Shopify vs other platforms
- Theme selection and customization
- Payment gateway integration

**Module 5: Product Research & Listing**
- Finding winning products
- Writing persuasive product descriptions
- Pricing strategies for profit

**Module 6: Marketing & Traffic**
- Facebook and Instagram ads
- Email marketing automation
- Influencer partnerships

**Module 7: Automation & Scaling**
- Order fulfillment automation
- Customer service outsourcing
- Scaling to multiple stores`,
                videos: [{
                        title: "Dropshipping Business Model Explained (Alex Hormozi)",
                        url: "https://www.youtube.com/watch?v=7-0noLxmWQM",
                        duration: "11:30",
                        description: "Understanding how dropshipping works"
                    },
                    {
                        title: "Finding Profitable Dropshipping Niches 2024 (Tai Lopez)",
                        url: "https://www.youtube.com/watch?v=8VzBKQHkZHg",
                        duration: "17:45",
                        description: "Research profitable niches with low competition"
                    },
                    {
                        title: "Shopify Dropshipping Store Setup Guide (Oberlo)",
                        url: "https://www.youtube.com/watch?v=9W5Z8JvJcNk",
                        duration: "23:15",
                        description: "Complete store setup with automation"
                    },
                    {
                        title: "Dropshipping Marketing Strategies That Work (Tai Lopez)",
                        url: "https://www.youtube.com/watch?v=5X8RzJfLkQw",
                        duration: "25:30",
                        description: "Proven marketing tactics for dropshippers"
                    },
                    {
                        title: "Scaling Dropshipping to 6 Figures (Alex Hormozi)",
                        url: "https://www.youtube.com/watch?v=6r7b5MzF5Hg",
                        duration: "28:45",
                        description: "Advanced scaling strategies and automation"
                    }
                ]
            },
            {
                title: "Freelancing on Upwork - Build Your Career",
                description: "How to find clients and build a successful freelancing career on Upwork. Learn profile optimization, bidding strategies, and client management.",
                category: "freelancing",
                duration: 75,
                level: "Beginner",
                content: `Start your freelancing journey and earn from anywhere!

**Module 1: Freelancing Basics**
- What is freelancing and why it's great
- Different freelancing platforms
- Setting up your workspace

**Module 2: Upwork Profile Setup**
- Creating a compelling profile
- Writing an attractive bio
- Setting competitive rates

**Module 3: Skill Development**
- Identifying your skills
- Building a portfolio
- Getting certifications

**Module 4: Finding & Winning Jobs**
- Effective job search strategies
- Writing winning proposals
- Understanding client requirements

**Module 5: Client Communication**
- Professional communication skills
- Managing expectations
- Handling difficult clients

**Module 6: Project Management**
- Time management techniques
- Delivering quality work
- Getting positive reviews

**Module 7: Scaling Your Business**
- Increasing your rates
- Hiring subcontractors
- Building passive income streams`,
                videos: [{
                        title: "Upwork Profile Setup for Beginners (Upwork)",
                        url: "https://www.youtube.com/watch?v=7-0noLxmWQM",
                        duration: "13:20",
                        description: "Create a profile that attracts high-paying clients"
                    },
                    {
                        title: "How to Win Jobs on Upwork (Proven Strategy) (Kevin David)",
                        url: "https://www.youtube.com/watch?v=8VzBKQHkZHg",
                        duration: "16:40",
                        description: "Step-by-step guide to winning proposals"
                    },
                    {
                        title: "Freelancing Pricing Strategies & Rates (Tai Lopez)",
                        url: "https://www.youtube.com/watch?v=9W5Z8JvJcNk",
                        duration: "14:15",
                        description: "How to price your services for maximum profit"
                    },
                    {
                        title: "Building a Successful Freelance Business (Alex Hormozi)",
                        url: "https://www.youtube.com/watch?v=5X8RzJfLkQw",
                        duration: "24:30",
                        description: "From freelancer to business owner"
                    }
                ]
            },
            {
                title: "Digital Marketing for Online Businesses",
                description: "Master digital marketing strategies including SEO, social media marketing, email marketing, and paid advertising to grow your online business.",
                category: "marketing",
                duration: 80,
                level: "Intermediate",
                content: `Learn digital marketing that drives real results!

**Module 1: Marketing Fundamentals**
- Understanding digital marketing
- Setting marketing goals
- Budget planning and ROI

**Module 2: SEO Mastery**
- On-page and off-page SEO
- Keyword research techniques
- Content marketing strategies

**Module 3: Social Media Marketing**
- Platform-specific strategies
- Content creation and scheduling
- Community building

**Module 4: Email Marketing**
- Building email lists
- Creating effective campaigns
- Automation and segmentation

**Module 5: Paid Advertising**
- Google Ads and Facebook Ads
- PPC campaign optimization
- A/B testing strategies

**Module 6: Analytics & Tracking**
- Google Analytics setup
- Conversion tracking
- Performance optimization`,
                videos: [{
                        title: "Digital Marketing for Beginners 2024 (Google)",
                        url: "https://www.youtube.com/watch?v=7-0noLxmWQM",
                        duration: "15:45",
                        description: "Complete digital marketing overview"
                    },
                    {
                        title: "SEO Masterclass - Rank #1 on Google (Backlinko)",
                        url: "https://www.youtube.com/watch?v=8VzBKQHkZHg",
                        duration: "22:30",
                        description: "Advanced SEO techniques that work"
                    },
                    {
                        title: "Facebook Ads for E-commerce Stores (Facebook)",
                        url: "https://www.youtube.com/watch?v=9W5Z8JvJcNk",
                        duration: "18:20",
                        description: "Create profitable Facebook ad campaigns"
                    },
                    {
                        title: "Email Marketing Automation Setup (Mailchimp)",
                        url: "https://www.youtube.com/watch?v=5X8RzJfLkQw",
                        duration: "20:15",
                        description: "Build email lists and automate marketing"
                    }
                ]
            },
            {
                title: "E-commerce Business Launch Checklist",
                description: "Complete step-by-step checklist for launching your e-commerce business. From idea validation to your first sale and beyond.",
                category: "business",
                duration: 55,
                level: "Beginner",
                content: `Launch your e-commerce business with confidence!

**Pre-Launch Phase:**
- Market research and validation
- Business plan development
- Legal setup and registration

**Setup Phase:**
- Platform selection (Shopify, WooCommerce)
- Domain and hosting setup
- Store design and branding

**Product Phase:**
- Product sourcing strategies
- Supplier negotiations
- Inventory management setup

**Marketing Phase:**
- Brand identity development
- Marketing channel setup
- Customer acquisition strategies

**Launch Phase:**
- Soft launch testing
- Full launch execution
- Performance monitoring

**Post-Launch Phase:**
- Customer feedback collection
- Optimization and scaling
- Financial management`,
                videos: [{
                        title: "E-commerce Business Planning Guide (Shopify)",
                        url: "https://www.youtube.com/watch?v=7-0noLxmWQM",
                        duration: "16:30",
                        description: "Create a solid business plan for success"
                    },
                    {
                        title: "Product Sourcing Strategies for E-commerce (AliExpress)",
                        url: "https://www.youtube.com/watch?v=8VzBKQHkZHg",
                        duration: "14:45",
                        description: "Find products that sell and suppliers that deliver"
                    },
                    {
                        title: "E-commerce Store Launch Checklist (Shopify)",
                        url: "https://www.youtube.com/watch?v=9W5Z8JvJcNk",
                        duration: "19:20",
                        description: "Everything you need to know before launch"
                    },
                    {
                        title: "Scaling Your E-commerce Business (Tai Lopez)",
                        url: "https://www.youtube.com/watch?v=5X8RzJfLkQw",
                        duration: "23:10",
                        description: "Grow from startup to established business"
                    }
                ]
            }
        ];

        await Tutorial.insertMany(sampleTutorials);
        console.log('Sample tutorials initialized');
    }
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeTutorials();
});