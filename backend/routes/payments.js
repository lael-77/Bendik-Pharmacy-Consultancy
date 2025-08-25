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

// ITEC Pay provider-specific API keys and base URLs
const ITEC_MTN_API_KEY = process.env.ITEC_MTN_API_KEY || '';
const ITEC_MTN_BASE_URL = process.env.ITEC_MTN_BASE_URL || 'https://pay.itecpay.rw/api/pay';
const ITEC_AIRTEL_API_KEY = process.env.ITEC_AIRTEL_API_KEY || '';
const ITEC_AIRTEL_BASE_URL = process.env.ITEC_AIRTEL_BASE_URL || 'https://pay.itecpay.rw/api/pay';

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

// MTN mobile money via ITEC Pay (LIVE)
async function processMtnPayment({ amount, currency, phone }) {
  const msisdn = (phone || DEFAULT_PAYER_MSISDN).replace(/[^0-9]/g, '');
  if (!msisdn) throw new Error('Phone required');
  console.log(`🔍 ITEC MTN Payment: Amount=${amount}, Currency=${currency}, Phone=${msisdn}`);
  try {
    const body = { provider: 'MTN', msisdn, amount: String(amount), currency };
    const initRes = await fetchFn(`${ITEC_BASE_URL}/mobile/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': ITEC_API_KEY },
      body: JSON.stringify(body),
    });
    if (!initRes.ok && initRes.status !== 202) {
      const errorText = await initRes.text().catch(() => 'Unknown error');
      throw new Error(`ITEC MTN init failed: ${initRes.status} - ${errorText}`);
    }
    const initJson = await initRes.json().catch(() => ({}));
    const reference = initJson.reference || initJson.transactionId || randomUUID();
    let status = 'PENDING';
    for (let i = 0; i < 10; i++) {
      await delay(2000);
      const statusRes = await fetchFn(`${ITEC_BASE_URL}/mobile/status/${reference}`, { headers: { 'X-API-Key': ITEC_API_KEY } });
      if (statusRes.ok) {
        const js = await statusRes.json().catch(() => ({}));
        const s = (js.status || js.result || '').toString().toUpperCase();
        if (s.includes('SUCCESS')) { status = 'SUCCESS'; break; }
        if (s.includes('FAIL')) { status = 'FAILED'; break; }
      }
    }
    return { status, reference };
  } catch (error) {
    console.error('🔍 ITEC MTN error:', error);
    throw error;
  }
}

// Airtel Money via ITEC Pay (LIVE)
async function processAirtelPayment({ amount, currency, phone }) {
  const msisdn = (phone || DEFAULT_PAYER_MSISDN).replace(/[^0-9]/g, '');
  if (!msisdn) throw new Error('Phone required');
  console.log(`🔍 ITEC Airtel Payment: Amount=${amount}, Currency=${currency}, Phone=${msisdn}`);
  try {
    const body = { provider: 'AIRTEL', msisdn, amount: String(amount), currency };
    const initRes = await fetchFn(`${ITEC_BASE_URL}/mobile/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': ITEC_API_KEY },
      body: JSON.stringify(body),
    });
    if (!initRes.ok && initRes.status !== 202) {
      const errorText = await initRes.text().catch(() => 'Unknown error');
      throw new Error(`ITEC Airtel init failed: ${initRes.status} - ${errorText}`);
    }
    const initJson = await initRes.json().catch(() => ({}));
    const reference = initJson.reference || initJson.transactionId || randomUUID();
    let status = 'PENDING';
    for (let i = 0; i < 10; i++) {
      await delay(2000);
      const statusRes = await fetchFn(`${ITEC_BASE_URL}/mobile/status/${reference}`, { headers: { 'X-API-Key': ITEC_API_KEY } });
      if (statusRes.ok) {
        const js = await statusRes.json().catch(() => ({}));
        const s = (js.status || js.result || '').toString().toUpperCase();
        if (s.includes('SUCCESS')) { status = 'SUCCESS'; break; }
        if (s.includes('FAIL')) { status = 'FAILED'; break; }
      }
    }
    return { status, reference };
  } catch (error) {
    console.error('🔍 ITEC Airtel error:', error);
    throw error;
  }
}

// ITEC Pay generic mobile money payment using a single API key header
async function processItecPayment({ amount, currency, phone, provider }) {
  const msisdn = (phone || DEFAULT_PAYER_MSISDN).replace(/[^0-9]/g, '');
  if (!msisdn) throw new Error('Phone required');
  const upper = String(provider || '').toUpperCase();
  const apiKey = upper === 'MTN' ? ITEC_MTN_API_KEY : upper === 'AIRTEL' ? ITEC_AIRTEL_API_KEY : '';
  const baseUrl = upper === 'MTN' ? ITEC_MTN_BASE_URL : upper === 'AIRTEL' ? ITEC_AIRTEL_BASE_URL : '';
  if (!apiKey) throw new Error(`Missing ITEC API key for ${upper}`);
  if (!baseUrl) throw new Error(`Missing ITEC base URL for ${upper}`);

  const initBody = {
    amount: String(amount),
    currency: currency || 'RWF',
    msisdn,
    provider: String(provider || '').toUpperCase(),
    description: 'BPC Registration Fee'
  };

  // 1) Initiate payment prompt
  const initRes = await fetchFn(`${baseUrl}/payments/mobile`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(initBody),
  });

  if (!initRes.ok) {
    const errText = await initRes.text().catch(() => 'Unknown error');
    throw new Error(`ITEC init failed: ${initRes.status} - ${errText}`);
  }

  const initJson = await initRes.json().catch(() => ({}));
  const reference = initJson.reference || initJson.id || initJson.txnId || randomUUID();

  // 2) Poll for status (short window)
  let status = 'PENDING';
  for (let i = 0; i < 10; i++) {
    await delay(2000);
    const stRes = await fetchFn(`${baseUrl}/payments/${reference}`, {
      headers: { 'X-API-Key': apiKey },
    });
    if (stRes.ok) {
      const stJson = await stRes.json().catch(() => ({}));
      const code = (stJson.status || stJson.state || '').toString().toUpperCase();
      status = code.includes('SUCCESS') || code === '000' ? 'SUCCESS' : code.includes('FAIL') ? 'FAILED' : 'PENDING';
      if (status !== 'PENDING') break;
    }
  }

  return { status, reference };
}

async function processCardPayment({ amount, currency, cardToken }) {
  // Use the provided API key directly
  const API_KEY = PAYMENT_KEY_CARD;
  
  // For Card payments, we'll use a simplified approach with the provided key
  const reference = `CARD-${Date.now()}`;
  
  // Simulate Card payment with the provided key
  console.log(`Card Payment initiated: ${amount} ${currency} with key: ${API_KEY.substring(0, 20)}...`);
  
  // Simulate payment processing
  await delay(2000);
  
  // For now, return success (you can modify this based on actual Card API response)
  return { 
    status: 'SUCCESS', 
    reference 
  };
}

router.post('/mtn', async (req, res) => {
  try {
    const { purpose, phone } = req.body || {};
    const settings = getPaymentSettings(purpose);
    if (!settings) return res.status(400).json({ error: 'Invalid purpose' });
    const { amount, currency } = settings;
    const result = await processItecPayment({ amount, currency, phone, provider: 'MTN' });
    const id = await createPayment(req.db, { method: 'MTN', amount, currency, phone: (phone || DEFAULT_PAYER_MSISDN), status: result.status, cardRef: null });
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

router.post('/airtel', async (req, res) => {
  try {
    const { purpose, phone } = req.body || {};
    const settings = getPaymentSettings(purpose);
    if (!settings) return res.status(400).json({ error: 'Invalid purpose' });
    const { amount, currency } = settings;
    const result = await processItecPayment({ amount, currency, phone, provider: 'AIRTEL' });
    const id = await createPayment(req.db, { method: 'AIRTEL', amount, currency, phone: (phone || DEFAULT_PAYER_MSISDN), status: result.status, cardRef: null });
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

router.post('/card', async (req, res) => {
  try {
    const { purpose, cardToken } = req.body || {};
    const settings = getPaymentSettings(purpose);
    if (!settings) return res.status(400).json({ error: 'Invalid purpose' });
    const { amount, currency } = settings;
    const result = await processCardPayment({ amount, currency, cardToken });
    const id = await createPayment(req.db, { method: 'CARD', amount, currency, phone: null, status: result.status, cardRef: cardToken });
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

module.exports = router;


