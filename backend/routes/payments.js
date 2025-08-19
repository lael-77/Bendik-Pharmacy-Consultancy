const express = require('express');
const { randomUUID } = require('crypto');
const router = express.Router();

// Static API keys provided (consider moving to env var in production)
const PAYMENT_KEY_MTN = process.env.PAY_KEY_MTN || 'eGx562IiN7y31CmZCnYgFerDPVN+RuGthpAkpawB58pUrEvZm+bEePUVLWHpsgIEvMCIHDIS0ygoZucUtSaEdA==';
const PAYMENT_KEY_AIRTEL = process.env.PAY_KEY_AIRTEL || 'eGx562IiN7y31CmZCnYgFWP6klUZxlfCIBWYUsiETtNxlt9+LkWIb/DOC/iL8133G8zkBUIvPXwHWB00j5lMIA==';
const PAYMENT_KEY_CARD = process.env.PAY_KEY_CARD || 'eGx562IiN7y31CmZCnYgFTHI4tl+adwa/+OkptwzzWbBWHsSHMAgIetQkqLBkSjtyQ8QPcRmBB4xs29dfynTrQ==';

function requireApiKey(expectedKey) {
  return (req, res, next) => {
    const apiKey = req.header('X-Api-Key');
    if (!apiKey || apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };
}

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

// MTN MoMo Collections (LIVE) via REST (no SDK)
async function processMtnPayment({ amount, currency, phone }) {
  const msisdn = (phone || DEFAULT_PAYER_MSISDN).replace(/[^0-9]/g, '');
  if (!msisdn) throw new Error('Phone required');
  
  // Use the provided API key directly
  const API_KEY = PAYMENT_KEY_MTN;
  const BASE_URL = 'https://proxy.momoapi.mtn.com/collection';
  const TARGET_ENV = 'live';
  
  try {
    // 1) Get OAuth token using your API key
    const tokenRes = await fetch(`${BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Content-Length': '0',
      },
    });
    
    if (!tokenRes.ok) {
      throw new Error(`MTN token failed: ${tokenRes.status}`);
    }
    
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    // 2) Create request to pay - THIS TRIGGERS THE MTN PROMPT
    const referenceId = randomUUID();
    const rtpBody = {
      amount: String(amount),
      currency,
      externalId: referenceId,
      payer: { partyIdType: 'MSISDN', partyId: msisdn },
      payerMessage: 'BPC Registration Fee',
      payeeNote: 'BPC',
    };
    
    const rtpRes = await fetch(`${BASE_URL}/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': TARGET_ENV,
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rtpBody),
    });
    
    if (rtpRes.status !== 202) {
      throw new Error(`MTN request failed: ${rtpRes.status}`);
    }

    // 3) Poll for payment status - WAIT FOR CLIENT TO CONFIRM
    let status = 'PENDING';
    for (let i = 0; i < 10; i++) { // Poll for up to 20 seconds
      await delay(2000);
      const statusRes = await fetch(`${BASE_URL}/v1_0/requesttopay/${referenceId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Target-Environment': TARGET_ENV,
          'Ocp-Apim-Subscription-Key': API_KEY,
        },
      });
      
      if (statusRes.ok) {
        const js = await statusRes.json().catch(() => ({}));
        status = (js.status || '').toUpperCase();
        console.log(`MTN Payment status: ${status}`);
        
        if (status === 'SUCCESSFUL' || status === 'FAILED') break;
      }
    }
    
    return {
      status: status === 'SUCCESSFUL' ? 'SUCCESS' : status === 'FAILED' ? 'FAILED' : 'PENDING',
      reference: referenceId,
    };
    
  } catch (error) {
    console.error('MTN Payment error:', error);
    throw error;
  }
}

// Airtel Money (LIVE) via REST (no SDK) - Ekash System
async function processAirtelPayment({ amount, currency, phone }) {
  const msisdn = (phone || DEFAULT_PAYER_MSISDN).replace(/[^0-9]/g, '');
  if (!msisdn) throw new Error('Phone required');
  
  // Use the provided API key directly
  const API_KEY = PAYMENT_KEY_AIRTEL;
  const BASE_URL = 'https://openapi.airtel.africa';
  const COUNTRY = 'RW';
  const CURRENCY = currency || 'RWF';
  
  try {
    // 1) Get OAuth token using your API key
    const authRes = await fetch(`${BASE_URL}/auth/oauth2/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ 
        client_id: API_KEY,
        client_secret: API_KEY,
        grant_type: 'client_credentials' 
      }),
    });
    
    if (!authRes.ok) {
      throw new Error(`Airtel auth failed: ${authRes.status}`);
    }
    
    const authJson = await authRes.json();
    const accessToken = authJson.access_token;

    // 2) Initiate payment - THIS TRIGGERS THE AIRTEL EKASH PROMPT
    const reference = randomUUID();
    const payBody = {
      reference,
      subscriber: { 
        country: COUNTRY, 
        currency: CURRENCY, 
        msisdn 
      },
      transaction: { 
        amount: String(amount), 
        country: COUNTRY, 
        currency: CURRENCY 
      },
    };
    
    const payRes = await fetch(`${BASE_URL}/merchant/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Country': COUNTRY,
        'X-Currency': CURRENCY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payBody),
    });
    
    if (!payRes.ok) {
      throw new Error(`Airtel payment failed: ${payRes.status}`);
    }
    
    const payJson = await payRes.json().catch(() => ({}));
    console.log('Airtel payment response:', payJson);

    // 3) Poll for payment status - WAIT FOR CLIENT TO CONFIRM
    let status = 'PENDING';
    for (let i = 0; i < 10; i++) { // Poll for up to 20 seconds
      await delay(2000);
      
      const statusRes = await fetch(`${BASE_URL}/merchant/v1/payments/${reference}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Country': COUNTRY,
          'X-Currency': CURRENCY,
        },
      });
      
      if (statusRes.ok) {
        const statusJson = await statusRes.json().catch(() => ({}));
        const resultCode = statusJson?.status?.result_code || statusJson?.data?.status?.result_code;
        status = resultCode === '000' ? 'SUCCESS' : resultCode ? 'FAILED' : 'PENDING';
        console.log(`Airtel Payment status: ${status} (${resultCode})`);
        
        if (status === 'SUCCESS' || status === 'FAILED') break;
      }
    }
    
    return { 
      status: status === 'SUCCESS' ? 'SUCCESS' : status === 'FAILED' ? 'FAILED' : 'PENDING', 
      reference 
    };
    
  } catch (error) {
    console.error('Airtel Payment error:', error);
    throw error;
  }
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

router.post('/mtn', requireApiKey(PAYMENT_KEY_MTN), async (req, res) => {
  try {
    const { purpose, phone } = req.body || {};
    const settings = getPaymentSettings(purpose);
    if (!settings) return res.status(400).json({ error: 'Invalid purpose' });
    const { amount, currency } = settings;
    const result = await processMtnPayment({ amount, currency, phone });
    const id = await createPayment(req.db, { method: 'MTN', amount, currency, phone: (phone || DEFAULT_PAYER_MSISDN), status: result.status, cardRef: null });
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

router.post('/airtel', requireApiKey(PAYMENT_KEY_AIRTEL), async (req, res) => {
  try {
    const { purpose, phone } = req.body || {};
    const settings = getPaymentSettings(purpose);
    if (!settings) return res.status(400).json({ error: 'Invalid purpose' });
    const { amount, currency } = settings;
    const result = await processAirtelPayment({ amount, currency, phone });
    const id = await createPayment(req.db, { method: 'AIRTEL', amount, currency, phone: (phone || DEFAULT_PAYER_MSISDN), status: result.status, cardRef: null });
    return res.json({ paymentId: id, status: result.status });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Payment failed' });
  }
});

router.post('/card', requireApiKey(PAYMENT_KEY_CARD), async (req, res) => {
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


