const mpesa = require('../middleware/mpesa');
const PaymentMethod = require('../models/PaymentMethod');

const paymentController = {
    // Initiate M-Pesa payment
    initiatePayment: async (req, res) => {
        try {
            const { phone, amount, paymentMethodId, methodName, accountNumber } = req.body;
            const userId = req.user.id;

            if (!phone || !amount) {
                return res.status(400).json({ message: 'Phone number and amount are required.' });
            }

            let paymentMethod = null;

            if (paymentMethodId) {
                paymentMethod = await PaymentMethod.findOne({ _id: paymentMethodId, userId, isActive: true });
            }

            if (!paymentMethod && accountNumber && methodName) {
                paymentMethod = {
                    accountNumber,
                    methodName
                };
            }

            if (!paymentMethod) {
                paymentMethod = await PaymentMethod.findOne({ userId, isDefault: true, isActive: true });
            }

            const shortcode = paymentMethod?.accountNumber || process.env.MPESA_SHORTCODE || 'your-shortcode';
            const gatewayMethod = paymentMethod?.methodName || 'paybill';

            const result = await mpesa.initiateSTKPush(
                phone,
                amount,
                userId,
                shortcode,
                gatewayMethod
            );

            res.json({
                checkoutRequestId: result.CheckoutRequestID,
                message: 'STK push initiated successfully.'
            });
        } catch (error) {
            console.error('Payment initiation error:', error);
            res.status(500).json({ message: 'Failed to initiate payment.' });
        }
    },

    // Check payment status
    checkPaymentStatus: async (req, res) => {
        try {
            const { checkoutRequestId } = req.params;

            // By default use the configured shortcode when checking status
            const status = await mpesa.checkPaymentStatus(checkoutRequestId);

            if (status === 'completed') {
                const User = require('../models/User');
                await User.findByIdAndUpdate(req.user.id, {
                    isActivated: true,
                    activationDate: new Date()
                });
            }

            res.json({ status });
        } catch (error) {
            console.error('Payment status check error:', error);
            res.status(500).json({ message: 'Failed to check payment status.' });
        }
    }
};

module.exports = paymentController;