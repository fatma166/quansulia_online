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

    const authHeader = req.headers.get("Authorization");

    if (authHeader) {
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
          JSON.stringify({ error: "ممنوع: يجب أن تكون مشرف" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const { username, employee_number, staff_id, new_password } = await req.json();

    // يمكن استخدام username أو employee_number أو staff_id
    if ((!username && !employee_number && !staff_id) || !new_password) {
      return new Response(
        JSON.stringify({ error: "Missing username/employee_number/staff_id or new_password" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let query = supabaseAdmin
      .from("staff")
      .select("user_id, username, employee_number, full_name_ar")
      .eq("is_active", true);

    if (staff_id) {
      query = query.eq("id", staff_id);
    } else if (username) {
      query = query.eq("username", username.toLowerCase());
    } else if (employee_number) {
      query = query.eq("employee_number", employee_number);
    }

    const { data: staffData, error: staffError } = await query.maybeSingle();

    if (staffError || !staffData) {
      return new Response(
        JSON.stringify({ error: "الموظف غير موجود" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      staffData.user_id,
      { password: new_password }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "فشل تحديث كلمة المرور" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "تم تحديث كلمة المرور بنجاح",
        employee: {
          username: staffData.username,
          employeeNumber: staffData.employee_number || null,
          name: staffData.full_name_ar
        }
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