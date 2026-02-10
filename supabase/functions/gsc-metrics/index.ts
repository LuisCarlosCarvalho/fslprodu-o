import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { domain, startDate, endDate, token } = body
    
    console.log('[Debug] Domain:', domain)
    console.log('[Debug] Token present in body:', !!token)
    
    const authHeader = req.headers.get('Authorization')
    const finalToken = token || authHeader?.replace('Bearer ', '')
    
    let payload: any = {}
    if (finalToken) {
      try {
        const parts = finalToken.split('.')
        if (parts.length === 3) {
          payload = JSON.parse(atob(parts[1]))
        }
      } catch (e) {
        console.error('JWT Parse failed:', e)
      }
    }

    const supabase = createClient(
      SUPABASE_URL!, 
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: finalToken ? `Bearer ${finalToken}` : '' } } }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return new Response(JSON.stringify({ 
        error: 'Sua sessão não pôde ser verificada (v16)', 
        message: authError?.message || 'Token inválido',
        technical_details: authError,
        debug_jwt_ref: payload.ref || 'not_found',
        server_ref: SUPABASE_URL?.split('//')[1].split('.')[0],
        token_source: token ? 'body' : 'header'
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { data: integration, error: dbError } = await supabaseAdmin
      .from('google_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (dbError || !integration) return new Response('Integration not found', { status: 404, headers: corsHeaders })

    let accessToken = integration.access_token
    if (new Date(integration.expires_at) < new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token',
        }),
      })
      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
      
      await supabaseAdmin.from('google_integrations').update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString()
      }).eq('id', integration.id)
    }

    // Verify token scopes with Google for debugging
    try {
      const scopeCheck = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`)
      const scopeData = await scopeCheck.json()
      console.log(`[GSC Debug] Google Token Scopes: ${scopeData.scope}`)
      if (scopeData.error) {
        console.error(`[GSC Debug] Google Token Info Error: ${scopeData.error_description}`)
      }
    } catch (e) {
      console.error('[GSC Debug] Failed to verify scopes:', e)
    }

    // List of site URL formats to try
    let siteUrlsToTry = []
    if (domain.includes('://')) {
      siteUrlsToTry = [domain]
    } else {
      siteUrlsToTry = [
        `sc-domain:${domain}`,
        `https://${domain}/`,
        `https://${domain}`,
        `http://${domain}/`
      ]
    }

    let gscData = null
    let lastError = null
    let successfulSiteUrl = ''

    for (const siteUrl of siteUrlsToTry) {
      console.log(`[GSC] Trying property: ${siteUrl}`)
      const gscResponse = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0],
          dimensions: ['date']
        })
      })

      if (gscResponse.ok) {
        gscData = await gscResponse.json()
        successfulSiteUrl = siteUrl
        break
      } else {
        lastError = await gscResponse.json()
        console.warn(`[GSC] Failed for ${siteUrl}:`, lastError.error?.message || 'Forbidden')
      }
    }

    if (!gscData) {
      return new Response(JSON.stringify({ 
        error: 'Google Search Console API Error', 
        details: lastError,
        message: 'Nenhum dos formatos de domínio (sc-domain ou https) foi encontrado na sua conta GSC. Verifique se o domínio foi adicionado corretamente.',
        triedMethods: siteUrlsToTry
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log(`[GSC] Success using: ${successfulSiteUrl}`)
    
    let totalClicks = 0
    let totalImpressions = 0
    let totalCtr = 0
    let count = 0

    if (gscData.rows) {
      gscData.rows.forEach((row: any) => {
        totalClicks += row.clicks || 0
        totalImpressions += row.impressions || 0
        totalCtr += row.ctr || 0
        count++
      })
    }
    
    const result = {
      clicks: totalClicks,
      impressions: totalImpressions,
      growth: 0,
      ctr: count > 0 ? (totalCtr / count) * 100 : 0
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Internal Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
