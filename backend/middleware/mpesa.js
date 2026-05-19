const axios = require('axios');

// Mpesa configuration
const MPESA_CONFIG = {
    consumerKey: process.env.MPESA_CONSUMER_KEY || 'your-consumer-key',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'your-consumer-secret',
    defaultShortcode: process.env.MPESA_SHORTCODE || 'your-default-shortcode',
    passkey: process.env.MPESA_PASSKEY || 'your-passkey',
    baseUrl: process.env.MPESA_ENV === 'production' 
        ? 'https://api.safaricom.co.ke' 
        : 'https://sandbox.safaricom.co.ke'
};

// Get access token
async function getAccessToken() {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    try {
        const response = await axios.get(`${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Initiate STK push with custom payment method
async function initiateSTKPush(phoneNumber, amount, accountReference, customShortcode = null, paymentType = 'paybill') {
    const accessToken = await getAccessToken();
    
    const shortcode = customShortcode || MPESA_CONFIG.defaultShortcode;
    const transactionType = paymentType === 'till' ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline';
    
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortcode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
    
    const requestBody = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.CALLBACK_URL || 'https://your-domain.com/api/payment/callback',
        AccountReference: accountReference,
        TransactionDesc: 'UniLink Account Activation'
    };
    
    try {
        const response = await axios.post(`${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error initiating STK push:', error);
        throw error;
    }
}

// Check payment status
async function checkPaymentStatus(checkoutRequestId, customShortcode = null) {
    const accessToken = await getAccessToken();
    
    const shortcode = customShortcode || MPESA_CONFIG.defaultShortcode;
    
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortcode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
    
    const requestBody = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
    };
    
    try {
        const response = await axios.post(`${MPESA_CONFIG.baseUrl}/mpesa/stkpushquery/v1/query`, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const resultCode = response.data.ResponseCode;
        
        if (resultCode === '0') {
            return 'completed';
        } else if (resultCode === '1') {
            return 'processing';
        } else {
            return 'failed';
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
}

module.exports = {
    initiateSTKPush,
    checkPaymentStatus,
    MPESA_CONFIG
};
