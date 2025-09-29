// File: /functions/storeKey.js

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({
      success: false,
      error: "Only POST requests are allowed."
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }


  // Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: "Invalid JSON in request body."
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { originalKey, replacementKey } = body;

  // Validate parameters
  if (!originalKey || !replacementKey) {
    return new Response(JSON.stringify({
      success: false,
      error: "Both 'originalKey' and 'replacementKey' must be provided."
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const kvKey = `short_${replacementKey}|`; // Prefix as requested

  try {
    // Check if the key already exists
    const existing = await env.TOKENS.get(kvKey);
    if (existing !== null) {
      return new Response(JSON.stringify({
        success: false,
        error: `Key '${replacementKey}' already exists. Choose a different replacementKey.`
      }), {
        status: 409, // Conflict
        headers: { "Content-Type": "application/json" }
      });
    }

    // Store in KV
    await env.TOKENS.put(kvKey, originalKey);

    return new Response(JSON.stringify({
      success: true,
      message: `Stored '${originalKey}' as value for key '${kvKey}'`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
