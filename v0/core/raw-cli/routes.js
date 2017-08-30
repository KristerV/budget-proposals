const utils = require("../../utils");
const runcli = require("../core-utils").runCliCmd;

module.exports = function(app) {
  app.get("/", async (req, res) => {
    const data = await runcli("getgovernanceinfo");
    res.json(data);
  });
};
