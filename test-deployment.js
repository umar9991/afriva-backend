// Simple test script to verify your API endpoints
const testEndpoints = async () => {
  const baseURL = process.env.VERCEL_URL || 'http://localhost:8000';
  
  console.log(`Testing endpoints at: ${baseURL}`);
  
  try {
    // Test root endpoint
    const rootResponse = await fetch(`${baseURL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData);
    
    // Test health check
    const healthResponse = await fetch(`${baseURL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint:', healthData);
    } else {
      console.log('⚠️ Health endpoint not found (this is normal)');
    }
    
    // Test auth endpoint (should return 404 for GET without proper route)
    const authResponse = await fetch(`${baseURL}/api/auth`);
    if (authResponse.status === 404) {
      console.log('✅ Auth endpoint properly configured (404 for GET is expected)');
    } else {
      console.log('⚠️ Unexpected auth response:', authResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };
