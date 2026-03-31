import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qaioxhpcyzmamcvdqqub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODk5MjksImV4cCI6MjA3NTI2NTkyOX0.ONSoZu18CxounMDqf0byUuD6pRhiGSrSJnT3dqoXCjQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to Supabase...\n');
  
  // Test application_statuses table
  console.log('=== Application Statuses ===');
  const { data: statuses, error: statusError } = await supabase
    .from('application_statuses')
    .select('*')
    .order('order_index');
  
  if (statusError) {
    console.error('Error fetching statuses:', statusError);
  } else {
    console.log(`Found ${statuses.length} statuses:`);
    statuses.forEach(s => {
      console.log(`  - ${s.name_ar} (${s.status_key}) - Order: ${s.order_index}, Active: ${s.is_active}`);
    });
  }
  
  // Test applications table
  console.log('\n=== Applications ===');
  const { data: apps, error: appsError, count } = await supabase
    .from('applications')
    .select('id, reference_number, status, status_id, created_at', { count: 'exact' })
    .limit(5);
  
  if (appsError) {
    console.error('Error fetching applications:', appsError);
  } else {
    console.log(`Total applications: ${count}`);
    console.log('First 5 applications:');
    apps.forEach(a => {
      console.log(`  - ${a.reference_number || a.id.slice(0,8)} - Status: ${a.status || a.status_id}`);
    });
  }
}

testConnection().catch(console.error);
