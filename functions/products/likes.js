export async function onRequestPost({ request, env }) {
  const db = env.DB;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { product_id, action } = await request.json();

    if (!product_id || !["like", "dislike", "unlike", "undislike"].includes(action)) {
      return new Response("Invalid input", { status: 400, headers: corsHeaders });
    }

    const field = action.includes("like") ? "likes" : "dislikes";
    const delta = action.startsWith("un") ? -1 : 1;

    await db
      .prepare(`
        INSERT INTO product_stats(product_id, likes, dislikes)
        VALUES (?, 0, 0)
        ON CONFLICT(product_id) DO UPDATE SET ${field} = MAX(0, ${field} + ${delta})
      `)
      .bind(product_id)
      .run();

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
