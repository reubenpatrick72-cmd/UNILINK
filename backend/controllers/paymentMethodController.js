const PaymentMethod = require('../models/PaymentMethod');

const paymentMethodController = {
    addMethod: async (req, res) => {
        try {
            const { methodName, accountNumber, businessName, isDefault } = req.body;
            const userId = req.user.id;

            if (!methodName || !accountNumber || !businessName) {
                return res.status(400).json({ message: 'Please provide method name, account number, and business name.' });
            }

            if (!['paybill', 'till'].includes(methodName)) {
                return res.status(400).json({ message: 'Payment method must be either paybill or till.' });
            }

            if (isDefault) {
                await PaymentMethod.updateMany({ userId }, { isDefault: false });
            }

            const paymentMethod = await PaymentMethod.create({
                userId,
                methodName,
                accountNumber,
                businessName,
                isDefault: Boolean(isDefault)
            });

            res.status(201).json({ paymentMethod });
        } catch (error) {
            console.error('Add payment method error:', error);
            res.status(500).json({ message: 'Failed to add payment method.' });
        }
    },

    listMethods: async (req, res) => {
        try {
            const userId = req.user.id;
            const paymentMethods = await PaymentMethod.find({ userId, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
            res.json({ paymentMethods });
        } catch (error) {
            console.error('List payment methods error:', error);
            res.status(500).json({ message: 'Failed to retrieve payment methods.' });
        }
    },

    updateMethod: async (req, res) => {
        try {
            const { id } = req.params;
            const { methodName, accountNumber, businessName, isDefault, isActive } = req.body;
            const userId = req.user.id;

            const paymentMethod = await PaymentMethod.findOne({ _id: id, userId });
            if (!paymentMethod) {
                return res.status(404).json({ message: 'Payment method not found.' });
            }

            if (isDefault) {
                await PaymentMethod.updateMany({ userId }, { isDefault: false });
            }

            paymentMethod.methodName = methodName || paymentMethod.methodName;
            paymentMethod.accountNumber = accountNumber || paymentMethod.accountNumber;
            paymentMethod.businessName = businessName || paymentMethod.businessName;
            paymentMethod.isDefault = typeof isDefault === 'boolean' ? isDefault : paymentMethod.isDefault;
            paymentMethod.isActive = typeof isActive === 'boolean' ? isActive : paymentMethod.isActive;
            paymentMethod.updatedAt = new Date();

            await paymentMethod.save();
            res.json({ paymentMethod });
        } catch (error) {
            console.error('Update payment method error:', error);
            res.status(500).json({ message: 'Failed to update payment method.' });
        }
    },

    deleteMethod: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const paymentMethod = await PaymentMethod.findOne({ _id: id, userId });
            if (!paymentMethod) {
                return res.status(404).json({ message: 'Payment method not found.' });
            }

            paymentMethod.isActive = false;
            paymentMethod.updatedAt = new Date();
            await paymentMethod.save();

            res.json({ message: 'Payment method removed successfully.' });
        } catch (error) {
            console.error('Delete payment method error:', error);
            res.status(500).json({ message: 'Failed to remove payment method.' });
        }
    }
};

module.exports = paymentMethodController;
