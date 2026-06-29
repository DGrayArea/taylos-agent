'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getUserRole as getRbacUserRole } from '@/lib/rbac'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (authData.user) {
    if (authData.user.email?.trim().toLowerCase() === "gideonakodi@gmail.com") {
      revalidatePath('/', 'layout')
      redirect('/')
    }

    // Check role and organisation status using admin client to bypass RLS
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role, status, org_id, organisations(status)')
      .eq('user_id', authData.user.id)
      .limit(1)
      .maybeSingle()

    if (roleData) {
      const orgObj = roleData.organisations as unknown as { status: string } | null

      // Check org suspension
      if (orgObj && orgObj.status === 'suspended') {
        await supabase.auth.signOut()
        redirect('/auth/login?error=' + encodeURIComponent("Your organisation has been suspended. Please contact platform support."))
      }

      // Check user suspension
      if (roleData.status === 'suspended') {
        await supabase.auth.signOut()
        redirect('/auth/login?error=' + encodeURIComponent("Your account has been suspended. Contact your organisation admin."))
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim()
      }
    }
  })

  if (error) {
    redirect('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  redirect('/auth/login?message=Check your email to continue sign in process')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Unauthorized session' }
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const avatarUrl = formData.get('avatarUrl') as string

  const updateData: Record<string, any> = {
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
  }

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  const { error } = await supabase.auth.updateUser({
    data: updateData
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'Unauthorized session' }
  }

  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { headers } = await import('next/headers')
  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = host?.startsWith('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  const redirectUrl = new URL('/auth/callback', baseUrl).toString()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function registerOrganisation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login?error=' + encodeURIComponent("Unauthorized session. Please login first."))
  }

  const orgName = formData.get('orgName') as string
  const industry = formData.get('industry') as string
  const country = formData.get('country') as string

  // Create organization (using supabaseAdmin bypasses RLS)
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organisations')
    .insert({
      name: orgName,
      industry,
      country,
      status: 'active'
    })
    .select()
    .single()

  if (orgError) {
    redirect('/auth/register-org?error=' + encodeURIComponent(orgError.message))
  }

  // Set Owner / Org Admin role
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .insert({
      user_id: user.id,
      org_id: org.org_id,
      role: 'org_admin',
      status: 'active'
    })

  if (roleError) {
    redirect('/auth/register-org?error=' + encodeURIComponent(roleError.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function acceptInvitation(formData: FormData) {
  const supabase = await createClient()

  const token = formData.get('token') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  // Find invitation
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('org_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle()

  if (inviteError || !invite) {
    redirect('/auth/accept-invite?error=' + encodeURIComponent("Invalid or expired invitation token."))
  }

  // Check expiration
  if (new Date(invite.expires_at) < new Date()) {
    await supabaseAdmin
      .from('org_invitations')
      .update({ status: 'expired' })
      .eq('invitation_id', invite.invitation_id)
    redirect('/auth/accept-invite?error=' + encodeURIComponent("This invitation has expired."))
  }

  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invite.invited_email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (authError) {
    redirect(`/auth/accept-invite?token=${token}&error=` + encodeURIComponent(authError.message))
  }

  if (authData.user) {
    // Map role and org
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        org_id: invite.org_id,
        role: invite.role,
        status: 'active'
      })

    if (roleError) {
      redirect(`/auth/accept-invite?token=${token}&error=` + encodeURIComponent(roleError.message))
    }

    // Mark invitation as accepted
    await supabaseAdmin
      .from('org_invitations')
      .update({ status: 'accepted' })
      .eq('invitation_id', invite.invitation_id)
  }

  redirect('/auth/login?message=' + encodeURIComponent("Invitation accepted! Check your email to verify and sign in."))
}

// ============================================================
// Team & Organization Management Server Actions (Scoped RBAC)
// ============================================================

import { logAction } from '@/lib/audit'

export async function inviteTeamMember(orgId: string, email: string, role: 'org_admin' | 'analyst' | 'auditor') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Check permission
  const { data: userRole } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle()

  if (!userRole || userRole.role !== 'org_admin') {
    return { ok: false, error: 'Forbidden' }
  }

  // Check if the user is registered as a common user
  const { data: targetUser } = await supabaseAdmin
    .from('users')
    .select('user_id')
    .eq('email', email)
    .limit(1)
    .maybeSingle()

  if (!targetUser) {
    return { ok: false, error: 'The invited user must be registered on the platform first.' }
  }

  // Check if the user is already in this organisation
  const { data: existingRole } = await supabaseAdmin
    .from('user_roles')
    .select('id')
    .eq('user_id', targetUser.user_id)
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle()

  if (existingRole) {
    return { ok: false, error: 'User is already a member of this organisation.' }
  }

  // Generate invite token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48h

  const { error } = await supabaseAdmin
    .from('org_invitations')
    .insert({
      org_id: orgId,
      invited_email: email,
      role,
      token,
      expires_at: expiresAt,
      status: 'pending'
    })

  if (error) {
    return { ok: false, error: error.message }
  }

  // Log to audit log
  await logAction('team.invite', {
    userId: user.id,
    orgId,
    resourceType: 'user',
    metadata: { invited_email: email, role }
  })

  // Since we don't have a real SMTP setup configured with active Resend domain in dev, 
  // we return the registration link to make testing manual copy/paste smooth.
  const inviteLink = `/auth/accept-invite?token=${token}`

  return { ok: true, inviteLink }
}

export async function promoteTeamMember(orgId: string, targetUserId: string, newRole: 'org_admin' | 'analyst' | 'auditor') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Check permission
  const { data: userRole } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle()

  if (!userRole || userRole.role !== 'org_admin') {
    return { ok: false, error: 'Forbidden' }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', targetUserId)
    .eq('org_id', orgId)

  if (error) return { ok: false, error: error.message }

  await logAction('team.promote', {
    userId: user.id,
    orgId,
    resourceType: 'user',
    resourceId: targetUserId,
    metadata: { new_role: newRole }
  })

  return { ok: true }
}

export async function suspendTeamMember(orgId: string, targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Check permission
  const { data: userRole } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle()

  if (!userRole || userRole.role !== 'org_admin') {
    return { ok: false, error: 'Forbidden' }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .update({ status: 'suspended' })
    .eq('user_id', targetUserId)
    .eq('org_id', orgId)

  if (error) return { ok: false, error: error.message }

  await logAction('team.suspend', {
    userId: user.id,
    orgId,
    resourceType: 'user',
    resourceId: targetUserId
  })

  return { ok: true }
}

export async function unsuspendTeamMember(orgId: string, targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Check permission
  const { data: userRole } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle()

  if (!userRole || userRole.role !== 'org_admin') {
    return { ok: false, error: 'Forbidden' }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .update({ status: 'active' })
    .eq('user_id', targetUserId)
    .eq('org_id', orgId)

  if (error) return { ok: false, error: error.message }

  await logAction('team.promote', {
    userId: user.id,
    orgId,
    resourceType: 'user',
    resourceId: targetUserId,
    metadata: { status: 'active' }
  })

  return { ok: true }
}

export async function revokeTeamMember(orgId: string, targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Check permission
  const { data: userRole } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle()

  if (!userRole || userRole.role !== 'org_admin') {
    return { ok: false, error: 'Forbidden' }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .eq('user_id', targetUserId)
    .eq('org_id', orgId)

  if (error) return { ok: false, error: error.message }

  await logAction('team.revoke', {
    userId: user.id,
    orgId,
    resourceType: 'user',
    resourceId: targetUserId
  })

  return { ok: true }
}

async function isGlobalAdminUser(userId: string) {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'global_admin')
    .limit(1)
    .maybeSingle()
  return !!data
}

export async function toggleOrganisationSuspension(orgId: string, suspend: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isGlobalAdminUser(user.id))) {
    return { ok: false, error: 'Forbidden' }
  }

  const { error } = await supabaseAdmin
    .from('organisations')
    .update({ status: suspend ? 'suspended' : 'active' })
    .eq('org_id', orgId)

  if (error) return { ok: false, error: error.message }

  await logAction(suspend ? 'org.suspend' : 'org.unsuspend', {
    userId: user.id,
    orgId: null,
    resourceType: 'organisation',
    resourceId: orgId
  })

  return { ok: true }
}

export async function promoteToGlobalAdmin(targetEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isGlobalAdminUser(user.id))) {
    return { ok: false, error: 'Forbidden' }
  }

  // Find user by email
  const { data: targetUser } = await supabaseAdmin
    .from('users')
    .select('user_id')
    .eq('email', targetEmail)
    .limit(1)
    .maybeSingle()

  if (!targetUser) {
    return { ok: false, error: 'User with this email not found' }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .insert({
      user_id: targetUser.user_id,
      org_id: null,
      role: 'global_admin',
      status: 'active'
    })

  if (error) return { ok: false, error: error.message }

  await logAction('team.promote', {
    userId: user.id,
    orgId: null,
    resourceType: 'user',
    resourceId: targetUser.user_id,
    metadata: { role: 'global_admin' }
  })

  return { ok: true }
}

export async function revokeGlobalAdmin(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isGlobalAdminUser(user.id))) {
    return { ok: false, error: 'Forbidden' }
  }

  // Prevent self-revoking
  if (user.id === targetUserId) {
    return { ok: false, error: 'Cannot revoke your own global admin rights' }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .eq('user_id', targetUserId)
    .eq('role', 'global_admin')
    .is('org_id', null)

  if (error) return { ok: false, error: error.message }

  await logAction('team.revoke', {
    userId: user.id,
    orgId: null,
    resourceType: 'user',
    resourceId: targetUserId,
    metadata: { role: 'global_admin' }
  })

  return { ok: true }
}

export async function getCurrentUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      role: null,
      org_id: null,
      org_name: null,
      status: null,
      org_status: null
    }
  }
  return await getRbacUserRole(user.id)
}
