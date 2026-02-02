const crypto = require('crypto');

// From your error log
const params = {
  shop: 'urgency-timer.myshopify.com',
  timestamp: '1770043503',
  logged_in_customer_id: '',
  path_prefix: '/apps/urgency-timer'
};

// Expected signature from Shopify
const receivedSignature = '873673613d4a21bf62af9122a13c1eb6055efaa8631e6cfd4a0b1402f62c5732';

// Build message (sorted alphabetically)
const pairs = Object.keys(params)
  .sort()
  .map(key => `${key}=${params[key]}`)
  .join('&');

console.log('='.repeat(80));
console.log('HMAC VALIDATION TEST');
console.log('='.repeat(80));
console.log();
console.log('Parameters (sorted):');
console.log(pairs);
console.log();
console.log('Received signature from Shopify:');
console.log(receivedSignature);
console.log();

// You need to set your actual API secret here
const apiSecret = process.env.SHOPIFY_API_SECRET || 'YOUR_API_SECRET_HERE';

if (apiSecret === 'YOUR_API_SECRET_HERE') {
  console.log('⚠️  WARNING: SHOPIFY_API_SECRET not set!');
  console.log('Set it with: SHOPIFY_API_SECRET=your-secret node test-hmac.js');
  console.log();
} else {
  console.log('Using API Secret:', apiSecret.substring(0, 4) + '...' + apiSecret.substring(apiSecret.length - 4));
  console.log();
}

// Compute signature
const computed = crypto
  .createHmac('sha256', apiSecret)
  .update(pairs, 'utf8')
  .digest('hex');

console.log('Computed signature:');
console.log(computed);
console.log();

const matches = computed.toLowerCase() === receivedSignature.toLowerCase();

if (matches) {
  console.log('✅ SUCCESS! Signatures match!');
  console.log('Your SHOPIFY_API_SECRET is correct.');
} else {
  console.log('❌ FAILED! Signatures do NOT match.');
  console.log('');
  console.log('This means one of the following:');
  console.log('1. Your SHOPIFY_API_SECRET environment variable is wrong');
  console.log('2. The API secret changed in your Shopify Partner Dashboard');
  console.log('3. You are using a secret from a different app');
  console.log('');
  console.log('To fix:');
  console.log('1. Go to Shopify Partner Dashboard');
  console.log('2. Find your "Urgency Timer" app');
  console.log('3. Copy the API secret key');
  console.log('4. Update SHOPIFY_API_SECRET in Render');
}

console.log();
console.log('='.repeat(80));
