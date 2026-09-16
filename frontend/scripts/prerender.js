// Post-build static prerender: crawls the built SPA with headless Chrome and
// saves each route's fully-rendered HTML, so search engine crawlers get real
// content instead of an empty <div id="root"> on first load.
const path = require("path");
const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");

const buildDir = path.join(__dirname, "..", "build");
const PORT = 45678;

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/artists",
  "/events",
  "/testimonials",
  "/blog",
  "/contact",
  "/blog/bride-groom-theme-entry-ideas-2026",
  "/blog/cold-pyro-dry-ice-first-dance",
  "/blog/perfect-artist-roster-sangeet-reception",
  "/blog/corporate-event-production-checklist",
  "/blog/russian-international-artists-indian-weddings",
];

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

// Captured once, before any route is prerendered, so every route is crawled
// against the same pristine SPA shell rather than a previously-written
// (already-prerendered) index.html.
const indexHtmlTemplate = fs.readFileSync(path.join(buildDir, "index.html"));

function createServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/" || !path.extname(urlPath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(indexHtmlTemplate);
      return;
    }
    const filePath = path.join(buildDir, urlPath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(indexHtmlTemplate);
        return;
      }
      res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
}

async function run() {
  const server = createServer();
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle0", timeout: 30000 });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const html = "<!doctype html>" + (await page.evaluate(() => document.documentElement.outerHTML));
      const outDir = route === "/" ? buildDir : path.join(buildDir, route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
      console.log("Prerendered", route);
    } catch (err) {
      console.error("Failed to prerender", route, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
