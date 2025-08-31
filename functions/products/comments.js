export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const db = env.DB;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const product_id = url.searchParams.get("product_id");
  if (!product_id) {
    return new Response("Missing product_id", { status: 400, headers: corsHeaders });
  }

  const comments = await db
    .prepare(
      `SELECT id, content, created_at
       FROM comments
       WHERE product_id = ?
       ORDER BY created_at DESC`
    )
    .bind(product_id)
    .all();

  return new Response(JSON.stringify(comments.results), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.DB;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const { product_id, content } = await request.json();

  if (!product_id || !content) {
    return new Response("Missing fields", { status: 400, headers: corsHeaders });
  }

  await db
    .prepare(`INSERT INTO comments (product_id, content) VALUES (?, ?)`)
    .bind(product_id, content)
    .run();

  return new Response("Comment added", { status: 200, headers: corsHeaders });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
