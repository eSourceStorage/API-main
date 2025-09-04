// /functions/write.js

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

  const origin = request.headers.get('Origin') || request.headers.get('Referer')
  if (!isAllowedDomain(origin)) {
    return new Response('Access denied: Only returnedmath.dev and its subdomains can write', {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  }

  let value = null
  if (request.method === 'POST') {
    const contentType = request.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
      const body = await request.json()
      value = body.value
    } else {
      value = await request.text()
    }
  }

  if (!value) {
    value = url.searchParams.get('value')
  }

  if (!value) {
    return new Response('Value parameter or POST body is required', {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  }

  // Store in KV (Pages Functions still use Workers KV)
  await env.TOKENS.put(token, value)

  return new Response('Value stored successfully', {
    headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
  })
}

function isAllowedDomain(origin) {
  if (!origin) return true // allow server-to-server requests
  try {
    const url = new URL(origin)
    const hostname = url.hostname.toLowerCase()
    return hostname === 'returnedmath.dev' || hostname.endsWith('.returnedmath.dev')
  } catch {
    return false
  }
}

