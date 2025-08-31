// functions/proxy.js

export async function onRequest({ request, url }) {
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Only include body for methods that allow it
    let body;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      body = await request.arrayBuffer(); // safest way in Cloudflare
    }

    // Clone headers and remove 'host'
    const headers = new Headers(request.headers);
    headers.delete("host");

    // Fetch the target URL
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    // Clone response headers and remove problematic ones
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
