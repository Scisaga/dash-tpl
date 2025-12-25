const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function getMimeType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function safeJoin(root, urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const joined = path.join(root, decoded);
  const normalized = path.normalize(joined);
  const rootNormalized = path.normalize(root + path.sep);
  if (!normalized.startsWith(rootNormalized)) return null;
  return normalized;
}

function statIfExists(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function sendFile(req, res, filePath) {
  const stat = statIfExists(filePath);
  if (!stat || !stat.isFile()) return false;

  res.statusCode = 200;
  res.setHeader("Content-Type", getMimeType(filePath));
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "HEAD") return res.end();
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function sendText(res, statusCode, text) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(text);
}

function shouldSpaFallback(urlPathname) {
  if (urlPathname === "/" || urlPathname === "/index.html") return true;
  if (urlPathname.includes(".")) return false;
  return true;
}

function main() {
  const root = process.cwd();
  const port = Number(process.env.PORT || process.argv[2] || 8000);

  const server = http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return sendText(res, 405, "Method Not Allowed");
    }

    const base = `http://${req.headers.host || "localhost"}`;
    const url = new URL(req.url || "/", base);
    const pathname = url.pathname || "/";

    if (pathname === "/" || pathname === "/index.html") {
      if (sendFile(req, res, path.join(root, "index.html"))) return;
      return sendText(res, 404, "Missing index.html");
    }

    const filePath = safeJoin(root, pathname);
    if (!filePath) return sendText(res, 400, "Bad Request");

    const stat = statIfExists(filePath);
    if (stat?.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      if (sendFile(req, res, indexPath)) return;
    }

    if (sendFile(req, res, filePath)) return;

    if (shouldSpaFallback(pathname)) {
      if (sendFile(req, res, path.join(root, "index.html"))) return;
      return sendText(res, 404, "Missing index.html");
    }

    return sendText(res, 404, "Not Found");
  });

  server.listen(port, () => {
    process.stdout.write(`SPA dev server running at http://localhost:${port}/\n`);
  });
}

main();
