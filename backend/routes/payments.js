const express = require('express');
const { randomUUID } = require('crypto');
// Ensure fetch exists (Node 18+). If not, use node-fetch via dynamic import in CJS.
let fetchFn;
// eslint-disable-next-line no-undef
if (typeof fetch !== 'undefined') {
  // eslint-disable-next-line no-undef
  fetchFn = fetch;
} else {
  fetchFn = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}
const router = express.Router();

// Separate API keys for each payment method
const ITEC_MTN_API_KEY = process.env.ITEC_MTN_API_KEY || '';
const ITEC_AIRTEL_API_KEY = process.env.ITEC_AIRTEL_API_KEY || '';
const ITEC_CARD_API_KEY = process.env.ITEC_CARD_API_KEY || '';

// Base URLs for each payment method
const ITEC_MTN_BASE_URL = process.env.ITEC_MTN_BASE_URL || 'https://pay.itecpay.rw/api/pay';
const ITEC_AIRTEL_BASE_URL = process.env.ITEC_AIRTEL_BASE_URL || 'https://pay.itecpay.rw/api/pay';
const ITEC_CARD_BASE_URL = process.env.ITEC_CARD_BASE_URL || 'https://pay.itecpay.rw/api/pay';

// Mock mode for testing (set to true to simulate payments)
const MOCK_PAYMENT_MODE = process.env.MOCK_PAYMENT_MODE === 'true' || !ITEC_MTN_API_KEY;

// Callback URL
const ITEC_PAY_CALLBACK_URL = process.env.ITEC_PAY_CALLBACK_URL || 'https://bendikpharmacyconsult.com/payment-callback';

// Card remains stubbed
const PAYMENT_KEY_CARD = process.env.PAY_KEY_CARD || 'stub-card-key';

// Remove frontend-provided secret requirement. Keep a lightweight throttle or captcha externally if needed.

// Fixed server-side pricing per form purpose (RWF)
const FORM_AMOUNTS_RWF = Object.freeze({
  client: 5000,
  job: 5000,
  recruitment: 5000,
  purchase: 10000,
  sale: 10000,
});

function getPaymentSettings(purpose) {
  const key = String(purpose || '').toLowerCase();
  const amount = FORM_AMOUNTS_RWF[key];
  if (!amount) return null;
  return { amount, currency: 'RWF' };
}

async function createPayment(db, payload) {
  const { method, amount, currency, phone = null, cardRef = null, status } = payload;
  const [result] = await db.query(
    'INSERT INTO payments (method, amount, currency, phone, cardRef, status) VALUES (?, ?, ?, ?, ?, ?)',
    [method, amount, currency, phone, cardRef, status]
  );
  return result.insertId;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Default MSISDN to charge if not provided from frontend
const DEFAULT_PAYER_MSISDN = (process.env.DEFAULT_PAYER_MSISDN || '250796690160').replace(/[^0-9]/g, '');

// ITEC Pay payment processing function with separate API keys
async function processITECPayment({ amount, currency, phone, provider }) {
  const msisdn = (phone || DEFAULT_PAYER_MSISDN).replace(/[^0-9]/g, '');
  if (!msisdn) throw new Error('Phone required');
  
  // Get the appropriate API key and base URL for the provider
  let apiKey, baseUrl;
  const upperProvider = String(provider || '').toUpperCase();
  
  switch (upperProvider) {
    case 'MTN':
      apiKey = ITEC_MTN_API_KEY;
      baseUrl = ITEC_MTN_BASE_URL;
      break;
    case 'AIRTEL':
      apiKey = ITEC_AIRTEL_API_KEY;
      baseUrl = ITEC_AIRTEL_BASE_URL;
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  console.log(`🔍 ITEC ${upperProvider} Payment: Amount=${amount}, Currency=${currency}, Phone=${msisdn}`);
  
  // Mock mode for testing
  if (MOCK_PAYMENT_MODE) {
    console.log(`🎭 MOCK MODE: Simulating ${upperProvider} payment success`);
    await delay(2000); // Simulate processing time
    return { status: 'SUCCESS', reference: `MOCK-${upperProvider}-${Date.now()}` };
  }
  
  if (!apiKey) throw new Error(`ITEC ${upperProvider} API key not configured`);
  
  try {
    const initBody = {
      amount: String(amount),
      currency: currency || 'RWF',
      msisdn,
      provider: upperProvider,
      description: 'BPC Registration Fee',
      callback_url: ITEC_PAY_CALLBACK_URL
    };

    // 1) Initiate payment prompt
    const initRes = await fetchFn(`${baseUrl}/payments/mobile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(initBody),
    });

    if (!initRes.ok) {
      const errText = await initRes.text().catch(() => 'Unknown error');
      throw new Error(`ITEC ${upperProvider} init failed: ${initRes.status} - ${errText}`);
    }

    const initJson = await initRes.json().catch(() => ({}));
    const reference = initJson.reference || initJson.id || initJson.txnId || randomUUID();

    // 2) Poll for status (short window)
    let status = 'PENDING';
    for (let i = 0; i < 10; i++) {
      await delay(2000);
      const stRes = await fetchFn(`${baseUrl}/payments/${reference}`, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
      });
      if (stRes.ok) {
        const stJson = await stRes.json().catch(() => ({}));
        const code = (stJson.status || stJson.state || '').toString().toUpperCase();
        status = code.includes('SUCCESS') || code === '000' ? 'SUCCESS' : code.includes('FAIL') ? 'FAILED' : 'PENDING';
        if (status !== 'PENDING') break;
      }
    }

    return { status, reference };
  } catch (error) {
    console.error(`🔍 ITEC ${upperProvider} error:`, error);
    throw error;
  }
}

async function processCardPayment({ amount, currency, cardToken }) {
  // Use the separate card API key
  const apiKey = ITEC_CARD_API_KEY;
  const baseUrl = ITEC_CARD_BASE_URL;
  
  console.log(`🔍 ITEC Card Payment: Amount=${amount}, Currency=${currency}`);
  
  // Mock mode for testing
  if (MOCK_PAYMENT_MODE) {
    console.log(`🎭 MOCK MODE: Simulating Card payment success`);
    await delay(2000); // Simulate processing time
    return { status: 'SUCCESS', reference: `MOCK-CARD-${Date.now()}` };
  }
  
  if (!apiKey) throw new Error('ITEC Card API key not configured');
  
  try {
    const initBody = {
      amount: String(amount),
      currency: currency || 'RWF',
      card_token: cardToken,
      description: 'BPC Registration Fee',
      callback_url: ITEC_PAY_CALLBACK_URL
    };

    // 1) Initiate card payment
    const initRes = await fetchFn(`${baseUrl}/payments/card`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(initBody),
    });

    if (!initRes.ok) {
      const errText = await initRes.text().catch(() => 'Unknown error');
      throw new Error(`ITEC Card init failed: ${initRes.status} - ${errText}`);
    }

    const initJson = await initRes.json().catch(() => ({}));
    const reference = initJson.reference || initJson.id || initJson.txnId || `CARD-${Date.now()}`;

    // 2) Poll for status (short window)
    let status = 'PENDING';
    for (let i = 0; i < 10; i++) {
      await delay(2000);
      const stRes = await fetchFn(`${baseUrl}/payments/${reference}`, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
      },
      });
      if (stRes.ok) {
        const stJson = await stRes.json().catch(() => ({}));
        const code = (stJson.status || stJson.state || '').toString().toUpperCase();
        status = code.includes('SUCCESS') || code === '000' ? 'SUCCESS' : code.includes('FAIL') ? 'FAILED' : 'PENDING';
        if (status !== 'PENDING') break;
      }
    }

    return { status, reference };
  } catch (error) {
    console.error('🔍 ITEC Card error:', error);
    throw error;
  }
}

router.post('/mtn', async (req, res) => {
  try {
    const { purpose, phone } = req.body || {};
    
    if (!purpose) {
      return res.status(400).json({ error: 'Purpose is required' });
    }
    
    const settings = getPaymentSettings(purpose);
    if (!settings) {
      return res.status(400).json({ error: `Invalid purpose: ${purpose}. Valid purposes: ${Object.keys(FORM_AMOUNTS_RWF).join(', ')}` });
    }
    
    const { amount, currency } = settings;
    console.log(`Processing MTN payment: purpose=${purpose}, amount=${amount}, phone=${phone || 'default'}`);
    
    const result = await processITECPayment({ amount, currency, phone, provider: 'MTN' });
    const id = await createPayment(req.db, { method: 'MTN', amount, currency, phone: (phone || DEFAULT_PAYER_MSISDN), status: result.status, cardRef: null });
    
    console.log(`MTN payment completed: id=${id}, status=${result.status}`);
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    console.error('MTN payment error:', err);
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

router.post('/airtel', async (req, res) => {
  try {
    const { purpose, phone } = req.body || {};
    
    if (!purpose) {
      return res.status(400).json({ error: 'Purpose is required' });
    }
    
    const settings = getPaymentSettings(purpose);
    if (!settings) {
      return res.status(400).json({ error: `Invalid purpose: ${purpose}. Valid purposes: ${Object.keys(FORM_AMOUNTS_RWF).join(', ')}` });
    }
    
    const { amount, currency } = settings;
    console.log(`Processing Airtel payment: purpose=${purpose}, amount=${amount}, phone=${phone || 'default'}`);
    
    const result = await processITECPayment({ amount, currency, phone, provider: 'AIRTEL' });
    const id = await createPayment(req.db, { method: 'AIRTEL', amount, currency, phone: (phone || DEFAULT_PAYER_MSISDN), status: result.status, cardRef: null });
    
    console.log(`Airtel payment completed: id=${id}, status=${result.status}`);
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    console.error('Airtel payment error:', err);
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

router.post('/card', async (req, res) => {
  try {
    const { purpose, cardToken } = req.body || {};
    
    if (!purpose) {
      return res.status(400).json({ error: 'Purpose is required' });
    }
    
    const settings = getPaymentSettings(purpose);
    if (!settings) {
      return res.status(400).json({ error: `Invalid purpose: ${purpose}. Valid purposes: ${Object.keys(FORM_AMOUNTS_RWF).join(', ')}` });
    }
    
    const { amount, currency } = settings;
    console.log(`Processing Card payment: purpose=${purpose}, amount=${amount}`);
    
    const result = await processCardPayment({ amount, currency, cardToken });
    const id = await createPayment(req.db, { method: 'CARD', amount, currency, phone: null, status: result.status, cardRef: cardToken });
    
    console.log(`Card payment completed: id=${id}, status=${result.status}`);
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    console.error('Card payment error:', err);
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

module.exports = router;


