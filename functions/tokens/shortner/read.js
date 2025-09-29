

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({
      success: false,
      error: "'token' parameter is required in query string."
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Send POST request to external API
    const apiResponse = await fetch(`https://api.returnedmath.dev/tokens/read?token=${encodeURIComponent(token)}`, {
      method: "POST"
    });

    const data = await apiResponse.json();

    return new Response(JSON.stringify({
      success: true,
      data
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
