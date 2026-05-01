export default {
  async fetch(request, env, ctx) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "content-type": "text/plain",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
      },
    });
  },
};
