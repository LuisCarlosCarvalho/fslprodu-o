
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { approvalId } = await req.json()

    if (!approvalId) {
      throw new Error('Approval ID is required')
    }

    // 1. Get approval record
    const { data: approval, error: approvalError } = await supabaseClient
      .from('user_approvals')
      .select('*')
      .eq('id', approvalId)
      .single()

    if (approvalError || !approval) {
      throw new Error('Approval request not found')
    }

    if (approval.status !== 'pending') {
      throw new Error('Request already processed')
    }

    // 2. Create Auth User
    // Use a temp password or just generate one. 
    // In a real flow we might send a custom invite, but createUser is easier usually.
    // We will set a temporary password and tell them to reset it, or use the email invite method.
    // Let's use createUser with a random password and verified email.
    
    // Simple random password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!"; 

    const { data: authUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email: approval.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: approval.full_name,
        role: 'client' // important
      }
    })

    if (createUserError) {
      throw createUserError
    }

    // 3. Create Profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: approval.full_name,
        surname: approval.surname,
        nickname: approval.nickname,
        phone: approval.phone,
        nationality: approval.nationality,
        zip_code: approval.zip_code,
        // Map jsonb address back to columns if needed, or update schema to use jsonb.
        // My previous schema used columns. I'll allow nulls or map what i can.
        // The jsonb address in user_approvals likely has: street, city, etc.
        street: approval.address?.street,
        number: approval.address?.number,
        complement: approval.address?.complement,
        neighborhood: approval.address?.neighborhood,
        city: approval.address?.city,
        state: approval.address?.state,
        country: approval.address?.country,
        role: 'client'
      })

    if (profileError) {
      // Cleanup auth user?
      console.error('Profile creation failed', profileError)
    }

    // 4. Update Approval status
    await supabaseClient
      .from('user_approvals')
      .update({
        status: 'approved',
        auth_user_id: authUser.user.id,
        decided_at: new Date().toISOString()
      })
      .eq('id', approvalId)

    // 5. Send Email (Mocked here, but layout for SMTP)
    // For now we just log it.
    console.log(`Sending approval email to ${approval.email} with password ${tempPassword}`)

    // If you have RESEND or SMTP, you would call it here.
    // fetch('https://api.resend.com/emails'...)

    return new Response(
      JSON.stringify({ success: true, message: 'User approved' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
