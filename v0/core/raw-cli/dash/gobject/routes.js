const utils = require("../../../../utils");
const runcli = require("../../../core-utils").runCliCmd;

module.exports = function(app) {
  app.get("/count", async (req, res) => {
    const data = await runcli(["gobject", "count"]);
    const obj = { count: data };
    res.json(obj);
  });

  app.get("/list", async (req, res) => {
    const data = await runcli(["gobject", "list"]);
    res.json(data);
  });

  app.get("/:hash", async (req, res) => {
    console.log(req);
    const data = await runcli(["gobject", "get", req.params.hash]);
    res.json(data);
  });
};
