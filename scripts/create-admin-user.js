import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@consulate.gov.sd');
      console.log('🔑 Password: admin123');
      console.log('👤 Username: admin');
    } else {
      console.error('❌ Error creating admin user:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();
