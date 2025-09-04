// /functions/generate.js

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const prefixes = [
    'returnedmath_', 'webconfig_', 'bruh_', 'easyposispro_', 'ok_',
    'notok_', 'hi_', 'toilet_', 'uarepro_', 'pls_', 'returnedmathishungry_'
  ]
  const selectedPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  token = selectedPrefix + token

  return new Response(JSON.stringify({ token }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
