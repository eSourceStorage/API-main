// /functions/write.js

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return new Response('Token parameter is required', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get origin / referer and client IP
    const origin = request.headers.get('Origin') || request.headers.get('Referer');
    const ip = request.headers.get('CF-Connecting-IP');

    if (!isAllowedDomain(origin, ip)) {
      return new Response(
        'Access denied: Only returnedmath.dev and its subdomains can write',
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      );
    }

    // Parse value
    let value = null;
    if (request.method === 'POST') {
      const contentType = request.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        try {
          const body = await request.json();
          value = body.value;
        } catch {
          return new Response('Invalid JSON body', { status: 400, headers: corsHeaders });
        }
      } else {
        value = await request.text();
      }
    }

    // Fallback to query param
    if (!value) value = url.searchParams.get('value');

    if (!value) {
      return new Response('Value parameter or POST body is required', {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // KV write
    if (!env.TOKENS) {
      return new Response('KV binding TOKENS is not configured', { status: 500 });
    }

    await env.TOKENS.put(token, value);

    return new Response('Value stored successfully', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
}

// Domain check helper
function isAllowedDomain(origin, ip) {
  // Allow server-to-server requests from Vercel frontend
  if (!origin && ip === '76.76.21.21') return true;

  if (!origin) return false;

  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    return hostname === 'returnedmath.dev' || hostname.endsWith('.returnedmath.dev');
  } catch {
    return false;
  }
}
