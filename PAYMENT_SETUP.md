# ITEC Pay Payment Integration Setup

## Overview
The payment system has been simplified to use only the ITEC Pay API key in HTTP headers, removing the complex authentication with subscription keys, client IDs, and user IDs.

## Environment Variables

Add these environment variables to your `.env` file:

```env
# ITEC Pay Configuration (Single API Key for all payment methods)
ITEC_PAY_API_KEY=your_itec_pay_api_key_here
ITEC_PAY_BASE_URL=https://api.itecpay.com
ITEC_PAY_CALLBACK_URL=https://bendikpharmacyconsult.com/payment-callback

# Default payer phone number (optional)
DEFAULT_PAYER_MSISDN=250796690160
```

## Key Changes Made

### 1. Simplified Authentication
- **Before**: Used multiple API keys (MTN subscription key, API user ID, API key + Airtel client ID, client secret, X-API-Key)
- **After**: Single ITEC Pay API key in Authorization header

### 2. Unified Payment Processing
- **Before**: Separate functions for MTN, Airtel, and Card payments with different authentication methods
- **After**: Single `processITECPayment()` function that handles all payment methods

### 3. HTTP Headers
- **Before**: Complex headers with subscription keys, client IDs, etc.
- **After**: Simple Bearer token authentication:
  ```
  Authorization: Bearer YOUR_ITEC_PAY_API_KEY
  Content-Type: application/json
  Accept: application/json
  ```

## API Endpoints

The payment endpoints remain the same:
- `POST /api/pay/mtn` - MTN Mobile Money
- `POST /api/pay/airtel` - Airtel Money
- `POST /api/pay/card` - Card payments

## Request Format

All payment methods now use the same request format:

```json
{
  "purpose": "client|job|recruitment|purchase|sale",
  "phone": "250796690160" // Optional for card payments
}
```

## Response Format

```json
{
  "paymentId": 123,
  "status": "SUCCESS|FAILED|PENDING"
}
```

## Benefits

1. **Simplified Configuration**: Only one API key to manage
2. **Unified Interface**: Same API structure for all payment methods
3. **Easier Maintenance**: Single payment processing function
4. **Better Security**: No need to store multiple sensitive credentials

## Testing

To test the integration:

1. Set your ITEC Pay API key in the environment variables
2. Restart the backend server
3. Make a payment request through any of the frontend forms
4. Check the server logs for payment processing details

## Support

If you encounter any issues:
1. Check that your ITEC Pay API key is valid
2. Verify the API base URL is correct
3. Ensure your callback URL is accessible
4. Check server logs for detailed error messages
