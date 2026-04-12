import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "اسم المستخدم وكلمة المرور مطلوبان" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Look up staff record by username
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("staff")
      .select("email, full_name_ar, role_id, user_id, username, employee_number, permissions, can_access_all_services, can_access_all_regions, roles(name)")
      .eq("username", normalizedUsername)
      .eq("is_active", true)
      .maybeSingle();

    if (staffError && staffError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ error: "حدث خطأ أثناء البحث عن المستخدم" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailToAuth: string;
    let isAdminFallback = false;

    if (staffData) {
      emailToAuth = staffData.email;
    } else {
      // No staff record found — attempt to find an auth user whose email prefix matches username
      // This handles super_admin accounts not in the staff table
      const { data: usersPage, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

      if (listError || !usersPage) {
        return new Response(
          JSON.stringify({ error: "اسم المستخدم غير موجود" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const matchedUser = usersPage.users.find((u) => {
        const meta = u.user_metadata || {};
        const storedUsername = (meta.username || "").toLowerCase();
        const emailPrefix = u.email ? u.email.split("@")[0].toLowerCase() : "";
        return storedUsername === normalizedUsername || emailPrefix === normalizedUsername;
      });

      if (!matchedUser || !matchedUser.email) {
        return new Response(
          JSON.stringify({ error: "اسم المستخدم غير موجود" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      emailToAuth = matchedUser.email;
      isAdminFallback = true;
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: emailToAuth,
      password,
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: "كلمة المرور غير صحيحة" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const meta = authData.user.user_metadata || {};
    const userRole = meta.role || staffData?.roles?.name || "staff";

    let processedPermissions: string[] = [];
    let dashboardSections: string[] = [];
    let allowedRegions: string[] = [];
    let allowedServices: string[] = [];
    let allowedStatuses: string[] = [];

    if (userRole === "super_admin" || isAdminFallback) {
      processedPermissions = ["all"];
    } else if (staffData?.permissions) {
      if (Array.isArray(staffData.permissions)) {
        processedPermissions = staffData.permissions;
      } else {
        processedPermissions = staffData.permissions.dashboard_sections || [];
        dashboardSections = staffData.permissions.dashboard_sections || [];
        allowedRegions = staffData.permissions.allowed_regions || [];
        allowedServices = staffData.permissions.allowed_services || [];
        allowedStatuses = staffData.permissions.allowed_statuses || [];
      }
    }

    const staffUser = {
      id: authData.user.id,
      username: staffData?.username || normalizedUsername,
      employeeNumber: staffData?.employee_number || null,
      fullName: staffData?.full_name_ar || meta.fullName || meta.full_name || authData.user.email,
      role: userRole === "super_admin" || isAdminFallback ? "super_admin" : userRole,
      permissions: processedPermissions,
      dashboardSections,
      allowedRegions,
      allowedServices,
      allowedStatuses,
      canAccessAllServices: staffData?.can_access_all_services || isAdminFallback || false,
      canAccessAllRegions: staffData?.can_access_all_regions || isAdminFallback || false,
      email: authData.user.email,
      lastLogin: new Date().toISOString(),
      isActive: true,
    };

    return new Response(
      JSON.stringify({ success: true, user: staffUser, session: authData.session }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
