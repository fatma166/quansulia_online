import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qaioxhpcyzmamcvdqqub.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaW94aHBjeXptYW1jdmRxcXViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4OTkyOSwiZXhwIjoyMDc1MjY1OTI5fQ.7y1Jb7Y2xfyL85dYs_hv1FTj8-hXD_vCCOHMSNfQjLI'
);

async function resetPassword() {
  try {
    // Update password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      '7b76ea28-3f71-4588-ac3b-a2e3d4215907',
      { password: '123456' }
    );

    if (error) {
      console.error('Error:', error.message);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('');
    console.log('Login with:');
    console.log('Employee Number: limia');
    console.log('Password: 123456');
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

resetPassword();
