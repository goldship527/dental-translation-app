import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number.parseInt(process.env.PORT || "8000", 10);
const host = process.env.HOST || "0.0.0.0";
const rootDir = fileURLToPath(new URL(".", import.meta.url));

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function resolvePath(url) {
  const requestedPath = new URL(url, `http://localhost:${port}`).pathname;
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
  return join(rootDir, relativePath);
}

function getLocalAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => item.address);
}

createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");

  if (!existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Dental translation app: http://localhost:${port}`);
  getLocalAddresses().forEach((address) => {
    console.log(`Phone on same Wi-Fi: http://${address}:${port}`);
  });
});
