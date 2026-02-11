#!/usr/bin/env node

/**
 * Generate JWT Keys for Supabase Self-hosted
 * يولد المفاتيح اللازمة لـ Supabase Self-hosted
 */

const crypto = require('crypto');

// Generate JWT Secret (32+ characters)
function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Simple JWT encoding (for demo purposes - in production use proper JWT library)
function generateKey(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

// Generate Anon Key
function generateAnonKey(secret) {
  const payload = {
    role: 'anon',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
  };

  return generateKey(payload, secret);
}

// Generate Service Role Key
function generateServiceKey(secret) {
  const payload = {
    role: 'service_role',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
  };

  return generateKey(payload, secret);
}

// Main execution
console.log('🔐 Generating JWT Keys for Supabase Self-hosted\n');
console.log('=' .repeat(70));

const jwtSecret = generateJWTSecret();
console.log('\n📝 JWT_SECRET:');
console.log(jwtSecret);

const anonKey = generateAnonKey(jwtSecret);
console.log('\n🔑 ANON_KEY:');
console.log(anonKey);

const serviceKey = generateServiceKey(jwtSecret);
console.log('\n🔐 SERVICE_ROLE_KEY:');
console.log(serviceKey);

console.log('\n' + '=' .repeat(70));
console.log('\n✅ Keys generated successfully!\n');
console.log('📋 Copy these values to your .env.production file:\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ANON_KEY=${anonKey}`);
console.log(`SERVICE_ROLE_KEY=${serviceKey}`);
console.log('\n⚠️  IMPORTANT: Keep these keys secret and secure!');
console.log('   Do NOT commit them to version control!\n');
