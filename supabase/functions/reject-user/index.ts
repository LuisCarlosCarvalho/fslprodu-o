
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

    const { approvalId, reason } = await req.json()

    if (!approvalId) {
      throw new Error('Approval ID is required')
    }

    // 1. Update Approval status
    const { data: approval, error } = await supabaseClient
      .from('user_approvals')
      .update({
        status: 'rejected',
        decision_note: reason,
        decided_at: new Date().toISOString()
      })
      .eq('id', approvalId)
      .select()
      .single()

    if (error) throw error

    // 2. Send Rejection Email (Mocked)
    console.log(`Sending rejection email to ${approval.email}`)

    return new Response(
      JSON.stringify({ success: true, message: 'User rejected' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
