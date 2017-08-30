const express = require("express");
const createRouter = require("express-promise-router");
const app = express();
const requireAll = require("require-all");
const utilsV0 = require("./v0/utils");
const middlewareV0 = require("./v0/middleware");

app.use(function(req, res, next) {
  // Format JSON properly
  res.header("Content-Type", "application/json");

  // Allow all CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Also needed to format JSON when using res.json()
app.set("json spaces", 4);

// Find all routes.js files
const allRoutes = requireAll({
  dirname: __dirname,
  filter: /^routes\.js$/,
  excludeDirs: /^(\.git|node_modules)$/,
  recursive: true
});

// Import all routes
let allRoutesStrings = [];
function importObject(obj, currentRoute) {
  const router = createRouter();
  app.use(currentRoute, router);
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    if (typeof obj[key] === "function")
      obj[key](router); // Import
    else importObject(obj[key], currentRoute + "/" + key); // Recurse
  }
  router.stack.forEach(function(r) {
    if (r.route && r.route.path) {
      allRoutesStrings.push(currentRoute + r.route.path);
    }
  });
}
importObject(allRoutes, "");

// Root route
app.get("/", async (req, res) => {
  const fullUrl = utilsV0.getFullUrl(req);
  let routesUrls = [];
  allRoutesStrings.forEach(r => routesUrls.push(fullUrl + r));
  const data = { "All available endpoints": routesUrls.sort() };
  res.json(data);
});

app.use(middlewareV0.errors());

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
