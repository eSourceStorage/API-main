// functions/proxy.js

export async function onRequest(context) {
  const { request, url } = context;

  // Extract the "url" query parameter
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Clone headers and remove Host (Cloudflare will handle it)
  const headers = new Headers(request.headers);
  headers.delete("host");

  // Prepare options for fetch
  const fetchOptions = {
    method: request.method,
    headers,
    // Only include the body for methods that allow it
    body: ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
      ? request.body
      : undefined,
    redirect: "manual",
  };

  try {
    const res = await fetch(targetUrl, fetchOptions);

    // Clone the response headers
    const responseHeaders = new Headers(res.headers);

    // Return the response as-is
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
