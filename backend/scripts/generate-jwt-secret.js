import crypto from 'crypto';

const secret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 JWT Secret تم توليده:\n');
console.log(secret);
console.log('\n📋 انسخ هذا المفتاح وضعه في .env:\n');
console.log(`JWT_SECRET=${secret}`);
console.log('\n⚠️  احتفظ بهذا المفتاح في مكان آمن ولا تشاركه مع أحد!\n');
