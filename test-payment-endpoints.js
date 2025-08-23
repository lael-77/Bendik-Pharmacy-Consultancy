// Test script to verify payment endpoints
// Run with: node test-payment-endpoints.js

const BACKEND_URL = 'https://bendik-pharmacy-consultancy.onrender.com';

async function testPaymentEndpoint(method, purpose, phone = null) {
  const url = `${BACKEND_URL}/api/pay/${method}`;
  const payload = { purpose };
  
  if (phone) {
    payload.phone = phone;
  }
  
  console.log(`\n🔍 Testing ${method.toUpperCase()} payment for purpose: ${purpose}`);
  console.log(`URL: ${url}`);
  console.log(`Payload:`, payload);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success:`, data);
    } else {
      console.log(`❌ Error:`, data);
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.log(`❌ Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Payment Endpoints\n');
  console.log('=' .repeat(50));
  
  // Test all payment methods with different purposes
  const testCases = [
    { method: 'mtn', purpose: 'client', phone: '250796690160' },
    { method: 'airtel', purpose: 'job', phone: '250796690160' },
    { method: 'card', purpose: 'recruitment' },
    { method: 'mtn', purpose: 'purchase', phone: '250796690160' },
    { method: 'airtel', purpose: 'sale', phone: '250796690160' },
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testPaymentEndpoint(
      testCase.method, 
      testCase.purpose, 
      testCase.phone
    );
    results.push({ ...testCase, ...result });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`- ${result.method.toUpperCase()} ${result.purpose}: ${result.error || result.data?.error}`);
    });
  }
}

// Run the tests
runTests().catch(console.error);
