// functions/proxy.js

export async function onRequest({ request, url }) {
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Ensure the URL has a protocol
  if (!/^https?:\/\//i.test(targetUrl)) {
    return new Response(JSON.stringify({ error: "URL must start with http:// or https://" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let body;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      body = await request.arrayBuffer();
    }

    const headers = new Headers(request.headers);
    headers.delete("host"); // important for Cloudflare

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-length"); // remove content-length to avoid issues

    const responseBody = await response.arrayBuffer();

    return new Response(responseBody, {
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
