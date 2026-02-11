import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createSuperAdmin() {
  try {
    console.log('\n🔐 إنشاء Super Admin جديد\n');

    const email = await question('Email: ');
    const username = await question('Username (اختياري، سيتم استخدام email): ');
    const password = await question('Password: ');
    const full_name = await question('Full Name: ');

    if (!email || !password || !full_name) {
      console.log('❌ جميع الحقول مطلوبة!');
      process.exit(1);
    }

    const existingUser = await pool.query(
      'SELECT id FROM staff WHERE email = $1 OR username = $2',
      [email, username || email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ المستخدم موجود بالفعل!');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO staff (email, username, password, full_name, role, active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, email, username, full_name, role`,
      [email, username || email, hashedPassword, full_name, 'super_admin']
    );

    const user = result.rows[0];

    console.log('\n✅ Super Admin تم إنشاؤه بنجاح!\n');
    console.log('معلومات المستخدم:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Full Name: ${user.full_name}`);
    console.log(`  Role: ${user.role}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();
