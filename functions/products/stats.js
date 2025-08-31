export async function onRequestGet({ request, env }) {
  const db = env.DB;
  const url = new URL(request.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const product_id = url.searchParams.get("product_id");
  if (!product_id) {
    return new Response("Missing product_id", { status: 400, headers: corsHeaders });
  }

  const stats = await db
    .prepare(`SELECT likes, dislikes FROM product_stats WHERE product_id = ?`)
    .bind(product_id)
    .first();

  return new Response(JSON.stringify(stats || { likes: 0, dislikes: 0 }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
