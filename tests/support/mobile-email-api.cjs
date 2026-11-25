const { createServer } = require("node:http");
const used = new Set(),
  calls = [];
const json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};
createServer(async (req, res) => {
  if (req.url === "/health") return json(res, 200, { status: "ok" });
  if (req.url === "/_test/reset") {
    used.clear();
    calls.length = 0;
    return json(res, 200, {});
  }
  if (req.url === "/_test/calls") return json(res, 200, calls);
  if (!["/api/auth/verify-email", "/api/auth/reset-password"].includes(req.url))
    return json(res, 404, {});
  let text = "";
  for await (const chunk of req) text += chunk;
  const body = JSON.parse(text);
  calls.push({
    path: req.url,
    body,
    authorization: req.headers.authorization ?? null,
    cookie: req.headers.cookie ?? null,
  });
  if (body.token === "service-offline-fixture-123456")
    return json(res, 503, {
      error: { message: "Serviço temporariamente indisponível." },
    });
  if (body.token === "invalid-response-fixture-123456") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<html>Not an API response</html>");
    return;
  }
  if (used.has(body.token))
    return json(res, 410, {
      error: {
        code: "TOKEN_EXPIRED",
        message: "Este link expirou ou já foi utilizado.",
      },
    });
  used.add(body.token);
  json(res, 200, {
    message: req.url.endsWith("verify-email")
      ? "E-mail confirmado no aplicativo."
      : "Senha redefinida no aplicativo.",
  });
}).listen(4327, "127.0.0.1");
