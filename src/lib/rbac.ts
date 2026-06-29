// src/lib/rbac.ts
// Feature 11: Role-Based Access Control
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export type Role = "global_admin" | "org_admin" | "analyst" | "auditor" | "viewer";

export const PERMISSIONS: Record<string, Role[]> = {
  // Cases
  "cases:read": ["global_admin", "org_admin", "analyst", "auditor", "viewer"],
  "cases:write": ["global_admin", "org_admin", "analyst"],
  "cases:delete": ["global_admin", "org_admin"],
  "cases:assign": ["global_admin", "org_admin", "analyst"],
  // Reports
  "reports:read": ["global_admin", "org_admin", "analyst", "auditor", "viewer"],
  "reports:delete": ["global_admin", "org_admin"],
  // Audit Log
  "audit:read": ["global_admin", "org_admin", "auditor"],
  // API Keys
  "apikeys:manage": ["global_admin", "org_admin"],
  // Webhooks
  "webhooks:manage": ["global_admin", "org_admin"],
  // Analytics
  "analytics:read": ["global_admin", "org_admin", "analyst", "auditor"],
  // Batch
  "batch:submit": ["global_admin", "org_admin", "analyst"],
  "batch:read": ["global_admin", "org_admin", "analyst", "auditor"],
  // Notifications
  "notifications:send": ["global_admin", "org_admin", "analyst"],
};

export async function getUserRole(userId: string): Promise<{
  role: Role | null;
  org_id: string | null;
  org_name: string | null;
  status: string | null;
  org_status: string | null;
}> {
  let userEmail: string | undefined;
  
  // 1. Try to fetch email from Auth Admin
  try {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
    userEmail = authData?.user?.email;
  } catch (err) {
    console.error("Error fetching user from auth admin:", err);
  }

  // 2. Fallback to public users table
  if (!userEmail) {
    try {
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("user_id", userId)
        .maybeSingle();
      userEmail = userData?.email;
    } catch (err) {
      console.error("Error fetching user from users table:", err);
    }
  }

  // Override/Ensure global_admin role for the specified email
  if (userEmail && userEmail.trim().toLowerCase() === "gideonakodi@gmail.com") {
    return {
      role: "global_admin",
      org_id: null,
      org_name: null,
      status: "active",
      org_status: null,
    };
  }

  // 3. Auto-accept pending organization invitations if any exist
  if (userEmail) {
    try {
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from("org_invitations")
        .select("*")
        .eq("invited_email", userEmail)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (invite && !inviteError) {
        if (new Date(invite.expires_at) > new Date()) {
          // Check if they already have this role mapping to prevent constraint violations
          const { data: existingRole } = await supabaseAdmin
            .from("user_roles")
            .select("id")
            .eq("user_id", userId)
            .eq("org_id", invite.org_id)
            .limit(1)
            .maybeSingle();

          if (!existingRole) {
            const { error: roleError } = await supabaseAdmin
              .from("user_roles")
              .insert({
                user_id: userId,
                org_id: invite.org_id,
                role: invite.role,
                status: "active",
              });

            if (!roleError) {
              await supabaseAdmin
                .from("org_invitations")
                .update({ status: "accepted" })
                .eq("invitation_id", invite.invitation_id);
            } else {
              console.error("Error auto-assigning user role:", roleError);
            }
          } else {
            // Already mapped, just update invitation status to accepted
            await supabaseAdmin
              .from("org_invitations")
              .update({ status: "accepted" })
              .eq("invitation_id", invite.invitation_id);
          }
        } else {
          // Invitation expired
          await supabaseAdmin
            .from("org_invitations")
            .update({ status: "expired" })
            .eq("invitation_id", invite.invitation_id);
        }
      }
    } catch (err) {
      console.error("Error auto-accepting organization invitation:", err);
    }
  }

  const { data } = await supabaseAdmin
    .from("user_roles")
    .select(`
      role,
      status,
      org_id,
      organisations (
        name,
        status
      )
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return {
      role: null,
      org_id: null,
      org_name: null,
      status: null,
      org_status: null,
    };
  }

  const org = data.organisations as any;

  return {
    role: data.role as Role,
    org_id: data.org_id,
    org_name: org?.name ?? null,
    status: data.status,
    org_status: org?.status ?? null,
  };
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const { role } = await getUserRole(userId);
  if (!role) return false;
  const allowed = PERMISSIONS[permission] ?? [];
  return allowed.includes(role);
}

export function requirePermission(permission: string, role: Role): boolean {
  const allowed = PERMISSIONS[permission] ?? [];
  return allowed.includes(role);
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  global_admin: "Global administrator with platform-wide management access.",
  org_admin: "Full access — manage users, API keys, webhooks, and all data.",
  analyst: "Analyse documents, manage cases, send notifications.",
  auditor: "Read-only access to reports, cases, and audit log. Cannot modify.",
  viewer: "Read-only access to reports and analytics.",
};
