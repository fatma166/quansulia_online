import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword(employeeNumber, newPassword) {
  try {
    console.log(`Resetting password for employee: ${employeeNumber}`);

    // Find the staff member
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('user_id, employee_number, full_name_ar, email')
      .eq('employee_number', employeeNumber)
      .maybeSingle();

    if (staffError) {
      console.error('Error finding staff:', staffError);
      return;
    }

    if (!staff) {
      console.error('Staff member not found');
      return;
    }

    console.log('Found staff:', staff);

    // Update password using Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      staff.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('Login credentials:');
    console.log('  Employee Number:', staff.employee_number);
    console.log('  Email:', staff.email);
    console.log('  New Password:', newPassword);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get employee number and new password from command line
const employeeNumber = process.argv[2] || 'EMP266680017';
const newPassword = process.argv[3] || '123456';

resetPassword(employeeNumber, newPassword);
