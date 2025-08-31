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
    // Clone headers and remove host (Cloudflare may block it)
    const headers = new Headers(request.headers);
    headers.delete("host");

    // Get the request body (Cloudflare Request body can be read as ArrayBuffer)
    const body = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
      ? await request.arrayBuffer()
      : undefined;

    // Fetch the target URL
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    // Clone response headers
    const responseHeaders = new Headers(res.headers);
    // Cloudflare sometimes blocks certain headers; remove 'content-encoding' if needed
    responseHeaders.delete("content-encoding");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
