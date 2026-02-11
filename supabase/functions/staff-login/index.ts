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

    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "اسم المستخدم وكلمة المرور مطلوبان" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // البحث عن الموظف باستخدام username
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("staff")
      .select("email, full_name_ar, role_id, user_id, username, employee_number, permissions, can_access_all_services, can_access_all_regions, roles(name, name_ar)")
      .eq("username", username.toLowerCase()) // تحويل إلى lowercase للمقارنة
      .eq("is_active", true)
      .maybeSingle();

    if (staffError || !staffData) {
      return new Response(
        JSON.stringify({ error: "اسم المستخدم غير موجود" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // تسجيل دخول باستخدام البريد الإلكتروني
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: staffData.email,
      password: password,
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: "كلمة المرور غير صحيحة" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // إرجاع بيانات الموظف والجلسة
    const userRole = authData.user.user_metadata?.role || staffData.roles?.name || "staff";

    // معالجة permissions سواء كانت array أو object
    let processedPermissions = [];
    let dashboardSections = [];
    let allowedRegions = [];
    let allowedServices = [];
    let allowedStatuses = [];

    if (userRole === "super_admin") {
      processedPermissions = ["all"];
    } else if (staffData.permissions) {
      if (Array.isArray(staffData.permissions)) {
        // إذا كانت array، استخدمها مباشرة
        processedPermissions = staffData.permissions;
      } else {
        // إذا كانت object، استخرج dashboard_sections
        processedPermissions = staffData.permissions.dashboard_sections || [];
        dashboardSections = staffData.permissions.dashboard_sections || [];
        allowedRegions = staffData.permissions.allowed_regions || [];
        allowedServices = staffData.permissions.allowed_services || [];
        allowedStatuses = staffData.permissions.allowed_statuses || [];
      }
    }

    const staffUser = {
      id: authData.user.id,
      username: staffData.username, // استخدام username الفعلي
      employeeNumber: staffData.employee_number || null, // إضافة employee_number كحقل منفصل
      fullName: staffData.full_name_ar,
      role: userRole,
      permissions: processedPermissions,
      dashboardSections: dashboardSections,
      allowedRegions: allowedRegions,
      allowedServices: allowedServices,
      allowedStatuses: allowedStatuses,
      canAccessAllServices: staffData.can_access_all_services || false,
      canAccessAllRegions: staffData.can_access_all_regions || false,
      email: authData.user.email,
      lastLogin: new Date().toISOString(),
      isActive: true,
      staffRecord: staffData,
      session: authData.session,
    };

    return new Response(
      JSON.stringify({
        success: true,
        user: staffUser,
        session: authData.session,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "حدث خطأ غير متوقع" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});