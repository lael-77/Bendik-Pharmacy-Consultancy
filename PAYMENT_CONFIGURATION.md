# Payment Configuration Guide

## Environment Variables Required

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bobo
DB_PORT=3306

# ITEC Pay Configuration (Separate API Keys for each payment method)
ITEC_MTN_API_KEY=your_itec_mtn_api_key_here
ITEC_AIRTEL_API_KEY=your_itec_airtel_api_key_here
ITEC_CARD_API_KEY=your_itec_card_api_key_here

# Base URLs for each payment method (can be different for each provider)
ITEC_MTN_BASE_URL=https://api.itecpay.com
ITEC_AIRTEL_BASE_URL=https://api.itecpay.com
ITEC_CARD_BASE_URL=https://api.itecpay.com

# Callback URL for payment notifications
ITEC_PAY_CALLBACK_URL=https://bendikpharmacyconsult.com/payment-callback

# Default payer phone number (optional)
DEFAULT_PAYER_MSISDN=250796690160

# Card payment key (for future implementation)
PAY_KEY_CARD=stub-card-key

# Server Configuration
PORT=3001
```

## Frontend-Backend Integration Status

### ✅ Fixed Issues:
1. **Separate API Keys**: Each payment method (MTN, Airtel, Card) now uses its own dedicated API key
2. **Correct HTTP Headers**: Uses `Authorization: Bearer` instead of `X-API-Key`
3. **Proper Purpose Mapping**: Each form now sends the correct purpose:
   - `client-form.html` → `purpose: 'client'`
   - `job-application.html` → `purpose: 'job'`
   - `recruitment-request.html` → `purpose: 'recruitment'`
   - `purchase-pharmacy.html` → `purpose: 'purchase'`
   - `sell-pharmacy.html` → `purpose: 'sale'`

### ✅ Backend URLs:
All frontend forms are correctly configured to use:
- **Backend Base URL**: `https://bendik-pharmacy-consultancy.onrender.com`
- **Payment Endpoints**:
  - MTN: `/api/pay/mtn`
  - Airtel: `/api/pay/airtel`
  - Card: `/api/pay/card`

### ✅ Payment Amounts:
- Client Request: RWF 5,000
- Job Application: RWF 5,000
- Recruitment Request: RWF 5,000
- Pharmacy Purchase: RWF 10,000
- Pharmacy Sale: RWF 10,000

## Testing the Integration

### 1. Backend Setup:
```bash
cd backend
npm install
# Create .env file with your ITEC Pay API key
npm start
```

### 2. Frontend Testing:
1. Open any form (e.g., `client-form.html`)
2. Fill out the form
3. Click "Pay & Submit"
4. Select payment method (MTN/Airtel/Card)
5. Enter phone number (for mobile money)
6. Click "Proceed to Pay"

### 3. Expected Flow:
1. Frontend sends payment request to backend
2. Backend calls ITEC Pay API with Bearer token
3. ITEC Pay sends payment prompt to user's phone
4. Backend polls for payment status
5. On success, form data is submitted
6. User sees success message

## Troubleshooting

### Common Issues:

1. **"ITEC [PROVIDER] API key not configured"**
   - Ensure the appropriate API key is set in `.env`:
     - `ITEC_MTN_API_KEY` for MTN payments
     - `ITEC_AIRTEL_API_KEY` for Airtel payments
     - `ITEC_CARD_API_KEY` for Card payments
   - Restart the backend server

2. **"Payment failed"**
   - Check backend logs for detailed error messages
   - Verify the specific API key for the payment method is valid
   - Ensure phone number format is correct (07xxxxxxxx)
   - Check that the correct base URL is configured for each provider

3. **CORS errors**
   - Backend is configured to allow requests from:
     - `https://bendikpharmacyconsult.com`
     - `https://bendik-pharmacy-consultancy.onrender.com`
     - `http://localhost:3000`

4. **Form submission fails after payment**
   - Check that the form endpoint is correct
   - Verify database connection
   - Check backend logs for form submission errors

### Debug Mode:
The backend now includes detailed logging for payment operations. Check the console for:
- `🔍 ITEC MTN Payment: Amount=5000, Currency=RWF, Phone=250796690160`
- `🔍 ITEC AIRTEL Payment: Amount=5000, Currency=RWF, Phone=250796690160`
- `🔍 ITEC Card Payment: Amount=5000, Currency=RWF`
- Payment status updates
- Error messages with full details

## Security Notes

1. **API Key Security**: Never commit your ITEC Pay API key to version control
2. **HTTPS**: All production requests use HTTPS
3. **Input Validation**: Phone numbers are sanitized to remove non-numeric characters
4. **Error Handling**: Sensitive information is not exposed in error messages

## Next Steps

1. **Get API Keys**: Contact ITEC Pay to get separate API keys for each payment method:
   - MTN Mobile Money API key
   - Airtel Money API key
   - Card payment API key
2. **Test with Real APIs**: Replace the API keys and test with real payments
3. **Monitor Logs**: Keep an eye on backend logs for any issues
4. **Set up Callbacks**: Configure the callback URL for payment notifications
