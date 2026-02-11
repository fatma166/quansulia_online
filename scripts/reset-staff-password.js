import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4OTkyOSwiZXhwIjoyMDc1MjY1OTI5fQ.7y1Jb7Y2xfyL85dYs_hv1FTj8-hXD_vCCOHMSNfQjLI',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const employeeNumber = process.argv[2];
const newPassword = process.argv[3];

if (!employeeNumber || !newPassword) {
  console.error('❌ Usage: node reset-staff-password.js <employee_number> <new_password>');
  process.exit(1);
}

async function resetPassword() {
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('user_id, employee_number, full_name_ar')
    .eq('employee_number', employeeNumber)
    .maybeSingle();

  if (staffError || !staffData) {
    console.error('❌ Error: الموظف غير موجود');
    process.exit(1);
  }

  const { data, error } = await supabase.auth.admin.updateUserById(
    staffData.user_id,
    { password: newPassword }
  );

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success! Password updated');
    console.log('');
    console.log('📋 Login details:');
    console.log(`   Employee Number: ${staffData.employee_number}`);
    console.log(`   Name: ${staffData.full_name_ar}`);
    console.log(`   Password: ${newPassword}`);
    console.log('');
  }
}

resetPassword();
