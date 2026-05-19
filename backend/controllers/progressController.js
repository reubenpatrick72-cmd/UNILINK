const Progress = require('../models/Progress');
const Tutorial = require('../models/Tutorial');

const progressController = {
    // Get user progress
    getProgress: async(req, res) => {
        try {
            const userId = req.user.id;

            // Get all progress records for the user
            const progress = await Progress.find({ userId }).populate('tutorialId', 'title category level duration');

            res.json({ progress });
        } catch (error) {
            console.error('Get progress error:', error);
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Update progress for a tutorial
    updateProgress: async(req, res) => {
        try {
            const userId = req.user.id;
            const { tutorialId, completedSteps, totalSteps, timeSpent, completed } = req.body;

            // Validate required fields
            if (!tutorialId) {
                return res.status(400).json({ message: 'Tutorial ID is required.' });
            }

            // Check if tutorial exists
            const tutorial = await Tutorial.findById(tutorialId);
            if (!tutorial) {
                return res.status(404).json({ message: 'Tutorial not found.' });
            }

            // Find existing progress or create new one
            let progress = await Progress.findOne({ userId, tutorialId });

            if (progress) {
                // Update existing progress
                progress.completedSteps = completedSteps !== undefined ? completedSteps : progress.completedSteps;
                progress.totalSteps = totalSteps !== undefined ? totalSteps : progress.totalSteps;
                progress.timeSpent = timeSpent !== undefined ? progress.timeSpent + timeSpent : progress.timeSpent;
                progress.completed = completed !== undefined ? completed : progress.completed;
                progress.lastAccessed = new Date();
            } else {
                // Create new progress record
                progress = new Progress({
                    userId,
                    tutorialId,
                    completedSteps: completedSteps || 0,
                    totalSteps: totalSteps || tutorial.videos ? tutorial.videos.length : 1,
                    timeSpent: timeSpent || 0,
                    completed: completed || false,
                    lastAccessed: new Date()
                });
            }

            await progress.save();

            res.json({
                message: 'Progress updated successfully.',
                progress
            });
        } catch (error) {
            console.error('Update progress error:', error);
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Get progress for specific tutorial
    getTutorialProgress: async(req, res) => {
        try {
            const userId = req.user.id;
            const { tutorialId } = req.params;

            const progress = await Progress.findOne({ userId, tutorialId });

            if (!progress) {
                return res.json({ progress: null });
            }

            res.json({ progress });
        } catch (error) {
            console.error('Get tutorial progress error:', error);
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Get overall progress statistics
    getProgressStats: async(req, res) => {
        try {
            const userId = req.user.id;

            const progressRecords = await Progress.find({ userId });

            const totalTutorials = await Tutorial.countDocuments();
            const completedTutorials = progressRecords.filter(p => p.completed).length;
            const totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.timeSpent, 0);

            res.json({
                totalTutorials,
                completedTutorials,
                totalTimeSpent,
                completionPercentage: totalTutorials > 0 ? Math.round((completedTutorials / totalTutorials) * 100) : 0
            });
        } catch (error) {
            console.error('Get progress stats error:', error);
            res.status(500).json({ message: 'Server error.' });
        }
    }
};

module.exports = progressController;