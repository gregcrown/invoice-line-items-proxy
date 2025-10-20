export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const invoiceId = url.searchParams.get("invoiceId");
    const projectId = url.searchParams.get("projectId");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    if (!invoiceId) {
      return new Response(JSON.stringify({ error: "Missing invoiceId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const response = await fetch("https://app.innergy.com/api/invoiceLineItems", {
        headers: {
          "Api-Key": env.INNERGY_API_KEY
        }
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch from Innergy" }), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await response.json();
      let items = result.data || [];

      // Filter by invoiceId
      items = items.filter(item => item.invoiceId === invoiceId);

      // Optional projectId filter
      if (projectId) {
        items = items.filter(item => item.projectId === projectId);
      }

      return new Response(JSON.stringify(items.slice(0, limit)), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Internal error", detail: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};
