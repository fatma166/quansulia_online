import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n📊 Testing Supabase Connection...\n');

  try {
    // 1. Test application_statuses table
    console.log('1️⃣ Testing application_statuses table...');
    const { data: statuses, error: statusError } = await supabase
      .from('application_statuses')
      .select('*')
      .order('order_index');

    if (statusError) {
      console.error('❌ Error loading statuses:', statusError);
    } else {
      console.log(`✅ Found ${statuses?.length || 0} statuses:`);
      statuses?.forEach(status => {
        console.log(`   - ${status.name_ar} (${status.name_en}) - Color: ${status.color}`);
      });
    }

    // 2. Test applications table
    console.log('\n2️⃣ Testing applications table...');
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('id, reference_number, status_id, created_at')
      .limit(5);

    if (appsError) {
      console.error('❌ Error loading applications:', appsError);
    } else {
      console.log(`✅ Found ${apps?.length || 0} applications (showing first 5):`);
      apps?.forEach(app => {
        console.log(`   - ${app.reference_number} - Status ID: ${app.status_id}`);
      });
    }

    // 3. Test appointments table
    console.log('\n3️⃣ Testing appointments table...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, application_id, appointment_date, time_slot')
      .limit(5);

    if (appointmentsError) {
      console.error('❌ Error loading appointments:', appointmentsError);
    } else {
      console.log(`✅ Found ${appointments?.length || 0} appointments (showing first 5):`);
      appointments?.forEach(apt => {
        console.log(`   - App ID: ${apt.application_id} - Date: ${apt.appointment_date} - Time: ${apt.time_slot}`);
      });
    }

    // 4. Test documents in applications
    console.log('\n4️⃣ Testing documents in applications...');
    const { data: appsWithDocs, error: docsError } = await supabase
      .from('applications')
      .select('id, reference_number, documents')
      .not('documents', 'is', null)
      .limit(5);

    if (docsError) {
      console.error('❌ Error loading documents:', docsError);
    } else {
      console.log(`✅ Found ${appsWithDocs?.length || 0} applications with documents:`);
      appsWithDocs?.forEach(app => {
        const docCount = app.documents ? Object.keys(app.documents).length : 0;
        console.log(`   - ${app.reference_number} - ${docCount} documents`);
      });
    }

    // 5. Test status_history table
    console.log('\n5️⃣ Testing status_history table...');
    const { data: history, error: historyError } = await supabase
      .from('status_history')
      .select('id, application_id, status_id, staff_name, notes, created_at')
      .limit(5);

    if (historyError) {
      console.error('❌ Error loading status history:', historyError);
    } else {
      console.log(`✅ Found ${history?.length || 0} status history records (showing first 5):`);
      history?.forEach(h => {
        console.log(`   - App ID: ${h.application_id} - Status ID: ${h.status_id} - By: ${h.staff_name || 'System'}`);
      });
    }

    console.log('\n✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

testConnection();
