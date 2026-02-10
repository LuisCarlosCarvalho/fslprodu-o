import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const trigger = url.searchParams.get('trigger')
  const state = url.searchParams.get('state')

  const redirectUri = `${SUPABASE_URL}/functions/v1/auth-google-callback`
  console.log(`[OAuth] Using Redirect URI: ${redirectUri}`)

  if (trigger === 'login') {
    const userId = url.searchParams.get('userId')
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/webmasters email openid profile')}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${userId}`
    
    return Response.redirect(googleAuthUrl, 302)
  }

  if (!code) {
    return new Response(JSON.stringify({ error: 'No code provided' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID || '',
      client_secret: GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenResponse.json()
  if (tokens.error) {
    console.error(`[OAuth] Token exchange error: ${tokens.error}`)
    return new Response(JSON.stringify({ error: tokens.error_description }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  })
  const userInfo = await userInfoResponse.json()

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
  
  const { error: dbError } = await supabase
    .from('google_integrations')
    .upsert({
      user_id: state || 'USER_ID_NOT_FOUND',
      email: userInfo.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })

  if (dbError) {
    console.error(`[OAuth] DB Error: ${dbError.message}`)
    return new Response(JSON.stringify({ error: 'Failed to save integration' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const origin = url.origin.includes('supabase.co') ? 'http://localhost:5173' : url.origin
  return Response.redirect(`${origin}/admin?tab=traffic&connected=true`, 302)
})
