import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SendOTPRequest {
  phoneNumber: string;
  applicationId?: string;
}

interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname;

    // Generate and send OTP
    if (path.endsWith('/send') && req.method === 'POST') {
      const { phoneNumber, applicationId }: SendOTPRequest = await req.json();

      if (!phoneNumber) {
        return new Response(
          JSON.stringify({ error: 'رقم الموبايل مطلوب' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check for recent OTP (rate limiting - 1 minute)
      const { data: recentOTP } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('verified', false)
        .gte('created_at', new Date(Date.now() - 60000).toISOString())
        .maybeSingle();

      if (recentOTP) {
        return new Response(
          JSON.stringify({
            error: 'يرجى الانتظار دقيقة واحدة قبل إعادة إرسال الرمز',
            remainingTime: Math.ceil((new Date(recentOTP.created_at).getTime() + 60000 - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save OTP to database
      const { data: otpRecord, error: insertError } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: phoneNumber,
          otp_code: otpCode,
          application_id: applicationId || null,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // TODO: Integration with SMS provider (Twilio, AWS SNS, etc.)
      // For testing, we'll return the OTP code in the response
      console.log(`OTP Code for ${phoneNumber}: ${otpCode}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'تم إرسال رمز التحقق إلى رقم الموبايل',
          // ONLY FOR TESTING - Remove in production
          testOTP: otpCode,
          expiresAt: expiresAt.toISOString(),
          otpId: otpRecord.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify OTP
    if (path.endsWith('/verify') && req.method === 'POST') {
      const { phoneNumber, otpCode }: VerifyOTPRequest = await req.json();

      if (!phoneNumber || !otpCode) {
        return new Response(
          JSON.stringify({ error: 'رقم الموبايل ورمز التحقق مطلوبان' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Find the OTP
      const { data: otpRecord, error: findError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otpCode)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      if (!otpRecord) {
        return new Response(
          JSON.stringify({ error: 'رمز التحقق غير صحيح' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(otpRecord.expires_at);

      if (now > expiresAt) {
        return new Response(
          JSON.stringify({ error: 'رمز التحقق منتهي الصلاحية' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check attempts
      if (otpRecord.attempts >= 5) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز الحد الأقصى لمحاولات التحقق' }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('otp_verifications')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
          attempts: otpRecord.attempts + 1,
        })
        .eq('id', otpRecord.id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'تم التحقق من رقم الموبايل بنجاح',
          verificationId: otpRecord.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Invalid endpoint
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ في الخادم' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});