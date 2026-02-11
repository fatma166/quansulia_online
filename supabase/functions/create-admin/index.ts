import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUser?.users.find(u => u.email === 'admin@consulate.gov.sd');

    if (adminExists) {
      await supabaseAdmin.auth.admin.deleteUser(adminExists.id);
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@consulate.gov.sd',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        fullName: 'المدير العام'
      }
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'Admin user created successfully', user: data.user }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});