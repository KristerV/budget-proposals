const utils = require("../../../utils");
const runcli = require("../../core-utils").runCliCmd;

module.exports = function(app) {
  const commands = ["getmininginfo"];

  commands.forEach(route => {
    app.get("/" + route, async (req, res) => {
      const data = await runcli(route);
      res.json(data);
    });
  });
};
