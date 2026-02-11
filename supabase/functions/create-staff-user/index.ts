import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "غير مصرح" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userMetadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};
    const userRole = userMetadata.role || appMetadata.role;

    if (!["admin", "super_admin"].includes(userRole)) {
      return new Response(
        JSON.stringify({ error: "ممنوع: يجب أن تكون مشرف لإضافة موظفين" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      email,
      password,
      username,
      employee_number,
      full_name_ar,
      full_name_en,
      phone,
      role_id,
      department_id,
      region_id,
      hire_date,
      role_name,
    } = await req.json();

    // username is now required instead of employee_number
    if (!email || !password || !username || !full_name_ar || !role_id) {
      return new Response(
        JSON.stringify({ error: "بيانات مطلوبة ناقصة (email, password, username, full_name_ar, role_id)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_]+$/.test(username) || username.length < 3 || username.length > 30) {
      return new Response(
        JSON.stringify({ error: "اسم المستخدم غير صالح - يجب أن يحتوي على حروف صغيرة وأرقام و_ فقط (3-30 حرف)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: role_name || "staff",
        full_name_ar,
        full_name_en,
        username, // الحقل الأساسي الجديد
        employee_number: employee_number || null, // اختياري
      },
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("staff")
      .insert({
        user_id: newUser.user.id,
        username, // الحقل الأساسي الجديد
        employee_number: employee_number || null, // اختياري
        full_name_ar,
        full_name_en,
        email,
        phone,
        role_id,
        department_id,
        region_id,
        hire_date: hire_date || new Date().toISOString().split("T")[0],
        status: "active",
        is_active: true,
      })
      .select()
      .single();

    if (staffError) {
      console.error("Error creating staff record:", staffError);

      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);

      return new Response(
        JSON.stringify({ error: staffError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser.user,
        staff: staffData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});