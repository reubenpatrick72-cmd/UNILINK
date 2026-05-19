const Tutorial = require('../models/Tutorial');

const tutorialController = {
    // Get all tutorials
    getTutorials: async(req, res) => {
        try {
            // Check if user is activated
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            if (!user.isActivated) {
                return res.status(403).json({ message: 'Account not activated. Please complete payment.' });
            }

            const tutorials = await Tutorial.find().sort({ createdAt: -1 });
            res.json({ tutorials });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Get tutorial by ID
    getTutorialById: async(req, res) => {
        try {
            const tutorial = await Tutorial.findById(req.params.id);
            if (!tutorial) {
                return res.status(404).json({ message: 'Tutorial not found.' });
            }

            // Check if user is activated
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            if (!user.isActivated) {
                return res.status(403).json({ message: 'Account not activated. Please complete payment.' });
            }

            res.json({ tutorial });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Purchase premium template
    purchaseTemplate: async(req, res) => {
        try {
            const { tutorialId, templateName } = req.body;

            // Find tutorial
            const tutorial = await Tutorial.findById(tutorialId);
            if (!tutorial) {
                return res.status(404).json({ message: 'Tutorial not found.' });
            }

            // Find template
            const template = tutorial.templates.find(t => t.name === templateName);
            if (!template) {
                return res.status(404).json({ message: 'Template not found.' });
            }

            // Check if template is premium
            if (template.type !== 'premium') {
                return res.status(400).json({ message: 'This template is not premium.' });
            }

            // Get user
            const User = require('../models/User');
            const user = await User.findById(req.user.id);

            // Check if user has enough balance (assuming they have a balance field)
            if (!user.balance || user.balance < template.price) {
                return res.status(400).json({ message: 'Insufficient balance. Please top up your account.' });
            }

            // Deduct balance
            user.balance -= template.price;
            await user.save();

            // Record the purchase (you might want to create a separate purchases collection)
            // For now, we'll just return success

            res.json({
                message: 'Template purchased successfully!',
                template: {
                    name: template.name,
                    downloadUrl: template.downloadUrl,
                    price: template.price
                }
            });
        } catch (error) {
            console.error('Template purchase error:', error);
            res.status(500).json({ message: 'Error purchasing template: ' + error.message });
        }
    }
};

module.exports = tutorialController;