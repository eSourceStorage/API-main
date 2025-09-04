// /functions/read.js

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!token) {
    return new Response('Token parameter is required', {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  }

  const value = await env.TOKENS.get(token)
  if (value === null) {
    return new Response('Token not found', {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  }

  return new Response(value, {
    headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
  })
}
